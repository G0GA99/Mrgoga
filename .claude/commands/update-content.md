# Update Website Content

Guide for updating any content on the G0GA 3D website.

## Rules
1. **Always edit `src/data/content.js` first** — it is the single source of truth
2. **Exception:** Pricing/services in `Calculator.jsx` (`svcs[]`, `addons[]`) must be updated separately to match
3. After editing, verify no component has hardcoded values that conflict

## What lives where

| Content | File |
|---------|------|
| Services, Portfolio, Pricing, Team, Testimonials | `src/data/content.js` |
| Chat bot responses | `src/data/content.js → chatResponses{}` |
| Calculator prices | `src/components/Calculator.jsx → svcs[]` |
| Social links | `src/components/Contact.jsx` AND `src/components/Footer.jsx` |
| WhatsApp number | `content.js → company.whatsapp` + `Contact.jsx` + `Footer.jsx` |

## After updating content
Run the dev server to verify:
```bash
npm run dev
```
