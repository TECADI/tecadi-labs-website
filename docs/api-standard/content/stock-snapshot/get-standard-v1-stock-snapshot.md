# API Standard TECADI — Foto do Estoque

`GET standard/v1/stock-snapshot`

Retorna uma fotografia do estoque do cliente em um instante, detalhando saldo livre, empenhado e total, e apontando divergências entre as diferentes visões de saldo.

Diferente de [`GET v1/stock-balance`](../stock-balance/get-v1-stock-balance.md), que devolve apenas o disponível, esta rota é voltada à **conferência e auditoria** do estoque.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `standard/v1/stock-snapshot` |
| **URL completa** | `https://{domain}/rest/standard/v1/stock-snapshot` |
| **Content-Type** | `application/json` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `tenantId` | Sim | Empresa e filial de destino — ver [Autenticação](../autenticacao.md) |

---

## 3. Parâmetros

Esta rota **não recebe parâmetros nem corpo de requisição**.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/standard/v1/stock-snapshot" \
  -H "Authorization: Bearer <access_token>" \
  -H "tenantId: 01,103"
```

**HTTP puro**

```http
GET /rest/standard/v1/stock-snapshot HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
tenantId: 01,103
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "createdAt": "2026-09-10T14:32:07",
  "items": [
    {
      "product": {
        "code": "SKU-001",
        "description": "PRODUTO EXEMPLO 500ML"
      },
      "balance": {
        "available": 1250,
        "committed": 80,
        "total": 1330,
        "batch": 1330,
        "wms": 1330
      },
      "analysis": "OK"
    },
    {
      "product": {
        "code": "SKU-002",
        "description": "PRODUTO EXEMPLO 1L"
      },
      "balance": {
        "available": 87,
        "committed": 0,
        "total": 87,
        "batch": 87,
        "wms": 90
      },
      "analysis": "Divergência: saldo total diferente de Saldo WMS"
    }
  ]
}
```

### 5.1 Campos do cabeçalho

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `createdAt` | String | Data e hora em que a foto foi tirada |
| `items` | Array | Um registro por produto |

### 5.2 Campos de cada item

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `product.code` | String | Código do produto |
| `product.description` | String | Descrição do produto |
| `balance.available` | Numérico | Saldo livre (disponível para novos pedidos) |
| `balance.committed` | Numérico | Saldo empenhado (reservado para pedidos em andamento) |
| `balance.total` | Numérico | Saldo total (livre + empenhado) |
| `balance.batch` | Numérico | Somatório dos saldos por lote |
| `balance.wms` | Numérico | Saldo físico apontado pelo WMS |
| `analysis` | String | Resultado da conferência entre as visões de saldo |

### 5.3 Valores de `analysis`

| Valor | Significado | Ação sugerida |
| --- | --- | --- |
| `OK` | As visões de saldo estão consistentes | Nenhuma |
| `Divergência: saldo negativo.` | Algum saldo está negativo | Acionar a TECADI |
| `Divergência: saldo de lotes diferente de saldo WMS, acionar time de inventário` | Soma dos lotes não bate com o WMS | Acionar o time de inventário da TECADI |
| `Divergência: saldo total diferente de saldo de lotes` | Total não bate com a soma dos lotes | Acionar a TECADI |
| `Divergência: saldo total diferente de Saldo WMS` | Total não bate com o saldo físico do WMS | Acionar a TECADI |

---

## 6. Respostas de erro

**HTTP 400**

| Mensagem | Causa |
| --- | --- |
| `Cliente sem acesso ao uso de webservices Tecadi da filial 103` | Sem contrato ativo de webservice na filial do `tenantId` |
| `Cliente sem sigla vinculada - <codigo><loja>` | Cadastro do cliente sem sigla definida na TECADI |

### Exemplo

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103"
}
```
