# ForgeOS Manufacturing Dashboard

A responsive manufacturing execution system (MES) command dashboard for production, warehouse inventory, and quality-control workflows. Built with Vue 3, TypeScript, Vue Router, and Tailwind CSS v4.

## Live demo

Open the deployed app here: https://dashboard-vue-vg2b.vercel.app/dashboard

## Features

- **Production dashboard** — production-line status, output progress, estimated factory OEE, and defect totals.
- **Production actions** — toggle a line between operational and downtime, or create a quality report from a line card.
- **Warehouse** — inventory by part, SKU, and storage zone, with minimum-stock warnings and one-click 100-unit restocking.
- **Quality control** — validate and submit quality reports for operational lines; review historical reports with severity badges.
- **Shared reactive state** — a typed `useFactoryStore()` composable centralizes production, inventory, quality logs, computed metrics, and simulated events.
- **Responsive dark UI** — Tailwind utilities support desktop and compact layouts.

> This is an demo project. Data is held in browser memory and seeded with sample values; it is not connected to a manufacturing system or persistent backend.

## Technology

- Vue 3 Composition API and `<script setup lang="ts">`
- TypeScript and `vue-tsc`
- Vue Router with lazy-loaded views
- Tailwind CSS v4 with the Vite plugin
- Vite, Vitest, and Playwright

The shared state is managed by a typed composable rather than a separate state-management library.

## Requirements

Use Node.js `^22.18.0` or `>=24.12.0` (see the `engines` field in `package.json`) and npm.

## Getting started

Run these commands from the project directory (the directory containing this README and `package.json`):

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal after starting.

## Routes

| Path | Page |
| --- | --- |
| `/` | Redirects to the production dashboard |
| `/dashboard` | Production lines and factory summary |
| `/warehouse` | Inventory and stock thresholds |
| `/quality-control` | Quality report form and history |

Unknown routes redirect to `/dashboard`.

## Project structure

```text
src/
├── assets/                 # Global CSS and Tailwind entry point
├── components/
│   ├── ProductionLineCard.vue
│   └── QualityLogTable.vue
├── composables/
│   └── useFactoryStore.ts  # Shared reactive state and validated actions
├── router/
│   └── index.ts
├── types/
│   └── manufacturing.ts   # Manufacturing domain types
└── views/
    ├── DashboardView.vue
    ├── WarehouseView.vue
    └── QualityView.vue
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run type-check` | Run Vue-aware TypeScript checks |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest in watch mode |
| `npm run coverage` | Run unit tests and generate text and HTML coverage reports |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run lint` | Run Oxlint and ESLint |
| `npm run format` | Format files under `src/` with Prettier |

For the first Playwright run, install its browser binaries with `npx playwright install`.

## State and data notes

- Store state is module-scoped, so calls to `useFactoryStore()` share the same reactive values within the running app.
- Store actions validate input and return a discriminated `FactoryActionResult` instead of silently ignoring invalid mutations.
- Factory OEE is a demonstration estimate based on operational-line availability, production target attainment, and a defect-count quality estimate. It is not a certified industrial OEE calculation.
- The simulator can be controlled through the store's `startSimulation()` and `stopSimulation()` actions; it is not automatically started by the current views.
