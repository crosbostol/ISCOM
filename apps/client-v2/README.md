# Client V2 Documentation

## Overview
Modern Frontend application built with React and Vite. It serves as the user interface for the ISCOM application, replacing legacy clients.

## Tech Stack
- **Framework**: React (v19.x)
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Component Library**: Material UI (MUI) v7
- **State Management**: React Query (TanStack Query)
- **Data Fetching**: Axios
- **Routing**: React Router DOM (v7)
- **Data Grid**: MUI X Data Grid
- **Linting**: ESLint

## Prerequisites
- Node.js (Latest stable recommended)

## Configuration
The application connects to the backend API. Ensure the backend is running (default port 3000).
Proxy configuration or CORS settings in the backend allow communication.

## Scripts

### Installation
```bash
npm install
```

### Development
Starts the development server with Hot Module Replacement (HMR).
```bash
npm run dev
```
Access at `http://localhost:5173` (by default).

### Production Build
Type-checks and builds the application for production. Output is in `dist` folder.
```bash
npm run build
```

### Preview Production Build
Preview the built application locally.
```bash
npm run preview
```

### Linting
Run ESLint to check for code quality issues.
```bash
npm run lint
```

## Project Structure
- `src/main.tsx`: Application entry point.
- `src/features`: Feature-based architecture (e.g., `ot`, `auth`).
  - `components`: Reusable UI components specific to the feature.
  - `pages`: Page components.
  - `api`: API service calls.
  - `types`: TypeScript interfaces/types.
- `src/api`: Global API configuration (axios instance).
- `public`: Static assets.
