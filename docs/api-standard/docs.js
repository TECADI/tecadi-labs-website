/**
 * docs.js — documentação da API Standard TECADI.
 *
 * Os documentos são lidos e interpretados em tempo de execução a partir dos
 * arquivos Markdown em `content/`. Para publicar uma alteração basta editar o
 * .md correspondente — não há etapa de build.
 *
 * Para incluir uma rota nova: adicione o .md em `content/` e registre-o em
 * `content/manifest.json`.
 */

(function () {
  "use strict";

  /* ========================================
     Markdown -> HTML
     ========================================

     Cobre o subconjunto usado nos documentos da API: títulos, tabelas, blocos
     de código cercados, citações, listas, regras horizontais, negrito, itálico,
     código inline e links. Não é um parser genérico — é proposital, para manter
     a página sem dependências externas. */

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function span(cls, text) {
    return '<span class="tok-' + cls + '">' + escapeHtml(text) + "</span>";
  }

  /** Percorre `code` com `regex`, aplicando `paint` nos trechos casados. */
  function scan(code, regex, paint) {
    var out = "";
    var cursor = 0;
    var match;

    regex.lastIndex = 0;
    while ((match = regex.exec(code)) !== null) {
      out += escapeHtml(code.slice(cursor, match.index));
      out += paint(match);
      cursor = match.index + match[0].length;
      if (match[0] === "") regex.lastIndex += 1;
    }

    return out + escapeHtml(code.slice(cursor));
  }

  function highlightJson(code) {
    var token =
      /("(?:\\.|[^"\\])*")(\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

    return scan(code, token, function (m) {
      if (m[1]) return span("key", m[1]) + escapeHtml(m[2]);
      if (m[3]) return span("str", m[3]);
      if (m[4]) return span("lit", m[4]);
      return span("num", m[5]);
    });
  }

  function highlightBash(code) {
    var token =
      /(#[^\n]*)|('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*")|(^|\s)(--?[A-Za-z][\w-]*)/g;

    return scan(code, token, function (m) {
      if (m[1]) return span("comment", m[1]);
      if (m[2]) return span("str", m[2]);
      if (m[3]) return span("str", m[3]);
      return escapeHtml(m[4]) + span("flag", m[5]);
    });
  }

  function highlightHttp(code) {
    var lines = code.split("\n");
    var bodyStart = lines.indexOf("");
    var head = bodyStart === -1 ? lines : lines.slice(0, bodyStart);
    var body = bodyStart === -1 ? [] : lines.slice(bodyStart + 1);

    var painted = head.map(function (line, index) {
      if (index === 0) {
        var request = line.match(/^([A-Z]+)(\s+)(\S+)(.*)$/);
        if (request) {
          return (
            span("method", request[1]) +
            escapeHtml(request[2]) +
            span("path", request[3]) +
            escapeHtml(request[4])
          );
        }
      }

      var header = line.match(/^([A-Za-z-]+)(:\s*)(.*)$/);
      if (header) {
        return span("key", header[1]) + escapeHtml(header[2]) + escapeHtml(header[3]);
      }

      return escapeHtml(line);
    });

    var tail = body.length ? "\n\n" + highlightJson(body.join("\n")) : "";
    return painted.join("\n") + tail;
  }

  function highlight(code, lang) {
    if (lang === "json") return highlightJson(code);
    if (lang === "bash" || lang === "sh") return highlightBash(code);
    if (lang === "http") return highlightHttp(code);
    return escapeHtml(code);
  }

  var PLACEHOLDER = "\u0000";
  var ESCAPE_SLOT = "\u0001";

  /**
   * Converte negrito, itálico, código inline e links.
   *
   * Código inline e caracteres escapados com barra invertida saem de cena antes
   * do processamento: assim um `\*` literal não é confundido com marcação, e o
   * conteúdo de `código` não é reinterpretado.
   */
  function inline(text, resolveLink) {
    var codes = [];
    var escaped = [];

    var work = text.replace(/`([^`]+)`/g, function (_, code) {
      codes.push(code);
      return PLACEHOLDER + (codes.length - 1) + PLACEHOLDER;
    });

    work = work.replace(/\\([\\`*_{}\[\]()#+\-.!|<>])/g, function (_, char) {
      escaped.push(char);
      return ESCAPE_SLOT + (escaped.length - 1) + ESCAPE_SLOT;
    });

    work = escapeHtml(work);

    work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      var target = resolveLink ? resolveLink(href) : href;
      var external = /^https?:/.test(target);
      var attrs = external ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + target + '"' + attrs + ">" + label + "</a>";
    });

    work = work.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    work = work.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

    work = work.replace(
      new RegExp(ESCAPE_SLOT + "(\\d+)" + ESCAPE_SLOT, "g"),
      function (_, index) {
        return escapeHtml(escaped[Number(index)]);
      },
    );

    return work.replace(
      new RegExp(PLACEHOLDER + "(\\d+)" + PLACEHOLDER, "g"),
      function (_, index) {
        return "<code>" + escapeHtml(codes[Number(index)]) + "</code>";
      },
    );
  }

  function isTableSeparator(line) {
    return /^\|[\s:|-]+\|$/.test(line) && line.indexOf("-") !== -1;
  }

  function renderTable(rows, resolveLink) {
    function cells(line) {
      return line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map(function (cell) {
          return cell.trim();
        });
    }

    var header = cells(rows[0]);
    var body = rows.slice(2).map(cells);

    // Tabelas de especificação (`| | |`) não têm cabeçalho visível: viram pares
    // rótulo/valor, como no bloco "Método / Caminho / URL completa".
    var headless = header.every(function (cell) {
      return cell === "";
    });

    var head = headless
      ? ""
      : "<thead><tr>" +
        header
          .map(function (cell) {
            return "<th>" + inline(cell, resolveLink) + "</th>";
          })
          .join("") +
        "</tr></thead>";

    var bodyHtml = body
      .map(function (row) {
        return (
          "<tr>" +
          row
            .map(function (cell) {
              return "<td>" + inline(cell, resolveLink) + "</td>";
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");

    return (
      '<div class="table-scroll"><table class="md-table' +
      (headless ? " md-table--spec" : "") +
      '">' +
      head +
      "<tbody>" +
      bodyHtml +
      "</tbody></table></div>"
    );
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Converte Markdown em HTML.
   *
   * @param {string} source              conteúdo do .md
   * @param {object} [options]
   * @param {Function} [options.resolveLink] traduz href do Markdown para href final
   * @param {Function} [options.onHeading]   recebe { level, text, id } de cada título
   * @param {string} [options.idPrefix]      prefixo dos ids gerados para os títulos
   */
  function mdToHtml(source, options) {
    var opts = options || {};
    var resolveLink = opts.resolveLink;
    var onHeading = opts.onHeading;
    var idPrefix = opts.idPrefix || "";

    var lines = source.replace(/\r\n/g, "\n").split("\n");
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (line.trim() === "") {
        i += 1;
        continue;
      }

      // Bloco de código cercado
      var fence = line.match(/^```(\w*)\s*$/);
      if (fence) {
        var lang = fence[1] || "text";
        var codeLines = [];
        i += 1;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          codeLines.push(lines[i]);
          i += 1;
        }
        i += 1;
        out.push(
          '<div class="code-block" data-lang="' +
            lang +
            '">' +
            '<button class="code-copy" type="button">Copiar</button>' +
            "<pre><code>" +
            highlight(codeLines.join("\n"), lang) +
            "</code></pre>" +
            "</div>",
        );
        continue;
      }

      // Regra horizontal
      if (/^---+$/.test(line.trim())) {
        out.push('<hr class="md-rule" />');
        i += 1;
        continue;
      }

      // Título
      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        var level = heading[1].length;
        var text = heading[2].trim();
        var id = idPrefix + slugify(text);
        if (onHeading) onHeading({ level: level, text: text, id: id });
        out.push(
          "<h" + level + ' id="' + id + '">' + inline(text, resolveLink) + "</h" + level + ">",
        );
        i += 1;
        continue;
      }

      // Tabela
      if (line.charAt(0) === "|" && isTableSeparator(lines[i + 1] || "")) {
        var rows = [];
        while (i < lines.length && lines[i].charAt(0) === "|") {
          rows.push(lines[i]);
          i += 1;
        }
        out.push(renderTable(rows, resolveLink));
        continue;
      }

      // Citação — o conteúdo interno é reprocessado como blocos
      if (line.charAt(0) === ">") {
        var quoted = [];
        while (i < lines.length && lines[i].charAt(0) === ">") {
          quoted.push(lines[i].replace(/^>\s?/, ""));
          i += 1;
        }
        out.push(
          '<blockquote class="md-note">' +
            mdToHtml(quoted.join("\n"), { resolveLink: resolveLink, idPrefix: idPrefix }) +
            "</blockquote>",
        );
        continue;
      }

      // Lista não ordenada
      if (/^[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^[-*]\s+/, ""));
          i += 1;
        }
        out.push(
          '<ul class="md-list">' +
            items
              .map(function (item) {
                return "<li>" + inline(item, resolveLink) + "</li>";
              })
              .join("") +
            "</ul>",
        );
        continue;
      }

      // Parágrafo
      var paragraph = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        lines[i].charAt(0) !== "|" &&
        lines[i].charAt(0) !== ">" &&
        !/^```/.test(lines[i]) &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^---+$/.test(lines[i].trim()) &&
        !/^[-*]\s+/.test(lines[i])
      ) {
        paragraph.push(lines[i]);
        i += 1;
      }
      out.push("<p>" + inline(paragraph.join(" ").trim(), resolveLink) + "</p>");
    }

    return out.join("\n");
  }

  /* ========================================
     Estado e utilitários
     ======================================== */

  var docs = [];
  var byId = {};
  var linkMap = {};
  var activeId = null;
  var spy = null;

  var el = {
    sidebar: document.getElementById("sidebar"),
    nav: document.querySelector(".nav"),
    content: document.getElementById("conteudo"),
    search: document.getElementById("search"),
    searchEmpty: document.querySelector(".search-empty"),
    tocList: document.querySelector(".toc-list"),
    toc: document.querySelector(".toc"),
    menuToggle: document.querySelector(".menu-toggle"),
    backdrop: document.querySelector(".sidebar-backdrop"),
  };

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  var docIdOf = function (file) {
    return file.replace(/\.md$/, "");
  };
  var dashed = function (id) {
    return id.replace(/\//g, "-");
  };

  /** Traduz um href do Markdown (`../autenticacao.md`) em rota da página. */
  function resolveLink(href) {
    if (/^(https?:|mailto:)/.test(href)) return href;
    if (href.charAt(0) === "#") return href;

    var parts = href.split("#");
    var key = parts[0].replace(/^(\.\.\/|\.\/)+/, "").replace(/\.md$/, "");
    var target = linkMap[key] || linkMap[key.split("/").pop()];

    if (!target) return href;
    if (parts[1]) return "#" + dashed(target) + "--" + parts[1];
    return "#/" + target;
  }

  /* ========================================
     Carregamento dos documentos
     ======================================== */

  function fetchText(path) {
    return fetch(path, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error(path + " -> HTTP " + response.status);
      return response.text();
    });
  }

  /**
   * Extrai método, caminho e resumo do .md.
   * O padrão dos documentos é: H1, linha com `MÉTODO caminho`, parágrafo resumo.
   */
  function parseMeta(source) {
    var route = source.match(/^`(GET|POST|PUT|PATCH|DELETE)\s+([^`]+)`\s*$/m);

    return {
      method: route ? route[1] : null,
      path: route ? route[2].trim() : null,
    };
  }

  function loadDocs(manifest) {
    var entries = [];

    manifest.groups.forEach(function (group) {
      group.docs.forEach(function (entry) {
        entries.push({
          file: entry.file,
          id: entry.id || docIdOf(entry.file),
          title: entry.title,
          group: group.title,
        });
      });
    });

    return Promise.all(
      entries.map(function (entry) {
        return fetchText("content/" + entry.file).then(function (source) {
          var meta = parseMeta(source);
          return {
            file: entry.file,
            id: entry.id,
            title: entry.title,
            group: entry.group,
            source: source,
            method: meta.method,
            path: meta.path,
            haystack: normalize(entry.title + " " + entry.group + " " + source),
          };
        });
      }),
    );
  }

  /* ========================================
     Renderização
     ======================================== */

  function methodBadge(method) {
    if (!method) return "";
    return '<span class="method method--' + method.toLowerCase() + '">' + method + "</span>";
  }

  function renderSidebar(manifest) {
    var html = manifest.groups
      .map(function (group) {
        var items = group.docs
          .map(function (entry) {
            var doc = byId[entry.id || docIdOf(entry.file)];
            if (!doc) return "";

            return (
              '<li><a class="nav-doc' +
              (doc.method ? "" : " nav-doc--plain") +
              '" href="#/' +
              doc.id +
              '" data-doc="' +
              doc.id +
              '">' +
              methodBadge(doc.method) +
              '<span class="nav-doc-label">' +
              escapeHtml(doc.title) +
              "</span>" +
              (doc.path
                ? '<span class="nav-doc-path">' + escapeHtml(doc.path) + "</span>"
                : "") +
              "</a></li>"
            );
          })
          .join("");

        return (
          '<div class="nav-group" data-group="' +
          normalize(group.title) +
          '">' +
          '<p class="nav-group-title">' +
          escapeHtml(group.title) +
          "</p>" +
          '<ul class="nav-list">' +
          items +
          "</ul></div>"
        );
      })
      .join("");

    el.nav.innerHTML = html;
  }

  function renderArticles() {
    el.content.innerHTML = docs
      .map(function (doc, index) {
        var prefix = dashed(doc.id) + "--";
        var headings = [];

        var body = mdToHtml(doc.source, {
          resolveLink: resolveLink,
          idPrefix: prefix,
          onHeading: function (heading) {
            headings.push(heading);
          },
        });

        doc.headings = headings.filter(function (heading) {
          return heading.level === 2;
        });

        var endpoint = doc.path
          ? '<div class="endpoint">' +
            methodBadge(doc.method) +
            '<code class="endpoint-path">' +
            escapeHtml(doc.path) +
            "</code>" +
            '<button class="endpoint-copy" type="button" data-copy="' +
            escapeHtml(doc.path) +
            '">Copiar rota</button></div>'
          : "";

        var previous = docs[index - 1];
        var next = docs[index + 1];

        var pager =
          '<nav class="pager">' +
          (previous
            ? '<a class="pager-link pager-prev" href="#/' +
              previous.id +
              '"><span class="pager-hint">Anterior</span><span class="pager-title">' +
              escapeHtml(previous.title) +
              "</span></a>"
            : "<span></span>") +
          (next
            ? '<a class="pager-link pager-next" href="#/' +
              next.id +
              '"><span class="pager-hint">Próximo</span><span class="pager-title">' +
              escapeHtml(next.title) +
              "</span></a>"
            : "<span></span>") +
          "</nav>";

        return (
          '<article class="doc" id="doc-' +
          dashed(doc.id) +
          '" data-doc="' +
          doc.id +
          '" hidden>' +
          endpoint +
          '<div class="doc-body">' +
          body +
          "</div>" +
          pager +
          "</article>"
        );
      })
      .join("");
  }

  function renderToc(doc) {
    if (!el.tocList) return;

    el.tocList.innerHTML = doc.headings
      .map(function (heading) {
        return '<li><a href="#' + heading.id + '">' + escapeHtml(heading.text) + "</a></li>";
      })
      .join("");

    if (el.toc) el.toc.hidden = doc.headings.length === 0;
    observeHeadings(doc);
  }

  /** Destaca no índice lateral o título visível no momento. */
  function observeHeadings(doc) {
    if (spy) spy.disconnect();
    if (!doc.headings.length || !("IntersectionObserver" in window)) return;

    var links = {};
    el.tocList.querySelectorAll("a").forEach(function (link) {
      links[link.getAttribute("href").slice(1)] = link;
    });

    spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          el.tocList.querySelectorAll("a.is-active").forEach(function (link) {
            link.classList.remove("is-active");
          });
          var current = links[entry.target.id];
          if (current) current.classList.add("is-active");
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    doc.headings.forEach(function (heading) {
      var target = document.getElementById(heading.id);
      if (target) spy.observe(target);
    });
  }

  /* ========================================
     Roteamento
     ======================================== */

  function showDoc(id, anchor) {
    var doc = byId[id];
    if (!doc) return;

    if (activeId !== id) {
      document.querySelectorAll(".doc").forEach(function (article) {
        article.hidden = article.dataset.doc !== id;
      });

      document.querySelectorAll(".nav-doc").forEach(function (link) {
        link.classList.toggle("is-active", link.dataset.doc === id);
      });

      activeId = id;
      renderToc(doc);
      document.title = doc.title + " — API Standard TECADI | tecadi.labs";
    }

    if (anchor) {
      var target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }

  function route() {
    var hash = window.location.hash;

    // Rota de documento: #/order/post-v2-order
    if (hash.indexOf("#/") === 0) {
      var raw = hash.slice(2);
      var parts = raw.split("--");
      var id = parts[0];
      showDoc(byId[id] ? id : docs[0].id, parts[1] ? dashed(id) + "--" + parts[1] : null);
      return;
    }

    // Âncora de título: #order-post-v2-order--3-corpo-da-requisicao
    if (hash.length > 1) {
      var target = document.getElementById(hash.slice(1));
      var owner = target ? target.closest(".doc") : null;
      if (owner) {
        showDoc(owner.dataset.doc, hash.slice(1));
        return;
      }
    }

    showDoc(docs[0].id);
  }

  /* ========================================
     Busca
     ======================================== */

  function applySearch(term) {
    var query = normalize(term.trim());
    var visible = 0;

    document.querySelectorAll(".nav-doc").forEach(function (link) {
      var doc = byId[link.dataset.doc];
      var match = !query || doc.haystack.indexOf(query) !== -1;
      link.parentElement.hidden = !match;
      if (match) visible += 1;
    });

    document.querySelectorAll(".nav-group").forEach(function (group) {
      var items = group.querySelectorAll(".nav-list > li");
      var anyVisible = Array.prototype.some.call(items, function (item) {
        return !item.hidden;
      });
      group.hidden = !anyVisible;
    });

    if (el.searchEmpty) el.searchEmpty.hidden = visible !== 0;
  }

  /* ========================================
     Interações
     ======================================== */

  function copyToClipboard(text, button, label) {
    var done = function () {
      var original = button.textContent;
      button.textContent = label;
      button.classList.add("is-done");
      setTimeout(function () {
        button.textContent = original;
        button.classList.remove("is-done");
      }, 1600);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
      return;
    }

    // Fallback para contextos sem Clipboard API (ex.: http em rede interna)
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    try {
      document.execCommand("copy");
      done();
    } finally {
      document.body.removeChild(helper);
    }
  }

  function closeSidebar() {
    el.sidebar.classList.remove("is-open");
    if (el.backdrop) el.backdrop.hidden = true;
    if (el.menuToggle) el.menuToggle.setAttribute("aria-expanded", "false");
  }

  function bindEvents() {
    window.addEventListener("hashchange", function () {
      route();
      closeSidebar();
    });

    if (el.search) {
      el.search.addEventListener("input", function (event) {
        applySearch(event.target.value);
      });

      el.search.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.target.value = "";
          applySearch("");
          event.target.blur();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (event.key === "/" && !typing && el.search) {
        event.preventDefault();
        el.search.focus();
      }
    });

    document.addEventListener("click", function (event) {
      var copyCode = event.target.closest(".code-copy");
      if (copyCode) {
        var code = copyCode.parentElement.querySelector("code");
        copyToClipboard(code.textContent, copyCode, "Copiado");
        return;
      }

      var copyRoute = event.target.closest(".endpoint-copy");
      if (copyRoute) {
        copyToClipboard(copyRoute.dataset.copy, copyRoute, "Copiado");
      }
    });

    if (el.menuToggle) {
      el.menuToggle.addEventListener("click", function () {
        var open = el.sidebar.classList.toggle("is-open");
        el.menuToggle.setAttribute("aria-expanded", String(open));
        if (el.backdrop) el.backdrop.hidden = !open;
      });
    }

    if (el.backdrop) el.backdrop.addEventListener("click", closeSidebar);
  }

  /* ========================================
     Inicialização
     ======================================== */

  function showFatal(error) {
    var local = window.location.protocol === "file:";

    el.content.innerHTML =
      '<div class="doc-error">' +
      "<strong>Não foi possível carregar a documentação.</strong>" +
      (local
        ? "<p>A página está sendo aberta direto do disco (<code>file://</code>), e o navegador " +
          "bloqueia a leitura dos arquivos Markdown nesse modo. Sirva a pasta por HTTP — por " +
          "exemplo, <code>npx serve</code> na raiz do site — ou acesse a versão publicada.</p>"
        : "<p>Verifique se os arquivos de <code>content/</code> foram publicados junto com a página.</p>") +
      "<p><code>" +
      escapeHtml(String(error && error.message ? error.message : error)) +
      "</code></p>" +
      "</div>";
  }

  el.content.innerHTML = '<div class="doc-loading">Carregando documentação…</div>';

  fetchText("content/manifest.json")
    .then(function (raw) {
      var manifest = JSON.parse(raw);

      return loadDocs(manifest).then(function (loaded) {
        docs = loaded;

        docs.forEach(function (doc) {
          byId[doc.id] = doc;
          var key = docIdOf(doc.file);
          linkMap[key] = doc.id;
          linkMap[key.split("/").pop()] = doc.id;
        });

        renderSidebar(manifest);
        renderArticles();
        bindEvents();
        route();
      });
    })
    .catch(showFatal);
})();
