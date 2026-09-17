# API Standard TECADI — Obtenção do XML e PDF da Nota Fiscal

`GET v1/invoice/files`

Retorna o XML e o DANFE (PDF) da nota fiscal de retorno de armazenagem emitida pela TECADI, ambos em base64.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `v1/invoice/files` |
| **URL completa** | `https://{domain}/rest/v1/invoice/files` |
| **Content-Type** | `application/json` |

## 2. Autenticação e cabeçalhos

Bearer Token (OAuth 2.0) — ver [Autenticação](../autenticacao.md).

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | Empresa e filial de destino — ver [Autenticação](../autenticacao.md) |

---

## 3. Corpo da requisição

Apesar de ser um `GET`, esta rota recebe os critérios de busca **no corpo da requisição**.

| Campo | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `chaveNfe` | String | 44 | Não* | Chave de acesso da NF-e |
| `customerOrder` | String | 20 | Não* | Número do pedido do cliente |
| `orderTecadi` | String | — | Não* | Número do pedido de venda na TECADI |
| `invoiceNumber` | String | — | Não* | Número e série da nota separados por hífen, ex.: `123456789-1` |

> **\* Ao menos um dos quatro campos é obrigatório.** Todos são opcionais individualmente, mas a requisição precisa trazer pelo menos um critério.

```json
{
  "chaveNfe": "35260912345678000199550010000001231000001238"
}
```

### 3.1 Ordem de resolução

O critério mais direto é a `chaveNfe`. Quando ela não é enviada, a TECADI a localiza a partir dos demais campos:

| Critério enviado | Como a nota é localizada |
| --- | --- |
| `chaveNfe` | Usada diretamente |
| `customerOrder` ou `orderTecadi` | Busca o pedido e lê a chave da nota vinculada |
| `invoiceNumber` | Busca a nota pelo número e série e lê a chave |

### 3.2 Formato do `invoiceNumber`

Deve conter o número e a série separados por **hífen** (`-`). Exemplo: `123456789-1`. Sem o hífen, a requisição é recusada.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/v1/invoice/files" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{ "customerOrder": "PED000123" }'
```

**HTTP puro**

```http
GET /rest/v1/invoice/files HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "customerOrder": "PED000123"
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "base64Pdf": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGgg...",
  "base64Xml": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4...",
  "chaveNfe": "35260912345678000199550010000001231000001238",
  "invoiceNumber": "123456789",
  "invoiceSerie": "1"
}
```

| Campo | Descrição |
| --- | --- |
| `base64Pdf` | DANFE em PDF, codificado em base64 |
| `base64Xml` | XML da NF-e, codificado em base64 |
| `chaveNfe` | Chave de acesso da NF-e |
| `invoiceNumber` | Número da nota |
| `invoiceSerie` | Série da nota |

---

## 6. Respostas de erro

**HTTP 400**

```json
{
  "hasError": true,
  "message": "<motivo>"
}
```

| Mensagem | Causa |
| --- | --- |
| `Pedido Tecadi <numero> não encontrado.` | `orderTecadi` não localizado |
| `Pedido do cliente <numero> não encontrado.` | `customerOrder` não localizado |
| `Nota fiscal do pedido <tecadi> / <cliente> ainda não emitida. Tente novamente mais tarde.` | Pedido existe, mas a nota ainda não foi emitida |
| `Nota fiscal <numero>-<serie> não encontrada na base Tecadi.` | `invoiceNumber` não localizado |
| `Parâmetro 'invoiceNumber' (número da nota fiscal) em formato incorreto. Deve ser enviado hífen (-) para separar número da nota e série.` | Faltou o hífen |
| `Parâmetro 'invoiceNumber' (número da nota fiscal) em formato incorreto. Não retornaram dados.` | Formato não produziu número e série válidos |
| `Erro em obter base64 do XML da nota : <numero>-<serie>` | Falha ao gerar o XML |
| `Não foi possível criar o arquivo <caminho>` | Falha ao gravar o arquivo temporário no servidor |

### Cliente sem acesso à filial

```json
{
  "errorCode": 400,
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103."
}
```

---

## 7. Observação sobre desempenho

A geração do DANFE é feita sob demanda a partir do XML e envolve gravação de arquivos temporários no servidor. A resposta leva alguns segundos — dimensione o *timeout* do seu cliente HTTP levando isso em conta e evite chamadas em rajada.
