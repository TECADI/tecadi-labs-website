# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Site institucional da Tecadi Labs, uma Logtech focada em soluções de software para logística. É um site estático hospedado no GitHub Pages (www.tecadilabs.com.br).

## Tecnologias

- HTML5 estático (sem build system)
- CSS3 com variáveis CSS (design tokens)
- Bootstrap 5.2.1 (via CDN)
- JavaScript vanilla inline
- GitHub Pages para hospedagem

## Arquitetura

### Estrutura de Arquivos
```
index.html          # Landing page principal
css/
  colors.css        # Design tokens: cores, gradientes, sombras
  fonts.css         # Tipografia, espaçamento, border-radius, transições
  style.css         # Componentes e animações
assets/
  fonts/            # Fontes customizadas (Sansation, Comfortaa)
  images/           # Imagens do site incluindo team/
  icons/            # SVGs de ícones e logos
comunicado/         # Página de comunicado de migração de servidor
```

### Sistema de Design (CSS Variables)

As variáveis estão divididas em dois arquivos:
- **colors.css**: `--primary-*`, `--surface-*`, `--text-*`, `--gradient-*`, `--shadow-*`
- **fonts.css**: `--text-*` (escala tipográfica), `--space-*` (espaçamento 8px base), `--radius-*`, `--transition-*`

### Componentes Principais (style.css)
- Navbar fixa com efeito glassmorphism no scroll (`.navbar.scrolled`)
- Hero section com overlay gradiente
- Botões: `.button-view` (primário), `.button-navbar` (outline)
- Hexágonos da equipe com hover animado (`.hexagon-shadow`)
- Animações de reveal no scroll (`.reveal`)
- Cards e seções semânticas (`.section`, `.section-header`)

## Desenvolvimento

### Para visualizar o site
Abrir `index.html` diretamente no navegador. Não há build step.

### Formulário de contato
O formulário faz POST para `http://localhost:3456/send-contact-email`. Em produção, esse endpoint precisa estar configurado.

### Equipe (hexágonos)
A lista de membros está no array `employees` em `index.html` (linha ~450). O grid é gerado dinamicamente via JavaScript.

## Branches

- `main`: branch de produção (GitHub Pages)
- `dev`: branch de desenvolvimento

## Observações

- Imagens da equipe ficam em `assets/images/team/`
- O CNAME configura o domínio customizado
- Responsivo com breakpoint principal em 760px
