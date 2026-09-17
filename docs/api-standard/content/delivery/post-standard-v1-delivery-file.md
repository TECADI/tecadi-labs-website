# API Standard TECADI — Criação de Remessa por Arquivo CSV

`POST standard/v1/delivery/file`

Cria uma remessa de entrada a partir de um arquivo **CSV** enviado em base64. Alternativa à rota [`POST standard/v1/delivery`](post-standard-v1-delivery.md), útil quando o cliente já produz o arquivo em seu próprio sistema.

Além de criar a remessa, o arquivo recebido é arquivado no servidor da TECADI.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `POST` |
| **Caminho** | `standard/v1/delivery/file` |
| **URL completa** | `https://{domain}/rest/standard/v1/delivery/file` |
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

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `file` | Objeto | **Sim** | Dados do arquivo |
| `file.name` | String | **Sim** | Nome do arquivo, **sem** a extensão |
| `file.extension` | String | **Sim** | Extensão do arquivo. **Somente `CSV`** é aceito. |
| `file.base64` | String | **Sim** | Conteúdo do CSV codificado em base64 |

Nenhum dos campos pode ser enviado vazio.

```json
{
  "file": {
    "name": "remessa_20260910",
    "extension": "csv",
    "base64": "cHJvZHV0bztxdWFudGlkYWRlO3ByZWNvCg=="
  }
}
```

> O layout interno do CSV é definido pela TECADI para cada cliente na implantação. Consulte o setor de projetos para obter o layout aplicável ao seu contrato.

### 3.1 Tratamento de nome duplicado

Se já existir um arquivo com o mesmo nome no diretório do cliente, a TECADI **não sobrescreve**: o arquivo é gravado com um sufixo de data e hora, no formato `<nome>_NEWNAME_<timestamp>.<extensão>`. A remessa é criada normalmente.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/standard/v1/delivery/file" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -H "tenantId: 01,103" \
  -d '{
        "file": {
          "name": "remessa_20260910",
          "extension": "csv",
          "base64": "cHJvZHV0bztxdWFudGlkYWRlO3ByZWNvCg=="
        }
      }'
```

**HTTP puro**

```http
POST /rest/standard/v1/delivery/file HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
Content-Type: application/json
tenantId: 01,103

{
  "file": {
    "name": "remessa_20260910",
    "extension": "csv",
    "base64": "cHJvZHV0bztxdWFudGlkYWRlO3ByZWNvCg=="
  }
}
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
{
  "message": "Sucesso, remessa criada."
}
```

---

## 6. Respostas de erro

Todos os erros retornam **HTTP 400** com a estrutura `{ "message": "<motivo>" }`.

| Mensagem | Causa |
| --- | --- |
| `Cliente sem acesso ao uso de webservices Tecadi da filial 103` | Sem contrato ativo de webservice na filial do `tenantId` |
| `Não identificado o arquivo enviado.` | Objeto `file` ausente no corpo |
| `Não identificado informações do arquivo.` | Falta `name`, `extension` ou `base64`, ou algum deles veio vazio |
| `Formato de arquivo inválido.` | `extension` diferente de `CSV` |
| *(mensagem do processamento)* | Falha ao interpretar o conteúdo do CSV ou ao criar a remessa |

### Exemplo

```json
{
  "message": "Formato de arquivo inválido."
}
```
