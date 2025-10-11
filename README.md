# MyTracker Frontend

MyTracker is a nutrition and progress tracking frontend built with React, TypeScript, Vite, MUI, and modern charts. It features barcode scanning, daily diary logging, macro goals, BMR/weight tools, theming, and smooth UX.

## Tech Stack

- React 19 + TypeScript, Vite
- MUI (+ custom theme)
- Chart.js + react-chartjs-2
- Lottie animations, Framer Motion
- ZXing browser barcode scanner
- Redux (react-redux)
- Axios-based HTTP service

## Features

- Dashboard with goals, macros, progress visuals
- Diary logging and item search with barcode scanning
- Weight and BMR tools (cards, charts, edits)
- Theme system with dark mode and custom components
- Responsive UI and mobile-friendly navigation
- PWA-ready assets and manifests
- IndexedDB utilities for persistence

## Getting Started

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

By default the dev server runs on `http://localhost:5173`.

The app expects an API at `http://localhost:3030/api/` in development. You can change this in `src/services/http.service.ts` or align your backend port:

### Build

```bash
npm run build
```

## Routing

Routes are defined under `src/assets/routes/routes.ts` and consumed in `src/App.tsx`. Pages live in `src/pages/*`.

## Theming

Custom theming is centralized in `src/CustomMui/shared-theme/`. It defines palettes, typography, and component defaults used by MUI components. A dark mode switch is available in `components/DarkModeSwitch/`.

## Barcode Scanning

The barcode scanner uses `@zxing/browser` and `@zxing/library`. Grant camera permissions in the browser to enable scanning from the `BarcodeScanner` component.

## Acknowledgements

- React, Vite, TypeScript, MUI
- Chart.js
- ZXing for barcode scanning
- Lottie for animations
