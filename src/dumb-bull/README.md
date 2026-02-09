# DUMB BULL PWA Prototype

This folder contains the React component scaffold for the `DUMB BULL` game concept.

## Files

- `App.jsx`: main game scene (React Three Fiber + Zustand).

## Required public assets

Place these in the hosting app's `public/` folder:

1. `bull_run.png` - running side profile sprite (transparent PNG)
2. `bull_smash.png` - action pose sprite (transparent PNG)
3. `bull_idle.png` - optional idle/menu sprite
4. `track.mp3` - soundtrack audio file

## Suggested setup

```bash
npm create vite@latest dumb-bull -- --template react
cd dumb-bull
npm install three @types/three @react-three/fiber @react-three/drei zustand
```

Then replace `src/App.jsx` with this folder's `App.jsx` and run:

```bash
npm run dev
```
