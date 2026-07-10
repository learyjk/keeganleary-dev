# keeganleary.dev

Keegan Leary's portfolio, built with Astro.

The interface is based on a continuous-feed archival document system. A custom WebGL
"temporal print buffer" shader adds quantized noise, scan lines, and pointer-driven
signal ripples behind the page.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Project structure

- `src/pages/index.astro` — responsive portfolio interface
- `src/scripts/print-buffer.ts` — WebGL background shader
- `public/favicon.svg` — custom KL favicon
