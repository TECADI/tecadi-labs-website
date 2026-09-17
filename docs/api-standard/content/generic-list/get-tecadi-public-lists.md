# API Standard TECADI — Listas Genéricas

`GET tecadi/public/lists`

Retorna listas auxiliares de apoio ao preenchimento de cadastros e telas. O conteúdo retornado depende do parâmetro `type`.

> **Rota pública.** Diferente das demais rotas da API Standard, esta não identifica o cliente pelo token nem exige o `tenantId` — os dados devolvidos não são específicos de um contrato.

---

## 1. Endpoint

| | |
| --- | --- |
| **Método** | `GET` |
| **Caminho** | `tecadi/public/lists` |
| **URL completa** | `https://{domain}/rest/tecadi/public/lists` |

## 2. Autenticação e cabeçalhos

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` — ver [Autenticação](../autenticacao.md) |

O cabeçalho `tenantId` **não é utilizado** por esta rota.

---

## 3. Parâmetros de consulta (query params)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `type` | String | **Sim** | Tipo da lista desejada. Valor aceito: `customers`. |

### Tipos disponíveis

| Valor | Retorno |
| --- | --- |
| `customers` | Nomes dos clientes com contrato de WMS ativo na TECADI |

Não há corpo de requisição.

---

## 4. Exemplo de requisição

**cURL**

```bash
curl -X GET "https://{domain}/rest/tecadi/public/lists?type=customers" \
  -H "Authorization: Bearer <access_token>"
```

**HTTP puro**

```http
GET /rest/tecadi/public/lists?type=customers HTTP/1.1
Host: {domain}
Authorization: Bearer <access_token>
```

---

## 5. Resposta de sucesso

**HTTP 200 OK**

```json
[
  "CLIENTE EXEMPLO A LTDA",
  "CLIENTE EXEMPLO B S/A",
  "CLIENTE EXEMPLO C COMERCIO LTDA"
]
```

Um array de strings com os nomes dos clientes ativos, sem repetição.

---

## 6. Respostas de erro

**HTTP 400**

O corpo do erro é uma **string simples**, não um objeto JSON.

| Resposta | Causa |
| --- | --- |
| `"Missing required query parameter: 'type'"` | O parâmetro `type` não foi informado ou veio vazio |
| `"An unexpected error occurred. Please try again later. Error:Unknown query parameter: '<valor>'"` | O valor enviado em `type` não é reconhecido |

### Exemplo

```json
"Missing required query parameter: 'type'"
```
