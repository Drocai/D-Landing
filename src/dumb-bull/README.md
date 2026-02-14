# DUMB BULL PWA Prototype

This folder contains the React component scaffold for the `DUMB BULL` game concept.

## Files

- `App.jsx`: main game scene (React Three Fiber + Zustand).

## Public assets

Place the required asset in the hosting app's `public/` folder:

1. `bull_run.png` – running side profile sprite (transparent PNG, required by the current `App.jsx` prototype)

Optional/future assets (for extended prototypes or additional scenes):

- `bull_smash.png` – action pose sprite (transparent PNG)
- `bull_idle.png` – idle/menu sprite
- `track.mp3` – soundtrack audio file

## Suggested setup

```bash
npm create vite@latest dumb-bull -- --template react
cd dumb-bull
npm install three @types/three @react-three/fiber @react-three/drei zustand
# Tailwind CSS is used for styling in App.jsx; install and initialize it:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then replace `src/App.jsx` with this folder's `App.jsx` and run:

```bash
npm run dev
```
