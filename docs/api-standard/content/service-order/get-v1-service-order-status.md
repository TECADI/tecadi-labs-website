# API Standard TECADI — Consulta de Status da Ordem de Serviço

`GET v1/service-order/status`

Retorna a situação da ordem de serviço de **montagem de volumes** (*packing*) ou de **carregamento** (*shipping*) associada a um pedido, com o detalhamento do que já foi processado.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v1/service-order/status` |
| **URL completa** | `https://{domain}/rest/v1/service-order/status` |
| **Charset da resposta** | `iso-8859-1` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `tenantId` | Sim | `01,103` (ITAJAÍ) ou `01,117` (NAVEGANTES) |

---

## 3. Parâmetros de consulta (query params)

| Parâmetro | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `order` | String | 20 | **Sim** | Número do pedido do cliente |
| `operation` | String | — | **Sim** | Etapa consultada: `packing` ou `shipping` |

| Valor de `operation` | Etapa |
| --- | --- |
| `packing` | Montagem de volumes |
| `shipping` | Carregamento |

Não há corpo de requisição.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v1/service-order/status?order=PED000123&operation=packing" \
  -H "Authorization: Bearer <access_token>" \
  -H "tenantId: 01,103"
```

**HTTP puro**

```http
GET /rest/v1/service-order/status?order=PED000123&operation=packing HTTP/1.1
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
    "status": "Finalizado",
    "statusCode": "FI",
    "createdDate": "2026-09-10",
    "createdTime": "08:15",
    "initDate": "2026-09-10",
    "initTime": "09:02",
    "endDate": "2026-09-10",
    "endTime": "11:47",
    "volume": 4,
    "details": [
      {
        "product": "SKU-001",
        "amount": 10,
        "date": "2026-09-10",
        "time": "09:20",
        "batch": "L2026A",
        "serial": ""
      }
    ]
  }
}
```

### 5.1 Campos de `data`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `status` | String | Descrição da situação |
| `statusCode` | String | Código da situação — ver tabela abaixo |
| `createdDate` | Data | Data de criação da OS |
| `createdTime` | String | Hora de criação |
| `initDate` | Data | Data de início da execução |
| `initTime` | String | Hora de início |
| `endDate` | Data | Data de encerramento |
| `endTime` | String | Hora de encerramento |
| `volume` | Numérico | Quantidade de volumes distintos processados |
| `details` | Array | Itens já processados. Só aparece quando existe uma OS. |

### 5.2 Situações possíveis

| `statusCode` | `status` |
| --- | --- |
| `AN` | Em análise |
| `AG` | Aguardando |
| `PL` | Planejado |
| `EX` | Em execução |
| `IN` | Interrompida |
| `BL` | Bloqueado |
| `FI` | Finalizado |
| `CA` | Cancelado |
| `NA` | Não iniciado |

> **`CA` e `NA` são casos especiais.** Quando não existe OS para a etapa consultada, a TECADI verifica se o pedido está cancelado: em caso positivo devolve `CA` (Cancelado), caso contrário devolve `NA` (Não iniciado). Nessas duas situações as datas e horas voltam vazias e não há `details`.

### 5.3 Campos de cada item em `details`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `product` | String | Código do produto do cliente (sem a sigla TECADI) |
| `amount` | Numérico | Quantidade processada |
| `date` | Data | Data do processamento |
| `time` | String | Hora do processamento |
| `batch` | String | Lote |
| `serial` | String | Número de série |

---

## 6. Respostas de erro

**HTTP 400**

| Resposta | Causa |
| --- | --- |
| `{"error": "'order' nao foi informado"}` | Query param `order` ausente |
| `{"error": "'operation' nao foi informado"}` | Query param `operation` ausente |
| `{"error": "Operação não preenchida. Defina 'operation' como packing ou shipping."}` | `operation` enviado vazio |
| `{"error": "Pedido <numero> não encontrado."}` | Pedido não localizado |
| `{"error": "Cliente sem acesso ao webservice TECADI."}` | Sem contrato ativo de webservice na filial do `tenantId` |

### Exemplo

```json
{
  "error": "Pedido PED000123 não encontrado."
}
```
