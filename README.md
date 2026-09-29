# <img src="public/logo.png" alt="AlphaDate Logo" height="36" width="54" align="center" /> AlphaDate

**Live Application**: [alphadate.vdovareize.me](https://alphadate.vdovareize.me)

> **Про застосунок**:  
> Вебзастосунок для пар, який допомагає організовувати та відстежувати тематичні побачення за українською абеткою (від **А** до **Я**). Кожне побачення прив'язується до обраної літери, черга переходить між партнерами, а збережені враження формують спільний щоденник спогадів.

---

A modern, delightful web application for couples to organize and track alphabet-themed dates through the Ukrainian alphabet (from **А** to **Я**). Each date is tied to a selected letter, turns alternate between partners, and completed dates form a shared memory journal.

---

## Features

- **Full Ukrainian Alphabet Support**: Complete set of 33 letters. Each letter has an explicit status (*available*, *active*, *used*, *excluded*).
- **Interactive Roulette Picker**: Randomly pick the next available letter with a smooth 4-second deceleration animation across remaining candidates and a celebratory winner pulse.
- **Dynamic Accent Animations**:
  - Smooth reveal of the active letter card with an 800ms perimeter rim light beam when a new letter is selected.
  - One-time perimeter sweep animation around the active partner's badge.
- **Turn-Based Partner Management**: Clear visual indicator displaying whose turn it is to plan the date, with automatic turn alternation upon completion.
- **Non-Intrusive Countdown Timer**: 30-day date countdown that renders in place and fades in smoothly without layout shifts.
- **Date Suggestions Drawer**: Expandable panel with curated activity ideas for each letter, backed by a module-level cache to eliminate duplicate network requests.
- **Date History Journal**: Chronological log of completed dates featuring notes, dates, and author tags with instant filtering.
- **Optional PIN Protection**: Couples can protect their shared boards with an optional 4-digit PIN code. Protected boards enforce authentication via `x-board-pin` headers and a dedicated unlocking modal dialog.
- **Offline-First & Resilient Sync**:
  - Instant synchronous persistence via `localStorage` (works fully offline).
  - Background REST API synchronization equipped with `AbortController` to prevent race conditions.
- **Accessibility (a11y) & Responsiveness**: Keyboard accessibility, mobile-optimized layouts, and full respect for `prefers-reduced-motion`.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Vue 3](https://vuejs.org/) (Composition API, `<script setup lang="ts">`) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (100% strict type safety, zero `any`) |
| **Routing** | [Vue Router 4](https://router.vuejs.org/) (`createWebHashHistory` for seamless deployment without server rewrites) |
| **Build & Dev Server** | [Vite 5](https://vitejs.dev/) + [vue-tsc](https://github.com/vuejs/language-tools) |
| **Styling & UI System** | Vanilla CSS + custom design tokens (pastel palette, Flat 3D Raised Depth, oat.ink principles, GPU-accelerated motion) |
| **Testing** | [Vitest](https://vitest.dev/) (20 test suites, 119 unit tests, >93% coverage) + [@vue/test-utils](https://test-utils.vuejs.org/) |
| **Linting & Formatting** | [ESLint](https://eslint.org/) (`eslint-plugin-vue`, `eslint-plugin-vuejs-accessibility`), [Prettier](https://prettier.io/) |
| **Quality & Bundle Analysis** | [dpdm](https://github.com/acrazing/dpdm) (circular dependency detection), [knip](https://knip.dev/) (dead code analysis), [size-limit](https://github.com/ai/size-limit) (bundle budget enforcement) |
| **Network Layer** | Typed native `fetch` client with `AbortSignal` cancellation and custom `ApiError` hierarchy |

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## Verification & Testing

The project is equipped with a complete suite of automated verification tools:

| Command | Description |
| :--- | :--- |
| `npm test` | Run all 88 unit tests via Vitest |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:coverage` | Generate code coverage report (v8 coverage) |
| `npm run lint` | Run ESLint with automatic fixes for code style and accessibility issues |
| `npm run format` | Format source files using Prettier |
| `npm run check:circular` | Detect circular dependencies using `dpdm` |
| `npm run check:deadcode` | Scan for unused files, exports, and dependencies via `knip` |
| `npm run check:size` | Verify JavaScript bundle size against strict thresholds via `size-limit` |

---

## Project Structure

```text
alphadate/
├── src/
│   ├── components/         # Atomic and compound UI components (modals, grid, panels)
│   ├── composables/        # Domain logic, state management, timers, and roulette
│   ├── pages/              # Route views (Home.vue, Board.vue)
│   ├── router/             # Vue Router configuration
│   ├── services/           # Network layer, REST API client, and mock datasets
│   ├── types/              # Global TypeScript interfaces and data models
│   ├── utils/              # Helper utilities (duration formatting, etc.)
│   ├── App.vue             # Root application component
│   ├── main.ts             # Application entry point
│   └── style.css           # Global CSS variables, design tokens, and base styles
├── public/                 # Static assets, icons, and favicons
├── .eslintrc.cjs           # ESLint rules and plugins configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Scripts, dependencies, and metadata
```
