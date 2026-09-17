# API Standard TECADI — Consulta de Pedido

`GET v2/order/{order}`

Retorna a situação de um pedido específico e seus itens.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v2/order/{order}` |
| **URL completa** | `https://{domain}/rest/v2/order/{order}` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Parâmetro de rota

| Parâmetro | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `order` | String | 20 | **Sim** | Número do pedido do cliente, o mesmo enviado em `POST v2/order` |

> O valor deve ir **codificado na URL** (URL-encoded) quando contiver caracteres especiais como `/`, espaço ou `#`. Exemplo: o pedido `PED/123` vira `PED%2F123`.

Não há corpo de requisição.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v2/order/PED000123" \
  -H "Authorization: Bearer <access_token>" \
  -H "tenantId: 01,103"
```

**HTTP puro**

```http
GET /rest/v2/order/PED000123 HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
tenantId: 01,103
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "status": "Em execucao",
  "statusCode": "EX",
  "order": "PED000123",
  "invoiceCustomer": "35260912345678000199550010000001231000001238",
  "emission": "2026-09-10",
  "invoiced": false,
  "volume": 4,
  "volume_type": "CAIXA",
  "priority": "05",
  "items": [
    {
      "product": "SKU-001",
      "amount": 10,
      "batch": "L2026A"
    }
  ]
}
```

### 5.1 Campos do cabeçalho

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `status` | String | Descrição da situação do pedido |
| `statusCode` | String | Código da situação — ver tabela abaixo |
| `order` | String | Número do pedido do cliente |
| `invoiceCustomer` | String | Chave da NF-e do cliente vinculada ao pedido |
| `emission` | Data | Data de emissão |
| `invoiced` | Boolean | `true` quando já existe nota fiscal emitida |
| `volume` | Numérico | Quantidade de volumes |
| `volume_type` | String | Espécie do volume |
| `priority` | String | Prioridade do pedido. Só retorna se o campo estiver habilitado no ambiente. |
| `items` | Array | Itens do pedido |

### 5.2 Situações possíveis

| `statusCode` | `status` | Significado |
| --- | --- | --- |
| `AN` | Em analise | Pedido recebido, aguardando análise |
| `BL` | Bloqueado | Pedido bloqueado (ex.: sem saldo fiscal) |
| `CA` | Cancelado | Pedido cancelado |
| `EX` | Em execucao | Em processamento no armazém |
| `FI` | Finalizado | Separação e montagem de volumes concluídas |

### 5.3 Campos de cada item

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `product` | String | Código do produto do cliente (sem a sigla TECADI) |
| `amount` | Numérico | Quantidade |
| `batch` | String | Lote |
| `invoiceOrigin` | String | Número da NF de entrada. Só retorna se habilitado para o cliente. |
| `invoiceSeriesOrigin` | String | Série da NF de entrada. Só retorna se habilitado. |
| `invoiceItemOrigin` | String | Item da NF de entrada. Só retorna se habilitado. |
| `invoiceKeyOrigin` | String | Chave da NF-e de entrada. Só retorna se habilitado. |

> Os quatro campos de nota de origem são controlados por parâmetro por cliente e filial. Quando desabilitados, simplesmente não aparecem no retorno.

---

## 6. Respostas de erro

**HTTP 400**

### 6.1 Pedido não encontrado

```json
{
  "message": "Pedido nao encontrado.",
  "typeError": "002"
}
```

Verifique o número do pedido e se o `tenantId` corresponde à filial onde ele foi criado.

### 6.2 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001"
}
```

---

## 7. Tabela de códigos de erro (`typeError`)

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |
| `002` | Pedido não localizado |
