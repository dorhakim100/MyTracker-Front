# MyTracker Frontend 

MyTracker is a nutrition and workouts progress tracking platform for trainers and individuals, built with React, TypeScript, Vite, MUI, and modern charts.
It features barcode scanning, daily diary logging, macro goals, BMR/weight, workouts tracking tools, theming, and smooth UX.

## Related Links
- 🔗 [Backend Repository](https://github.com/dorhakim100/MyTracker-Back)
- 🔗 [Live Site](https://mytracker-j6fc.onrender.com/)

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

### Mobile App

### Dashboard
<img width="250" alt="Dashboard" src="https://github.com/user-attachments/assets/76e27573-6e67-43cb-94f8-2ee22a02d149" />

### Diary
<img width="250" alt="Diary" src="https://github.com/user-attachments/assets/37bcaf49-8fc0-4ce6-85e6-4b50fb20735b" />

### Progress
<img width="250" alt="Progress" src="https://github.com/user-attachments/assets/7698ec67-1654-448f-b5f9-8abf3c36d217" />

### Profile
<img width="250" alt="Profile" src="https://github.com/user-attachments/assets/4df565e1-f7f8-4d5c-ac86-9c04f19dbec0" />

### Food Search
<img width="250" alt="Food Search" src="https://github.com/user-attachments/assets/c90ed461-7e9d-4f50-91c4-f023f576272d" />

### Food Page
<img width="250" alt="Food Page" src="https://github.com/user-attachments/assets/66b3028b-f972-46d8-9893-fb56f5d1557a" />

### Macros
<img width="250" alt="Macros" src="https://github.com/user-attachments/assets/ed8554a6-7bf0-4021-b62e-f85225d4f623" />

### Macros Edit
<img width="250" alt="Macros Edit" src="https://github.com/user-attachments/assets/ff900212-6a07-4659-8c49-b2d139e94a12" />

### Goal Creation
<img width="250" alt="Goal Creation" src="https://github.com/user-attachments/assets/6cb10f89-e631-4444-8476-4e787c47971e" />

### Desktop App

### Dashboard
<img width="1723" height="913" alt="Dashboard - Desktop" src="https://github.com/user-attachments/assets/a393bf08-eb3b-42f4-913c-552c8c0d62e1" />



### Exercise Card
<img width="1719" height="775" alt="Exercise Card - Desktop" src="https://github.com/user-attachments/assets/b4d7e8c1-e999-40bc-ab17-7349d33e7fe9" />


### Exercise Details
<img width="1725" height="905" alt="Exercise Details - Weight Chart" src="https://github.com/user-attachments/assets/3a24bda0-cce7-47da-8105-d55c970973e0" />


### Past Sets Table
<img width="1716" height="909" alt="Exercise Details - Past Sets Table" src="https://github.com/user-attachments/assets/4371b79b-89d8-4377-b44c-63fca91317b3" />


### Workouts Page
<img width="1721" height="903" alt="Workouts Page" src="https://github.com/user-attachments/assets/02775771-f3cb-417e-9e50-df21feefbb44" />


### Exercise Search
<img width="1712" height="908" alt="Exercise Search" src="https://github.com/user-attachments/assets/fc01230e-c022-46c8-b3a3-3a76c309c6e1" />



### User Details
<img width="1720" height="907" alt="User Details" src="https://github.com/user-attachments/assets/162bcdec-0f20-44ec-a20a-77136889fdf7" />


### Edit Workout Page
<img width="1726" height="912" alt="Edit Workout" src="https://github.com/user-attachments/assets/06166944-0c59-4431-b373-4b4bf1bd4b79" />




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
