# MyTracker Frontend 🥙

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

## Media

### Dashboard
<img width="2038" alt="Dashboard" src="https://github.com/user-attachments/assets/76e27573-6e67-43cb-94f8-2ee22a02d149" />

### Diary
<img width="2038" alt="Diary" src="https://github.com/user-attachments/assets/37bcaf49-8fc0-4ce6-85e6-4b50fb20735b" />

### Progress
<img width="2038" alt="Progress" src="https://github.com/user-attachments/assets/7698ec67-1654-448f-b5f9-8abf3c36d217" />

### Profile
<img width="2038" alt="Profile" src="https://github.com/user-attachments/assets/4df565e1-f7f8-4d5c-ac86-9c04f19dbec0" />

### Food Search
<img width="2038" alt="Food Search" src="https://github.com/user-attachments/assets/c90ed461-7e9d-4f50-91c4-f023f576272d" />

### Food Page
<img width="2038" alt="Food Page" src="https://github.com/user-attachments/assets/66b3028b-f972-46d8-9893-fb56f5d1557a" />

### Macros
<img width="2038" alt="Macros" src="https://github.com/user-attachments/assets/ed8554a6-7bf0-4021-b62e-f85225d4f623" />

### Macros Edit
<img width="2038" alt="Macros Edit" src="https://github.com/user-attachments/assets/ff900212-6a07-4659-8c49-b2d139e94a12" />

### Goal Creation
<img width="2038" alt="Goal Creation" src="https://github.com/user-attachments/assets/6cb10f89-e631-4444-8476-4e787c47971e" />


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
