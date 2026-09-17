# API Standard TECADI — Desvinculação de Nota Fiscal

`PUT v1/invoice/clean`

Remove o vínculo da nota fiscal do cliente com um ou mais pedidos. Usado para corrigir um envio equivocado feito em [`POST v1/invoice`](post-v1-invoice.md), permitindo enviar a nota correta em seguida.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `PUT` |
| **Caminho** | `v1/invoice/clean` |
| **URL completa** | `https://{domain}/rest/v1/invoice/clean` |
| **Content-Type** | `application/json` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | Empresa e filial de destino — ver [Autenticação](../autenticacao.md) |

---

## 3. Corpo da requisição

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `items` | Array de String | **Sim** | Números dos pedidos do cliente cujo vínculo com a nota será removido |

```json
{
  "items": ["PED000123", "PED000124"]
}
```

### 3.1 O que é limpo

Para cada pedido informado, são zerados: o número/série do documento do cliente, a chave da NF-e e o valor da nota.

### 3.2 Condições

Todos os pedidos precisam passar nas três verificações abaixo. **Se qualquer pedido reprovar, nenhum é alterado** — a operação é tudo ou nada.

| Verificação | Reprova quando |
| --- | --- |
| Pedido existe | O número não é localizado para o cliente |
| Não faturado / não carregado | O pedido já tem nota fiscal emitida ou já foi carregado |
| Não está em carregamento | O pedido está vinculado a uma OS de expedição, planejado em um carregamento, ou já em conferência de carregamento dinâmico |

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X PUT "https://{domain}/rest/v1/invoice/clean" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{ "items": ["PED000123", "PED000124"] }'
```

**HTTP puro**

```http
PUT /rest/v1/invoice/clean HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "items": ["PED000123", "PED000124"]
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "message": "Os pedidos foram desvinculados com sucesso."
}
```

---

## 6. Respostas de erro

**HTTP 400**

### 6.1 Algum pedido reprovou na validação

O campo `details` traz uma linha por pedido reprovado, com o motivo:

```json
{
  "message": "Não foi possivel realizar a operação.",
  "details": [
    { "Pedido": "PED000123", "info": "Pedido já faturado ou carregado." },
    { "Pedido": "PED000124", "info": "Pedido não encontrado." }
  ]
}
```

Motivos possíveis em `info`:

| Motivo | Significado |
| --- | --- |
| `Pedido não encontrado.` | Número não localizado para o cliente |
| `Pedido já faturado ou carregado.` | Já existe nota emitida ou o pedido já foi carregado |
| `Pedido está em processo de carregamento.` | Vinculado a OS de expedição, planejado em carregamento ou em conferência |

### 6.2 Campo obrigatório ausente

```json
{
  "message": "'items' é obrigatório.",
  "details": []
}
```

### 6.3 Cliente sem acesso à filial

```json
{
  "errorCode": 400,
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103."
}
```
