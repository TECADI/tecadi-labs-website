# API Standard TECADI — Listagem de Saldos de Estoque

`GET v1/stock-balance`

Retorna o saldo disponível de **todos** os produtos do cliente autenticado na filial informada.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v1/stock-balance` |
| **URL completa** | `https://{domain}/rest/v1/stock-balance` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Parâmetros

Esta rota **não recebe parâmetros nem corpo de requisição**. O cliente e a filial são determinados pelo token e pelo `tenantId`.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v1/stock-balance" \
  -H "Authorization: Bearer <access_token>" \
  -H "tenantId: 01,103"
```

**HTTP puro**

```http
GET /rest/v1/stock-balance HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
tenantId: 01,103
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "data": [
    {
      "product": "SKU-001",
      "stock": 1250
    },
    {
      "product": "SKU-002",
      "stock": 87
    }
  ]
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `data` | Array | Lista de produtos com saldo |
| `data[].product` | String | Código do produto |
| `data[].stock` | Numérico | Saldo disponível |

> Produtos sem movimentação podem não constar na lista. A ausência de um código equivale a saldo zero.

---

## 6. Respostas de erro

**HTTP 400**

### 6.1 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001",
  "details": []
}
```

### 6.2 Erro não tratado

```json
{
  "message": "<descrição do erro>",
  "typeError": "",
  "details": []
}
```

---

## 7. Tabela de códigos de erro (`typeError`)

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |

---

## 8. Rota relacionada

Para consultar um único produto, use [`GET v1/stock-balance/{sku}`](get-v1-stock-balance-id.md) — mais leve que baixar a lista completa.
