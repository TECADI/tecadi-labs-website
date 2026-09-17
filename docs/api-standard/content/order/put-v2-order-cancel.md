# API Standard TECADI — Cancelamento de Pedido

`PUT v2/order/cancel`

Permite ao cliente solicitar o cancelamento de um pedido previamente enviado pela rota `POST v2/order`.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `PUT` |
| **Caminho** | `v2/order/cancel` |
| **URL completa** | `https://{domain}/rest/v2/order/cancel` |
| **Content-Type** | `application/json` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | Empresa e filial de destino — ver [Autenticação](../autenticacao.md) |

> ⚠️ O `tenantId` precisa corresponder à filial em que o pedido foi criado. Enviar a filial errada faz a requisição retornar erro `001` (cliente sem acesso ao webservice naquela filial), mesmo que o token esteja correto e o pedido exista em outra filial.

---

## 3. Corpo da requisição

```json
{
  "order": "PEDCLI",
  "reason": "MOTIVO CANCELAMENTO"
}
```

| Campo | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `order` | String | 20 | Sim | Número do pedido do cliente — o mesmo valor enviado no campo `order` da rota `POST v2/order`. Espaços à esquerda e à direita são desconsiderados. |
| `reason` | String | Texto livre | Sim | Motivo do cancelamento. Não pode ser vazio. Fica registrado no histórico do pedido e é exibido à operação do armazém. |

Observações:

- Ambos os campos são **obrigatórios**. Requisição sem um deles, ou com o valor vazio/apenas espaços, é rejeitada com erro `002`.
- Não há campos opcionais nesta rota. Campos adicionais enviados no corpo são ignorados.
- O `reason` é texto livre e não tem limite imposto pela API, mas recomenda-se ser objetivo — ele é lido por pessoas na operação.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X PUT "https://{domain}/rest/v2/order/cancel" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "order": "PED000123",
        "reason": "Cancelamento solicitado pelo cliente final"
      }'
```

**HTTP puro**

```http
PUT /rest/v2/order/cancel HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "order": "PED000123",
  "reason": "Cancelamento solicitado pelo cliente final"
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "message": "Sucesso",
  "order": "PED000123"
}
```

### O que "sucesso" significa

O retorno `200` confirma que **a solicitação de cancelamento foi aceita e registrada**. O efeito depende do estágio em que o pedido se encontra no armazém:

| Situação do pedido | Efeito |
| --- | --- |
| Ainda sem separação iniciada | Cancelamento **imediato** |
| Já em processamento no armazém | Cancelamento **pendente** — o pedido é marcado para cancelar e a operação interrompe o processo |

---

## 6. Respostas de erro

Todos os erros retornam **HTTP 400** com a mesma estrutura:

```json
{
  "message": "<descrição do erro>",
  "typeError": "<código>",
  "details": [ ... ]
}
```

O campo `details` só é preenchido quando há mais de uma informação a detalhar (ex.: lista de campos faltantes); nos demais casos vem vazio.

### 6.1 Campo obrigatório ausente

**HTTP 400** — `reason` não enviado:

```json
{
  "message": "Erro no Body da requisicao",
  "typeError": "002",
  "details": [
    "'reason' obrigatorio."
  ]
}
```

Com os dois campos faltando:

```json
{
  "message": "Erro no Body da requisicao",
  "typeError": "002",
  "details": [
    "'order' obrigatorio.",
    "'reason' obrigatorio."
  ]
}
```

### 6.2 Pedido não encontrado

**HTTP 400** — o número informado não existe para este cliente nesta filial:

```json
{
  "message": "Pedido nao encontrado.",
  "typeError": "002",
  "details": []
}
```

Verifique o número do pedido e, principalmente, se o `tenantId` corresponde à filial em que ele foi criado.

### 6.3 Pedido já cancelado

**HTTP 400** — o pedido já foi cancelado ou já está com cancelamento pendente:

```json
{
  "message": "Pedido ja cancelado ou pendente de cancelamento.",
  "typeError": "005",
  "details": []
}
```

> Esta rota **não é idempotente** por decisão de projeto: reenviar o cancelamento de um pedido já cancelado retorna erro, e não sucesso. Isso é intencional, para que a integração perceba que nada foi feito nesta chamada. Trate este caso como "já estava cancelado", não como falha operacional.

### 6.4 Pedido já faturado

**HTTP 400** — já existe nota fiscal emitida para o pedido:

```json
{
  "message": "Pedido já possui nota fiscal emitida",
  "typeError": "005",
  "details": []
}
```

Neste ponto o cancelamento não é mais possível pela API. É necessário tratar como devolução, acionando o time comercial da TECADI.

### 6.5 Cliente sem acesso à filial

**HTTP 400** — token válido, mas sem contrato ativo de webservice na filial informada no `tenantId`:

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001",
  "details": []
}
```

### 6.6 Demais falhas de cancelamento

**HTTP 400** — qualquer outra regra que impeça o cancelamento devolve `typeError` `005` com a mensagem específica no campo `message`.

---

## 7. Tabela de códigos de erro (`typeError`)

| Código | Significado | Ação recomendada |
| --- | --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada | Conferir o `tenantId`; se estiver correto, acionar a TECADI para liberar o contrato na filial |
| `002` | Corpo da requisição inválido **ou** pedido não localizado | Conferir `details` e o número do pedido |
| `005` | Pedido não pôde ser cancelado (já cancelado, já faturado, ou regra de negócio) | Ler `message`; se já cancelado, tratar como sucesso lógico |
