# Deploy G0GA 3D

Build and deploy the static site.

## Steps

```bash
# 1. Build production bundle
npm run build

# 2a. Deploy to Vercel (if CLI installed)
vercel --prod

# 2b. OR preview the build locally first
npm run preview
```

## Notes
- Output is `dist/` folder — fully static, no server needed
- Drag `dist/` to vercel.com/new or app.netlify.com/drop for manual deploy
- No environment variables needed — all data is in localStorage
