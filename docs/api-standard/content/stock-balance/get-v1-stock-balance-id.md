# API Standard TECADI — Consulta de Saldo por Produto

`GET v1/stock-balance/{sku}`

Retorna o saldo disponível de **um** produto específico do cliente autenticado.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v1/stock-balance/{sku}` |
| **URL completa** | `https://{domain}/rest/v1/stock-balance/{sku}` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Parâmetro de rota

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `sku` | String | **Sim** | Código do produto **do cliente**. A sigla TECADI é adicionada automaticamente — não a envie. |

> Codifique o valor na URL (URL-encoded) se o código contiver caracteres especiais como `/` ou espaço.

Não há corpo de requisição.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v1/stock-balance/SKU-001" \
  -H "Authorization: Bearer <access_token>" \
  -H "tenantId: 01,103"
```

**HTTP puro**

```http
GET /rest/v1/stock-balance/SKU-001 HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
tenantId: 01,103
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "data": {
    "product": "SKU-001",
    "stock": 1250
  }
}
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `data.product` | String | Código do produto informado |
| `data.stock` | Numérico | Saldo disponível |

---

## 6. Respostas de erro

**HTTP 400**

### 6.1 SKU não informado

```json
{
  "message": "sku não informado"
}
```

### 6.2 SKU não encontrado

```json
{
  "message": "sku não encontrado"
}
```

O produto não existe no cadastro do cliente na TECADI. Confira o código enviado e o `tenantId`.

### 6.3 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001",
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

Para obter todos os produtos de uma vez, use [`GET v1/stock-balance`](get-v1-stock-balance.md).
