# API Standard TECADI — Criação de Remessa

`POST standard/v1/delivery`

Cria uma remessa de entrada (recebimento) no WMS da TECADI, informando os itens que serão recebidos no armazém.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `POST` |
| **Caminho** | `standard/v1/delivery` |
| **URL completa** | `https://{domain}/rest/standard/v1/delivery` |
| **Content-Type** | `application/json` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Corpo da requisição

### 3.1 Campos do cabeçalho da remessa

| Campo | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `delivery` | String | 20 | **Sim** | Número da remessa do cliente. Excedendo o tamanho, a requisição é recusada. |
| `isReturn` | Boolean | — | **Sim** | `true` quando for remessa de retorno/devolução |
| `items` | Array | — | **Sim** | Itens da remessa. Não pode ser vazio. |
| `notes` | String | — | Não | Observações da remessa |

### 3.2 Campos de cada item (`items[]`)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `productCode` | String | **Sim** | Código do produto do cliente |
| `quantity` | Numérico | **Sim** | Quantidade. Precisa ser **maior ou igual a 1**. |
| `price` | Numérico | **Sim** | Valor unitário. Não pode ser negativo. |
| `batch` | String | Não | Lote |
| `expirationDate` | String | Não | Data de validade, formato `AAAAMMDD` |
| `manufacturingDate` | String | Não | Data de fabricação, formato `AAAAMMDD` |

### 3.3 Exemplo de corpo

```json
{
  "delivery": "REM000456",
  "isReturn": false,
  "notes": "Recebimento programado para o turno da manha",
  "items": [
    {
      "productCode": "SKU-001",
      "quantity": 120,
      "price": 35.90,
      "batch": "L2026A",
      "expirationDate": "20271231",
      "manufacturingDate": "20260115"
    },
    {
      "productCode": "SKU-002",
      "quantity": 40,
      "price": 12.50
    }
  ]
}
```

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/standard/v1/delivery" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "delivery": "REM000456",
        "isReturn": false,
        "items": [
          { "productCode": "SKU-001", "quantity": 120, "price": 35.90, "batch": "L2026A" }
        ]
      }'
```

**HTTP puro**

```http
POST /rest/standard/v1/delivery HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "delivery": "REM000456",
  "isReturn": false,
  "items": [
    { "productCode": "SKU-001", "quantity": 120, "price": 35.90, "batch": "L2026A" }
  ]
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "message": "Sucesso"
}
```

---

## 6. Respostas de erro

Todos os erros retornam **HTTP 400**.

### 6.1 Corpo inválido

O campo `details` lista todos os problemas encontrados de uma vez:

```json
{
  "message": "Body request with error",
  "details": [
    "'isReturn' obrigatorio.",
    "'quantity' esta incorreto no item: 1, nao pode ser menor que 1",
    "'expirationDate' dado incorreto no item: 2, exemplo correto: 20260130"
  ]
}
```

Mensagens de validação possíveis:

| Mensagem | Causa |
| --- | --- |
| `'delivery' obrigatorio.` | Campo ausente |
| `'delivery' tipagem incorreta, deve ser String/char.` | Tipo diferente de texto |
| `'delivery' com tamanho incorreto, tamanho maximo é de 20 characteres.` | Excedeu o tamanho |
| `'isReturn' obrigatorio.` | Campo ausente |
| `'isReturn' tipagem incorreta, deve ser booleano.` | Tipo diferente de booleano |
| `'notes' tipagem incorreta, deve ser string/char.` | Tipo diferente de texto |
| `'items' obrigatorio.` | Campo ausente |
| `'items' não pode ser vazio.` | Array sem elementos |
| `'productCode' obrigatorio no item: N` | Campo ausente no item N |
| `'quantity' obrigatorio no item: N` | Campo ausente no item N |
| `'quantity' tipagem incorreta no item: N, deve ser numerico.` | Tipo diferente de número |
| `'quantity' esta incorreto no item: N, nao pode ser menor que 1` | Quantidade menor que 1 |
| `'price' obrigatorio no item: N` | Campo ausente no item N |
| `'price' tipagem incorreta no item: N, deve ser numerico.` | Tipo diferente de número |
| `'price' esta incorreto no item: N, nao pode ser menor que 0` | Valor negativo |
| `'expirationDate' dado incorreto no item: N, exemplo correto: 20260130` | Data em formato inválido |
| `'manufacturingDate' dado incorreto no item: N, exemplo correto: 20260130` | Data em formato inválido |
| `'batch' tipagem incorreta no item: N, deve ser string/char.` | Tipo diferente de texto |

### 6.2 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103"
}
```

### 6.3 Falha na criação

```json
{
  "message": "Create fail",
  "details": ["<motivo devolvido pelo processamento>"]
}
```
