# API Standard TECADI — Criação de Pedido

`POST v2/order`

Cria um pedido de saída (expedição) no WMS da TECADI a partir do número de pedido do próprio cliente.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `POST` |
| **Caminho** | `v2/order` |
| **URL completa** | `https://{domain}/rest/v2/order` |
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

### 3.1 Campos do cabeçalho do pedido

| Campo | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `order` | String | 20 | **Sim** | Número do pedido do cliente. Chave do pedido na TECADI — não pode se repetir. |
| `customerName` | String | — | **Sim** | Nome do destinatário |
| `customerAddress` | String | — | **Sim** | Endereço de entrega |
| `customerCity` | String | — | **Sim** | Cidade de entrega |
| `customerState` | String | 2 | **Sim** | UF de entrega |
| `items` | Array | — | **Sim** | Itens do pedido. Não pode ser vazio. |
| `carrierCNPJ` | String | 14 | Não | CNPJ da transportadora, somente dígitos. Deve existir no cadastro TECADI. |
| `carrierCode` | String | — | Não | Código da transportadora no cadastro TECADI. Alternativa ao `carrierCNPJ`. |
| `priority` | String | 1 a 2 | Não | Prioridade de `00` a `99`. Com 1 dígito é completado com zero à esquerda. |
| `allowsPartialService` | Boolean | — | Não | `true` autoriza o corte do pedido (atendimento parcial) |
| `invoice` | String | — | Não | Número do documento do cliente |
| `invoiceKey` | String | 44 | Não | Chave da NF-e do cliente |
| `invoiceEmission` | String | 8 | Não | Data de emissão da NF do cliente, formato `AAAAMMDD` |
| `customerCGC` | String | 14 | Não | CNPJ/CPF do destinatário |
| `customerIE` | String | — | Não | Inscrição estadual do destinatário |
| `customerZipCode` | String | 8 | Não | CEP de entrega |
| `customerDDD` | String | — | Não | DDD do destinatário |
| `customerPhone` | String | — | Não | Telefone do destinatário |
| `customerMail` | String | — | Não | E-mail do destinatário |
| `customerFantasyName` | String | — | Não | Nome fantasia do destinatário |
| `customerType` | String | — | Não | Tipo do destinatário |
| `observation` | String | — | Não | Observação do pedido |
| `plate` | String | — | Não | Placa do veículo |
| `grouping` | String | — | Não | Código de agrupamento de pedidos |
| `external_order` | String | — | Não | Número do pedido em sistema externo |

### 3.2 Campos de cada item (`items[]`)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `productCode` | String | **Sim** | Código do produto do cliente. A sigla do cliente é adicionada automaticamente. |
| `amount` | Numérico | **Sim** | Quantidade solicitada |
| `stockType` | String | **Sim** | Tipo de estoque. Se enviado vazio, assume `000001`. |
| `batch` | String | Não | Lote |
| `volumes` | Numérico | Não | Quantidade de volumes do item. Vazio assume `1`. |
| `serialNumber` | String | Não | Número de série |
| `amountLiberated` | Numérico | Não | Quantidade liberada. Ausente, assume o valor de `amount`. |
| `originQuantity` | Numérico | Não | Quantidade de origem |

> O campo `stockType` é obrigatório na validação do corpo, mas aceita valor vazio — nesse caso o padrão `000001` é aplicado.

### 3.3 Exemplo de corpo

```json
{
  "order": "PED000123",
  "customerName": "CLIENTE DESTINO LTDA",
  "customerAddress": "RUA DAS PALMEIRAS, 1000",
  "customerCity": "ITAJAI",
  "customerState": "SC",
  "customerCGC": "12345678000199",
  "carrierCNPJ": "98765432000188",
  "priority": "05",
  "allowsPartialService": true,
  "items": [
    {
      "productCode": "SKU-001",
      "amount": 10,
      "stockType": "000001",
      "batch": "L2026A"
    },
    {
      "productCode": "SKU-002",
      "amount": 4,
      "stockType": "000001",
      "batch": ""
    }
  ]
}
```

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/v2/order" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "order": "PED000123",
        "customerName": "CLIENTE DESTINO LTDA",
        "customerAddress": "RUA DAS PALMEIRAS, 1000",
        "customerCity": "ITAJAI",
        "customerState": "SC",
        "items": [
          { "productCode": "SKU-001", "amount": 10, "stockType": "000001" }
        ]
      }'
```

**HTTP puro**

```http
POST /rest/v2/order HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "order": "PED000123",
  "customerName": "CLIENTE DESTINO LTDA",
  "customerAddress": "RUA DAS PALMEIRAS, 1000",
  "customerCity": "ITAJAI",
  "customerState": "SC",
  "items": [
    { "productCode": "SKU-001", "amount": 10, "stockType": "000001" }
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

Todos os erros retornam **HTTP 400** com a estrutura:

```json
{
  "message": "<descrição do erro>",
  "typeError": "<código>",
  "details": [ ... ]
}
```

### 6.1 Campos obrigatórios ausentes

```json
{
  "message": "Erro no Body da requisicao",
  "typeError": "002",
  "details": [
    "'customerCity' obrigatorio.",
    "'productCode' obrigatorio no item: 2"
  ]
}
```

### 6.2 Número do pedido não informado

```json
{
  "message": "numero do pedido nao informado",
  "typeError": "002",
  "details": ["order"]
}
```

### 6.3 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001",
  "details": []
}
```

### 6.4 Estoque insuficiente

O campo `details` traz uma linha por produto sem saldo, com o disponível e o solicitado:

```json
{
  "message": "Estoque insuficiente.",
  "typeError": "004",
  "details": [
    {
      "product": "SKU-001",
      "stock": 3,
      "stockWMS": 3,
      "requested": 10
    }
  ]
}
```

> `stock` é o saldo fiscal e `stockWMS` o saldo físico no WMS. O campo `stockWMS` só aparece para clientes com WMS Fênix ativo.

### 6.5 Inconsistência ao incluir o pedido

```json
{
  "message": "Erro ao incluir pedido.",
  "typeError": "005",
  "details": ["Order 'PED000123' already exists."]
}
```

Mensagens possíveis em `details`:

| Mensagem | Causa |
| --- | --- |
| `Order '<pedido>' already exists.` | Já existe pedido com esse número para o cliente |
| `Customer not found.` | Cliente não localizado |
| `Carrier not found.` | CNPJ da transportadora não cadastrado |
| `Carrier code not found.` | `carrierCode` enviado vazio |
| `Produto <código> não cadastrado.` | Produto não existe no cadastro TECADI |

---

## 7. Tabela de códigos de erro (`typeError`)

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |
| `002` | Corpo da requisição inválido |
| `004` | Estoque insuficiente para atender a demanda |
| `005` | Inconsistência ao incluir o pedido |
