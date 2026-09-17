# API Standard TECADI — Autenticação

Documento comum a **todas** as rotas da API Standard TECADI. Cada rota referencia esta página em vez de repetir o processo.

---

## 1. Visão geral

A autenticação é o **primeiro passo** da integração com a TECADI e segue o padrão **OAuth 2.0**, no fluxo *Resource Owner Password Credentials* (`grant_type=password`). O resultado é um **Bearer Token (JWT)**, usado em todas as rotas da API.

## 2. Endpoint de emissão do token

| | |
| --- | --- |
| **Método** | `POST` |
| **Endpoint** | `/rest/api/oauth2/v1/token` |
| **URL completa** | `https://{domain}/rest/api/oauth2/v1/token` |

Os parâmetros são enviados como **query params**:

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `grant_type` | String | Sim | Valor fixo `password` |
| `username` | String | Sim | Nome de usuário fornecido pela TECADI |
| `password` | String | Sim | Senha do usuário fornecida pela TECADI |

### Exemplo de requisição

**cURL**

```bash
curl -X POST "https://{domain}/rest/api/oauth2/v1/token?grant_type=password&username=SEU_USUARIO&password=SUA_SENHA"
```

**HTTP puro**

```http
POST /rest/api/oauth2/v1/token?grant_type=password&username=SEU_USUARIO&password=SUA_SENHA HTTP/1.1
Host: {domain}
```

### Resposta de sucesso

**HTTP 200 OK**

```json
{
  "access_token": "*** token ***",
  "refresh_token": "*** token ***",
  "scope": "default",
  "token_type": "Bearer",
  "expires_in": 3600,
  "hasMFA": false
}
```

| Campo | Descrição |
| --- | --- |
| `access_token` | Token JWT a ser enviado nas demais rotas |
| `refresh_token` | Token para renovação do acesso |
| `scope` | Escopo concedido |
| `token_type` | Tipo do token — sempre `Bearer` |
| `expires_in` | Validade do token em segundos (`3600` = 1 hora) |
| `hasMFA` | Indica se o usuário possui autenticação multifator |

### Resposta de erro

**HTTP 401**

```json
{
  "code": 401,
  "message": "invalid_grant Falha de autentição para o usuário 123456.",
  "detailedMessage": "invalid_grant Falha de autenticação para o usuário 123456."
}
```

---

## 3. Cabeçalhos exigidos nas rotas

| Cabeçalho | Obrigatório | Descrição |
| --- | --- | --- |
| `Authorization` | Sim | `Bearer <access_token>` |
| `Content-Type` | Sim | `application/json` |
| `tenantId` | Sim | Empresa e filial de destino, no formato `<empresa>,<filial>` |

### Valores de `tenantId` por filial

| Filial | `tenantId` |
| --- | --- |
| **ITAJAÍ** | `01,103` |
| **NAVEGANTES** | `01,117` |

> ⚠️ O `tenantId` precisa corresponder à filial onde o dado consultado ou enviado existe. Enviar a filial errada faz a requisição falhar por falta de acesso, mesmo que o token esteja correto.

---

## 4. Identificação do cliente

**A identificação do cliente não é enviada em nenhuma rota** — nem no corpo, nem em parâmetro. Ela é derivada automaticamente do usuário autenticado, cruzando o usuário com o contrato ativo da filial informada no `tenantId`.

Consequências práticas:

- Um token só enxerga e movimenta dados do próprio cliente.
- Todas as rotas retornam erro de acesso se, para a filial do `tenantId`, o cliente não tiver contrato ativo de webservice.

Condições que o contrato precisa atender:

- Data de fim de vigência maior ou igual à data atual.
- Cliente habilitado para uso do WMS.
- Usuário ativo na base de dados.

---

## 5. Observação sobre o `{domain}`

O `{domain}` varia por ambiente e é informado pela TECADI no momento da liberação do acesso.
