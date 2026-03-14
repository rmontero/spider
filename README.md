# Spider Graph Generator

Browser-based Spider Graph (Radar Chart) generator built with Next.js, React, TypeScript, and Tailwind CSS.

## What This App Does

This app lets you build and export radar charts quickly from a visual editor.

You can:
- Create and rename dimensions (axes).
- Add, remove, and style multiple data series.
- Control scale settings (min, max, step).
- Toggle chart visuals like grid, labels, points, legend, and filled areas.
- Set a custom chart title.
- Configure chart background color.
- Import/export chart state as JSON.
- Export the chart as SVG and PNG.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- nanoid (stable IDs for dimensions/series)

## Tools Used To Build It

- Visual Studio Code
- GitHub Copilot (GPT-5.3-Codex)
- npm scripts for lint/build validation
- ESLint + Next.js rules

## Built In ~5 Minutes With Good AI Prompts

This project was developed very quickly using an AI-assisted prompt workflow.

Why it moved fast:
- The prompts were specific and incremental (one clear change at a time).
- Each prompt asked for implementation plus validation (lint/build).
- Features were scoped to visible outcomes: title editing, exports, responsive layout, and styling controls.
- The AI handled repetitive wiring across types, state, UI, and renderer layers.

Example prompt style that worked well:
- "Make the chart title configurable and keep JSON import backward compatible."
- "Add PNG export using the rendered SVG."
- "Make the layout mobile friendly while preserving desktop behavior."

Good prompts reduced iteration time and made it possible to go from idea to working app in just a few minutes.

## Run Locally

Install and start dev server:

```bash
npm ci
npm run dev
```

Open http://localhost:3000

## Validate and Build

```bash
npm run lint
npm run build
```

## Deploy (Vercel)

Recommended settings:
- Framework Preset: Next.js
- Install Command: npm ci
- Build Command: npm run build
- Output Directory: default (leave empty)

No environment variables are required for the current app.
