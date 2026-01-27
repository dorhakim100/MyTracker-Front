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
<img width="349" height="757" alt="Dashboard" src="https://github.com/user-attachments/assets/dada68b1-f8d6-44a3-b38a-fe84c8385bba" />

### Exercise Card
<img width="350" height="760" alt="Exercise Card" src="https://github.com/user-attachments/assets/a125fc46-3db0-4dec-87dc-04a9ad64f763" />

### Exercise Details
<img width="347" height="758" alt="Exercise Details" src="https://github.com/user-attachments/assets/792913d1-4d3f-43bf-af83-47701bdde5f4" />


### Diary
<img width="347" height="757" alt="Diary" src="https://github.com/user-attachments/assets/d04e6305-d066-4e23-987c-aa44fa80b3d6" />

### Workouts Page
<img width="347" height="758" alt="Workouts" src="https://github.com/user-attachments/assets/d6102a9b-cc69-43f3-be76-a2adaa60fec9" />

### Edit Workout
<img width="349" height="754" alt="Edit Workout" src="https://github.com/user-attachments/assets/9fd8ff31-f87a-458a-9dd4-78c88f52babc" />



### Profile
<img width="350" height="760" alt="User Details" src="https://github.com/user-attachments/assets/d4cf0e40-c7b0-43bc-a305-597a7bef9eb3" />



### Food Search
<img width="352" height="757" alt="Food Search" src="https://github.com/user-attachments/assets/b716ed6b-4a6c-48d1-9e8c-78afe6258592" />


### Food Page
<img width="350" height="755" alt="Food Details" src="https://github.com/user-attachments/assets/fa4b2a34-e43d-40a2-a602-b489fcc9cad7" />


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
