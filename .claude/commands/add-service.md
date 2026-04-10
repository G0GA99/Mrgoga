# Add a New Service

Steps to add a new service card to the website.

## 1. Add to `src/data/content.js → services[]`

```js
{
  id: 6,                          // next sequential id
  icon: '🔥',                     // emoji icon
  title: 'Service Name',
  shortDesc: 'Short description for the flip card front.',
  fullDesc: 'Full description shown on the card back.',
  priceFrom: 1000,
  priceTo: 5000,
  delivery: '2–3 weeks',
  features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
  color: '#0d9488',               // teal or #14b8a6 or #10b981
  shape: 'icosahedron',           // any Three.js geometry name
}
```

## 2. Add to `src/components/Calculator.jsx → svcs[]`

```js
{ label: 'Service Name', min: 1000, max: 5000 }
```

## 3. Update chat response in `content.js → chatResponses.services`
Add the new service to the services list in the chat response string.

Services.jsx auto-renders from the array — no other changes needed.
