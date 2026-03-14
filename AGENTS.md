# AGENTS.md

## What This Repository Does

This project is a browser-only Spider Graph (Radar Chart) generator built with Next.js App Router, React, TypeScript, and Tailwind CSS v4.

Users can:
- Configure chart dimensions (axes).
- Add, edit, hide, and remove data series.
- Change scale settings (min, max, step).
- Toggle visual elements (grid, axis, labels, legend, points, filled areas).
- Import/export full chart state as JSON.
- Export the rendered chart as SVG.

## Codebase Map

- app/layout.tsx
  - Root layout and metadata.
  - Loads global CSS.

- app/page.tsx
  - Main client page and state owner.
  - Initializes DEFAULT_STATE.
  - Wires editor and graph renderer.
  - Implements JSON export, JSON import, and SVG export.

- components/spider-graph-editor.tsx
  - Control panel UI.
  - Produces immutable state updates through onChange.
  - Uses nanoid to create stable IDs for new dimensions and series.
  - Enforces minimum constraints in UI actions:
    - Dimensions cannot be reduced below 3.
    - Series cannot be reduced below 1.

- components/spider-graph.tsx
  - Pure SVG renderer for chart visuals.
  - Uses memoized geometry computation for rings and series points.
  - Renders only visible series where show is not false.
  - Provides point hover tooltip and optional legend.
  - Guards against malformed value arrays by deriving missing values from scale.min.

- lib/spider-graph-geometry.ts
  - Pure geometry/math helpers:
    - Axis angle computation.
    - Polygon vertices.
    - Value normalization to radius.
    - Label position and alignment.
    - SVG points serialization.

- types/spider-graph.ts
  - Source of truth for all chart/domain types:
    - Dimension
    - ScaleConfig
    - Series
    - SpiderGraphConfig
    - SpiderGraphState

## Runtime Behavior and Data Flow

1. app/page.tsx creates and owns SpiderGraphState.
2. SpiderGraphEditor receives state + onChange and emits full, immutable updates.
3. SpiderGraph receives config + series and computes derived rendering data.
4. Export features:
   - JSON export downloads the full current state object.
   - SVG export serializes the rendered SVG node.
5. Import feature:
   - Parses user JSON.
   - Validates minimum shape (config, dimensions array with length >= 3, series array).
   - Replaces current state when valid.

## UI and Data Invariants

- Minimum dimension count: 3.
- Minimum series count: 1.
- When dimensions are added/removed, each series values array is kept aligned.
- Renderer fills missing values with scale.min to avoid runtime render failures.

## Dependency Audit

Reviewed package usage against imports and runtime behavior.

Runtime dependencies:
- next: framework/runtime.
- react and react-dom: UI runtime.
- nanoid: ID generation in editor actions.

Dev dependencies:
- typescript and @types packages: type checking and editor tooling.
- eslint and eslint-config-next: linting and Next.js rules.
- tailwindcss and @tailwindcss/postcss: styling pipeline.

Result:
- No unused dependency was found in the current code.
- No missing dependency was identified for current functionality.

## Vercel Deployment Readiness

Current readiness status (validated locally):
- npm run lint passes.
- npm run build passes.
- next.config.ts defines turbopack.root = process.cwd(), which avoids root inference warnings in parent-lockfile environments.

Recommended Vercel project settings:
- Framework Preset: Next.js
- Install Command: npm ci
- Build Command: npm run build
- Output Directory: leave empty (default for Next.js)
- Node.js: latest available LTS compatible with Next.js 16

Environment variables:
- None required for current functionality.

## Verification Commands

Use these before deploy:

    npm ci
    npm run lint
    npm run build

Local production smoke test:

    npm run build
    npm run start

Then verify in browser:
- Editor updates are reflected in the chart.
- JSON import/export round-trips a valid state.
- SVG export downloads a valid SVG file.

## Maintenance Notes

- Keep lib/spider-graph-geometry.ts pure and deterministic.
- If state schema changes, update both type definitions and default/validation logic:
  - types/spider-graph.ts
  - app/page.tsx (DEFAULT_STATE and import validation)
  - components/spider-graph-editor.tsx where assumptions depend on schema
- If server-side features are introduced later, document required environment variables and update deployment notes.
