# Architecture Overview

## Project Information

**Project Name**: Kouu's Documentation / Portfolio
**Owner**: Kouu / Quan Hieu
**Created**: 2026-06-14
**Last Updated**: 2026-06-14

---

## High-Level Architecture

### System Components
1. **Frontend**: Static Multi-page (HTML5)
2. **Styling**: Vanilla CSS3 + Custom CSS variables for theme management
3. **Logic**: Native JavaScript (ES6) for DOM manipulation and interactive elements
4. **Hosting / Deployment**: Static hosting (GitHub Pages)

### Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                    index.html                       │
│             (Main Portfolio Landing Page)            │
└──────┬───────────────────┬───────────────────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    about/    │    │    blog/     │    │   project/   │
│  index.html  │    │  index.html  │    │  index.html  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────┬───────┴───────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                 Shared Assets                       │
│    style.css (variables) + scripts.js (toggle)       │
└─────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### Decision 1: Vanilla Stack
- **Decision**: Avoid frontend frameworks (Next.js/React/Vue). Build strictly with semantic HTML5, Vanilla CSS3, and ES6 JS.
- **Reason**: Near-zero bundle size, instant page loads, and simplified static hosting requirements.

### Decision 2: Multi-Page Folder Structure
- **Decision**: Structure subpages in distinct directories containing an `index.html` (e.g., `/about/index.html`).
- **Reason**: Allows clean paths/routing (e.g., `https://domain/about/`) without needing a server-side router or complex URL rewriting.

### Decision 3: Client-side CSS Theme Variable Toggle
- **Decision**: Implement light/dark modes using CSS custom variables toggled via body class addition (`body.dark-mode`) in native JS.
- **Reason**: Zero-dependency, performant, and avoids flash of unstyled content (FOUC) by utilizing standard CSS class hierarchies.

### Decision 4: Global Monospace Developer Aesthetic
- **Decision**: Standardize all visual elements using Google Fonts' `JetBrains Mono` and a JSON-structured information display.
- **Reason**: Highlights the developer background and terminal-centric identity of the owner.

---

## File Structure

```
portfolio-root/
├── about/
│   └── index.html
├── blog/
│   └── index.html
├── project/
│   └── index.html
├── icon/
│   └── (custom SVGs/images)
├── CNAME
├── index.html
├── meomeo.jpg
├── scripts.js
└── style.css
```

---

## Constraints

- [ ] All code must build on standard client web APIs.
- [ ] Responsive design must be maintained down to mobile widths using CSS media queries.
- [ ] Consistent path references to shared assets (CSS, JS, images) across root and nested page directories.
- [ ] No inline style attributes (maintain separation of concerns).

---

## Links to Key Files

- [index.html](file:///c:/Users/karus/portfolio/index.html) - Landing page
- [style.css](file:///c:/Users/karus/portfolio/style.css) - Global stylesheets and color tokens
- [scripts.js](file:///c:/Users/karus/portfolio/scripts.js) - Interactive theme toggle logic
