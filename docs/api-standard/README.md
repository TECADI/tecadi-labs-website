# Documentação da API Standard TECADI

Página publicada em **https://www.tecadilabs.com.br/docs/api-standard/**.

O conteúdo vem dos arquivos Markdown em `content/`, interpretados **em tempo de
execução** pelo navegador. Não há build: editar o `.md` e publicar já atualiza a
página.

## Estrutura

```
docs/api-standard/
  index.html    # esqueleto da página (topo, menu, rodapé) — raramente muda
  docs.css      # estilos, reaproveitando os tokens de /css/colors.css e /css/fonts.css
  docs.js       # interpretador de Markdown + roteamento, busca e índice lateral
  content/
    manifest.json   # ordem e agrupamento das rotas no menu
    README.md       # "Visão geral"
    autenticacao.md
    order/ delivery/ invoice/ service-order/ stock-balance/ stock-snapshot/ generic-list/
```

## Atualizar um documento existente

Edite o `.md` correspondente em `content/` e faça o commit. Nada mais.

Os arquivos são os mesmos do repositório `totvs-smartclient`, em
`WebServices/Tecadi/Docs`. Para trazer as alterações de lá:

```bash
cp -r ../../../totvs-smartclient/WebServices/Tecadi/Docs/*.md   content/
cp -r ../../../totvs-smartclient/WebServices/Tecadi/Docs/*/     content/
```

## Incluir uma rota nova

1. Adicione o `.md` em `content/`, seguindo o padrão dos existentes.
2. Registre-o em `content/manifest.json`, no grupo desejado:

```json
{ "file": "order/get-v2-order-items.md", "title": "Consultar itens do pedido" }
```

O `id` é opcional — por padrão é o caminho do arquivo sem a extensão
(`order/get-v2-order-items`), e vira a rota `#/order/get-v2-order-items`.

O **método HTTP** e o **caminho** exibidos no menu e no cabeçalho da página são
lidos do próprio `.md`: a segunda linha precisa ser a rota entre crases, como
nos documentos atuais:

```markdown
# API Standard TECADI — Consulta de Itens do Pedido

`GET v2/order/{order}/items`
```

Documentos sem essa linha (como a visão geral e a autenticação) aparecem no menu
sem badge de método — é o comportamento esperado.

## Markdown suportado

Títulos, tabelas, blocos de código cercados, citações (`>`), listas, regras
horizontais, negrito, itálico, código inline, links e escapes com barra
invertida. O realce de sintaxe cobre `json`, `bash` e `http`.

Dois detalhes do rendering valem conhecer:

- Tabelas com cabeçalho vazio (`| | |`) viram **tabelas de especificação**: a
  primeira coluna é tratada como rótulo. É o formato usado nos blocos
  "Método / Caminho / URL completa".
- Links para outros `.md` (`[Autenticação](../autenticacao.md)`) são convertidos
  automaticamente em rotas internas da página. Não use URLs absolutas entre
  documentos.

## Ver localmente

A página lê os `.md` via `fetch`, e o navegador bloqueia isso quando o arquivo é
aberto direto do disco (`file://`). Sirva a pasta por HTTP:

```bash
npx serve .          # na raiz do repositório
# depois abra http://localhost:3000/docs/api-standard/
```

Abrir por `file://` mostra uma mensagem explicando esse mesmo ponto.

## Observações

- O arquivo `.nojekyll` na raiz do repositório é **necessário**: sem ele o
  GitHub Pages passa o site pelo Jekyll, que pode não publicar os `.md` de
  `content/` como arquivos estáticos.
- Como o conteúdo é montado por JavaScript, buscadores indexam pouco desta
  página. Se a indexação no Google passar a importar, o caminho é gerar HTML
  estático a partir dos mesmos `.md` num passo de build.
