# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**G0GA 3D** is a premium React + Vite AI agency website with Three.js 3D visuals, Framer Motion animations, and Tailwind CSS. Targets clients in USA, UK, Canada, and Europe. Single-page app, no backend, all data in localStorage.

## Commands

```bash
npm install          # Install all dependencies
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool / dev server |
| Three.js | 0.160 | 3D engine |
| @react-three/fiber | 8 | React renderer for Three.js |
| @react-three/drei | 9 | Three.js helpers (Stars, Float, MeshDistortMaterial) |
| Framer Motion | 11 | Scroll animations (`whileInView`) |
| Tailwind CSS | 3 | Utility styling |
| Lucide React | latest | Icons |

## Architecture

### 3D Strategy
- **HeroScene.jsx** — Only component using WebGL (`@react-three/fiber` Canvas). Lazy-loaded via `React.lazy` + `Suspense`. Canvas has `alpha: true` and `pointer-events: none` so HTML overlays it.
- **All other sections** — CSS `perspective` / `transform-style: preserve-3d` / `backface-visibility` for 3D card effects. No WebGL outside the hero.

### Color Palette (actual Tailwind tokens in `tailwind.config.js`)
| Token | Value | Usage |
|-------|-------|-------|
| `black` | `#000000` | Page background |
| `card` | `#0f0f0f` | Card backgrounds |
| `card2` | `#1a1a1a` | Secondary cards, inputs |
| `teal` | `#0d9488` | Primary accent, CTAs |
| `teal2` | `#14b8a6` | Secondary accent |
| `emerald` | `#10b981` | Tertiary accent |

CSS gradient classes: `text-grad` and `glow` / `glow2` defined in `src/index.css`.

### Content & Data
**`src/data/content.js`** is the single source of truth for: `services[]`, `portfolio[]`, `pricing[]`, `team[]`, `testimonials[]`, `chatResponses{}`.

**Exception:** `Calculator.jsx` has its own hardcoded `svcs[]` and `addons[]` arrays — when updating service prices, update **both** `content.js` and `Calculator.jsx`.

### Chat Widget
`ChatWidget.jsx` → `getBotReply()` does substring matching against `chatResponses` keys (lowercased input). Conversations saved to `localStorage` key `g0ga_chat`.

### Lead Storage
Contact form → `localStorage` key `g0ga_leads` (JSON array). Inspect via DevTools → Application → Local Storage.

### Animation Pattern
```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.1 }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
>
```

## Common Edits

**Add a service:** Add to `content.js → services[]`. `Services.jsx` auto-renders from the array.

**Change pricing:** Edit `content.js → pricing[]` AND `Calculator.jsx → svcs[]` (both must match).

**Change WhatsApp number:** Search `wa.me/923001234567` — appears in `Contact.jsx`, `Footer.jsx`, and `content.js → company.whatsapp`.

**Update socials:** Edit the socials arrays in both `Contact.jsx` and `Footer.jsx` independently.

**Change Hero 3D shape:** In `HeroScene.jsx → <MainShape>`, swap `<torusKnotGeometry>` for any Three.js geometry.

**Add chat response:** Add key → string to `content.js → chatResponses{}`. Keys match as substrings on lowercased user input.

## Deployment

Static SPA — no server needed. Build output is `dist/`.

```bash
npm run build
# Deploy dist/ to Vercel or Netlify
```

## Agent Rules

- **Never hardcode content in components** — always use `src/data/content.js`. The only exception is `Calculator.jsx` which has its own price arrays that must be kept in sync manually.
- **Never install new npm packages** without confirming with the user first.
- **When updating WhatsApp or socials**, always update all occurrences — `content.js`, `Contact.jsx`, and `Footer.jsx`.
- **Do not modify `HeroScene.jsx`** (Three.js canvas) unless specifically asked — it is performance-sensitive.
- **CSS class names** come from Tailwind tokens or custom classes in `index.css`. Do not use raw hex colors inline when a token exists.
- **No new components** unless the feature clearly cannot fit in an existing one.

## Owner
CEO: **Mrgoga** · WhatsApp: `wa.me/923001234567`
