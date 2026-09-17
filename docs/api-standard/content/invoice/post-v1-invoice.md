# API Standard TECADI — Envio de Nota Fiscal

`POST v1/invoice`

Envia o XML (e opcionalmente o PDF) da nota fiscal de saída do cliente e vincula essa nota a um ou mais pedidos já existentes na TECADI.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `POST` |
| **Caminho** | `v1/invoice` |
| **URL completa** | `https://{domain}/rest/v1/invoice` |
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

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `file` | Objeto | **Sim** | Dados da nota fiscal |
| `file.name` | String | **Sim** | Nome do arquivo, **sem** extensão. Usado para gravar o `.xml` e o `.pdf`. |
| `file.base64XML` | String | **Sim** | XML da NF-e (`nfeProc` completo) codificado em base64 |
| `file.orders` | Array de String | **Sim** | Números dos pedidos do cliente a vincular a esta nota |
| `file.base64PDF` | String | Não | DANFE em PDF codificado em base64 |

```json
{
  "file": {
    "name": "NFe35260912345678000199550010000001231000001238",
    "base64XML": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4...",
    "base64PDF": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGgg...",
    "orders": ["PED000123", "PED000124"]
  }
}
```

### 3.1 Dados extraídos do XML

O número, a série, a chave, o valor total, a data de emissão e o protocolo de autorização **não são enviados no corpo** — são lidos automaticamente do XML, dos nós `nfeProc/NFe/infNFe/ide`, `.../total/ICMSTot` e `nfeProc/protNFe/infProt`.

### 3.2 Regras de vinculação

- Números de pedido repetidos em `orders` são desconsiderados.
- **Todos** os pedidos informados precisam existir e ainda estar **sem nota vinculada**. Se a quantidade de pedidos localizados for diferente da quantidade enviada, nada é gravado e a requisição falha.
- A operação é transacional: ou todos os pedidos são vinculados, ou nenhum.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/v1/invoice" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "file": {
          "name": "NFe35260912345678000199550010000001231000001238",
          "base64XML": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4...",
          "orders": ["PED000123"]
        }
      }'
```

**HTTP puro**

```http
POST /rest/v1/invoice HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "file": {
    "name": "NFe35260912345678000199550010000001231000001238",
    "base64XML": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4...",
    "orders": ["PED000123"]
  }
}
```

---

## 5. Resposta de sucesso

**HTTP 202 Accepted**

```json
{}
```

> O retorno é **202** (aceito), com corpo vazio — não 200. A nota foi recebida e vinculada aos pedidos.

---

## 6. Respostas de erro

Todos os erros retornam **HTTP 400** com a estrutura `{ "message": "<motivo>" }`.

| Mensagem | Causa |
| --- | --- |
| `Cliente sem acesso ao uso de webservices Tecadi da filial 103.` | Sem contrato ativo de webservice na filial do `tenantId` |
| `'file' is Required` | Objeto `file` ausente |
| `'name' is Required` | `file.name` ausente |
| `'name' must be character.` | `file.name` não é texto |
| `'base64XML' is Required` | `file.base64XML` ausente |
| `'orders' is Required` | `file.orders` ausente |
| `File already exists` | Já existe um XML gravado com esse nome para o cliente |
| `XML Invalid.` | Não foi possível ler número ou chave da nota no XML |
| `Orders not found.` | Um ou mais pedidos não existem, ou já possuem nota vinculada |
| `Internal Error, contact the system administrator` | Falha ao gravar o arquivo no servidor |

### Exemplo

```json
{
  "message": "Orders not found."
}
```

> Em caso de erro após a gravação do XML, o arquivo é removido automaticamente do servidor.

### Erro de autenticação de sessão

```json
{
  "errorCode": 400,
  "message": "Cliente sem acesso ao uso de webservices Tecadi da filial 103."
}
```
