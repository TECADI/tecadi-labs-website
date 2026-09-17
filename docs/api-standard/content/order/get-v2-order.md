# API Standard TECADI — Listagem de Pedidos

`GET v2/order`

Retorna, de forma paginada, os pedidos do cliente autenticado.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v2/order` |
| **URL completa** | `https://{domain}/rest/v2/order` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Parâmetros de consulta (query params)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page` | Numérico | Não | Página desejada |
| `pageSize` | Numérico | Não | Registros por página. **Máximo 1000** — valores maiores são reduzidos para 1000. |

## 4. Corpo da requisição (opcional)

Esta rota aceita um corpo opcional para filtrar por números de pedido específicos.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `orders` | Array de String | Não | Lista de números de pedido do cliente. Quando ausente, retorna todos os pedidos do cliente. |

```json
{
  "orders": ["PED000123", "PED000124"]
}
```

---

## 5. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v2/order?page=1&pageSize=100" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{ "orders": ["PED000123", "PED000124"] }'
```

**HTTP puro**

```http
GET /rest/v2/order?page=1&pageSize=100 HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "orders": ["PED000123", "PED000124"]
}
```

---

## 6. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "items": [
    {
      "order": "PED000123",
      "orderService": "000045678",
      "orderTecadi": "012345",
      "status": "Em execucao",
      "statuscode": "EX",
      "packaged": "N",
      "volume": 4,
      "volumeType": "CAIXA",
      "invoiceKey": "35260912345678000199550010000001231000001238",
      "invoice": "000012345",
      "invoiced": true,
      "emission": "2026-09-10",
      "priority": "05"
    }
  ]
}
```

### 6.1 Campos de cada item

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `order` | String | Número do pedido do cliente |
| `orderService` | String | Número da ordem de serviço no WMS |
| `orderTecadi` | String | Número do pedido de venda na TECADI |
| `status` | String | Descrição da situação — ver tabela abaixo |
| `statuscode` | String | Código da situação |
| `packaged` | String | `S` quando os volumes já foram montados |
| `volume` | Numérico | Quantidade de volumes |
| `volumeType` | String | Espécie do volume |
| `invoiceKey` | String | Chave da NF-e do cliente |
| `invoice` | String | Número da nota fiscal emitida pela TECADI |
| `invoiced` | Boolean | `true` quando `invoice` está preenchido |
| `emission` | Data | Data de emissão |
| `priority` | String | Prioridade. Só retorna se o campo estiver habilitado no ambiente. |

### 6.2 Situações possíveis

| `statuscode` | `status` | Significado |
| --- | --- | --- |
| `AN` | Em analise | Pedido recebido, aguardando análise |
| `BL` | Bloqueado | Pedido bloqueado (ex.: sem saldo fiscal) |
| `CA` | Cancelado | Pedido cancelado |
| `EX` | Em execucao | Em processamento no armazém |
| `FI` | Finalizado | Separação e montagem de volumes concluídas |

---

## 7. Respostas de erro

**HTTP 400**

### 7.1 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001",
  "details": []
}
```

### 7.2 Erro não tratado

```json
{
  "Error": "Erro nao esperado. Favor entrar em contato com o administrador do sistema."
}
```

---

## 8. Tabela de códigos de erro (`typeError`)

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |
