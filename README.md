# 🫕 Mpishi — Kenyan AI Chef

Your personal AI-powered Kenyan cooking assistant.

## Features
- **AI Meal Suggester** — Describe your craving and Mpishi recommends authentic Kenyan meals
- **Recipe Finder** — Get step-by-step recipes for any Kenyan dish
- **Classic Combos** — Explore time-honoured Kenyan meal pairings

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
Create a `.env` file in this folder:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```
> Get your free API key at: https://console.anthropic.com

### 3. Update the API call (src/App.jsx)
Find the `callClaude` function and add your key to the headers:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
},
```

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack
- React + Vite
- Claude AI (claude-sonnet-4-20250514)
- Pure CSS (no UI framework)

---
*Chakula Bora • Ladha ya Kenya 🇰🇪*
