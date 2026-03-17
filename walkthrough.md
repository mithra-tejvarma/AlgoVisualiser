# PrismAlgo Studio — Phase 2 Walkthrough

## New Features Added

### 1. Firebase Auth (Email/Password + Google)
- **Firebase project**: `prismalgo-studio` created with Auth + Firestore
- **Login page** (`/login`) — glassmorphic card, email/password + Google SSO
- **Signup page** (`/signup`) — name, email, password, confirm, Google SSO
- **Auth state in Navbar** — avatar dropdown (Dashboard, Sign Out) when logged in; Log In / Sign Up buttons when not

### 2. Algorithm Tracking System
- **Firestore service** ([src/lib/tracking.ts](file:///d:/GitHub/AlgoVisualiser/src/lib/tracking.ts)) — records visits, maintains aggregate stats
- **Auto-tracking** on visualizer and compare pages when user is authenticated
- **Dashboard** (`/dashboard`) — protected route with:
  - Total visits, algorithms explored, most used algorithm
  - Algorithm usage breakdown with progress bars
  - Recent activity feed with timestamps

### 3. Light/Dark Theme Toggle
- **ThemeProvider** ([src/context/ThemeContext.tsx](file:///d:/GitHub/AlgoVisualiser/src/context/ThemeContext.tsx)) — persists to localStorage
- **Sun/Moon toggle** in Navbar
- **Light theme CSS** — premium soft whites, subtle borders, shadows
- **Theme-aware classes** — all text uses `text-foreground`/`text-muted-foreground` instead of hardcoded colors

## Screenshots

````carousel
![Login Page (Light)](C:\Users\tejva\.gemini\antigravity\brain\1845027a-5aad-422b-ae88-1baf3d3cad6e\login_page_1773649878342.png)
<!-- slide -->
![Signup Page (Light)](C:\Users\tejva\.gemini\antigravity\brain\1845027a-5aad-422b-ae88-1baf3d3cad6e\signup_page_1773649914173.png)
<!-- slide -->
![Landing Page Light Mode](C:\Users\tejva\.gemini\antigravity\brain\1845027a-5aad-422b-ae88-1baf3d3cad6e\landing_page_light_mode_1773650002113.png)
<!-- slide -->
![Visualizer (Dark)](C:\Users\tejva\.gemini\antigravity\brain\1845027a-5aad-422b-ae88-1baf3d3cad6e\visualizer_page_1773643811174.png)
````

## New Files

| File | Purpose |
|---|---|
| [firebase.ts](file:///d:/GitHub/AlgoVisualiser/src/lib/firebase.ts) | Firebase config & init |
| [AuthContext.tsx](file:///d:/GitHub/AlgoVisualiser/src/context/AuthContext.tsx) | Auth provider (sign up, login, Google, logout) |
| [ThemeContext.tsx](file:///d:/GitHub/AlgoVisualiser/src/context/ThemeContext.tsx) | Theme toggle with localStorage |
| [tracking.ts](file:///d:/GitHub/AlgoVisualiser/src/lib/tracking.ts) | Firestore tracking service |
| [login/page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/login/page.tsx) | Login page |
| [signup/page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/signup/page.tsx) | Signup page |
| [dashboard/page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/dashboard/page.tsx) | User dashboard with tracking data |

## Modified Files
- [layout.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/layout.tsx) — wrapped with ThemeProvider + AuthProvider
- [Navbar.tsx](file:///d:/GitHub/AlgoVisualiser/src/components/layout/Navbar.tsx) — auth state, user dropdown, theme toggle
- [globals.css](file:///d:/GitHub/AlgoVisualiser/src/app/globals.css) — light theme tokens, glass-card/bg-radial-glow overrides
- [page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/page.tsx) — theme-aware text colors
- [visualizer/page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/visualizer/page.tsx) — algorithm tracking
- [compare/page.tsx](file:///d:/GitHub/AlgoVisualiser/src/app/compare/page.tsx) — algorithm tracking

## Verification
- ✅ `npm run build` — 0 errors, all 6 routes render
- ✅ Login/Signup pages render correctly
- ✅ Dashboard redirects to `/login` when unauthenticated
- ✅ Theme toggle switches between dark and light modes
- ✅ Light theme has proper contrast and premium styling
