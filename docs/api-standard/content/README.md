# API Standard TECADI — Documentação de Integração

Documentação das rotas da API Standard TECADI, voltada aos clientes que integram seus sistemas ao WMS.

Cada **controller** tem sua própria pasta, e cada **rota** tem seu próprio documento.

---

## Comece por aqui

**[Autenticação](autenticacao.md)** — OAuth 2.0, obtenção do Bearer Token, cabeçalhos comuns e valores de `tenantId` por filial. Todas as rotas dependem deste documento.

| Filial | `tenantId` |
| --- | --- |
| ITAJAÍ | `01,103` |
| NAVEGANTES | `01,117` |

---

## Rotas por controller

### Pedidos — `order/`

Fonte: `Controllers/order_standard_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `POST v2/order` | [criar-pedido.md](order/post-v2-order.md) | Cria um pedido de saída |
| `GET v2/order` | [listar-pedidos.md](order/get-v2-order.md) | Lista pedidos de forma paginada |
| `GET v2/order/{order}` | [consultar-pedido.md](order/get-v2-order-id.md) | Consulta um pedido e seus itens |
| `PUT v2/order/cancel` | [cancelar-pedido.md](order/put-v2-order-cancel.md) | Cancela um pedido |
| `POST v2/order/tag` | [enviar-etiqueta.md](order/post-v2-order-tag.md) | Envia a etiqueta de expedição |

### Remessas de entrada — `delivery/`

Fonte: `Controllers/delivery_standard_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `POST standard/v1/delivery` | [criar-remessa.md](delivery/post-standard-v1-delivery.md) | Cria uma remessa de entrada via JSON |
| `POST standard/v1/delivery/file` | [criar-remessa-por-arquivo.md](delivery/post-standard-v1-delivery-file.md) | Cria uma remessa a partir de um CSV em base64 |

### Notas fiscais — `invoice/`

Fonte: `Controllers/invoice_order_standard_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `POST v1/invoice` | [enviar-nota-fiscal.md](invoice/post-v1-invoice.md) | Envia o XML da nota e vincula aos pedidos |
| `PUT v1/invoice/clean` | [desvincular-nota-fiscal.md](invoice/put-v1-invoice-clean.md) | Remove o vínculo da nota com os pedidos |
| `GET v1/invoice/files` | [obter-xml-e-pdf.md](invoice/get-v1-invoice-files.md) | Retorna XML e DANFE em base64 |

### Ordens de serviço — `service-order/`

Fonte: `Controllers/service_order_standard_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `GET v1/service-order/status` | [consultar-status-os.md](service-order/get-v1-service-order-status.md) | Status de montagem de volumes ou carregamento |

### Saldo de estoque — `stock-balance/`

Fonte: `Controllers/stock_balance_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `GET v1/stock-balance` | [listar-saldos.md](stock-balance/get-v1-stock-balance.md) | Saldo de todos os produtos |
| `GET v1/stock-balance/{sku}` | [consultar-saldo-por-produto.md](stock-balance/get-v1-stock-balance-id.md) | Saldo de um produto |

### Foto do estoque — `stock-snapshot/`

Fonte: `Controllers/stock_snapshot_standard_controller.tlpp`

| Rota | Documento | Finalidade |
| --- | --- | --- |
| `GET standard/v1/stock-snapshot` | [consultar-foto-do-estoque.md](stock-snapshot/get-standard-v1-stock-snapshot.md) | Saldo livre, empenhado e total com análise de divergências |

---

## Convenções

**URL base.** Todas as rotas usam `https://{domain}/rest/`. O `{domain}` varia por ambiente e é informado pela TECADI na liberação do acesso.

**Identificação do cliente.** Nunca é enviada no corpo ou em parâmetro — é derivada do usuário autenticado cruzado com o contrato ativo da filial do `tenantId`. Um token só enxerga dados do próprio cliente.

**Códigos de erro.** As rotas de pedido, saldo e etiqueta usam um campo `typeError` padronizado:

| Código | Significado |
| --- | --- |
| `001` | Cliente sem acesso ao webservice TECADI na filial informada |
| `002` | Corpo da requisição inválido ou registro não localizado |
| `004` | Estoque insuficiente para atender a demanda |
| `005` | Inconsistência de regra de negócio ao processar |

As demais rotas retornam apenas `message` (e, em alguns casos, `details`). O formato exato está documentado em cada rota.

**Códigos HTTP.** Sucesso é `200`, exceto `POST v1/invoice`, que responde `202 Accepted` com corpo vazio. Erros de negócio e de validação retornam `400`.
