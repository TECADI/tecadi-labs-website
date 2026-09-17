# API Standard TECADI — Envio de Etiqueta de Expedição

`POST v2/order/tag`

Envia uma etiqueta de expedição em base64 para um pedido. O arquivo é gravado no servidor da TECADI e usado pela operação do armazém na expedição.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `POST` |
| **Caminho** | `v2/order/tag` |
| **URL completa** | `https://{domain}/rest/v2/order/tag` |
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

| Campo | Tipo | Tamanho | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `order` | String | 20 | **Sim** | Número do pedido do cliente ao qual a etiqueta pertence |
| `type` | String | — | **Sim** | Tipo/formato da etiqueta |
| `base64` | String | — | **Sim** | Conteúdo do arquivo da etiqueta codificado em base64 |

Nenhum dos três pode ser enviado vazio ou apenas com espaços.

```json
{
  "order": "PED000123",
  "type": "PDF",
  "base64": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGgg..."
}
```

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/v2/order/tag" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "order": "PED000123",
        "type": "PDF",
        "base64": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGgg..."
      }'
```

**HTTP puro**

```http
POST /rest/v2/order/tag HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "order": "PED000123",
  "type": "PDF",
  "base64": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGgg..."
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "message": "Sucesso",
  "order": "PED000123",
  "path": "\\EDI\\emp01\\103\\00036301\\expedicao\\etiquetas\\PED000123.pdf"
}
```

| Campo | Descrição |
| --- | --- |
| `message` | Sempre `Sucesso` |
| `order` | Número do pedido informado |
| `path` | Caminho onde o arquivo foi gravado no servidor TECADI |

---

## 6. Respostas de erro

Todos os erros retornam **HTTP 400**.

### 6.1 Campos obrigatórios ausentes

```json
{
  "message": "Erro no Body da requisicao",
  "typeError": "002",
  "details": [
    "'type' obrigatorio.",
    "'base64' obrigatorio."
  ]
}
```

### 6.2 Cliente sem acesso à filial

```json
{
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103.",
  "typeError": "001"
}
```

### 6.3 Falha ao gravar a etiqueta

```json
{
  "message": "<motivo devolvido pelo processamento>",
  "typeError": "005"
}
```

---

## 7. Tabela de códigos de erro (`typeError`)

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |
| `002` | Corpo da requisição inválido |
| `005` | Falha ao processar ou gravar a etiqueta |
