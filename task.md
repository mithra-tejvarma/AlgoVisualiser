# PrismAlgo Studio — Phase 2

## Auth & Firebase
- [ ] Install Firebase SDK and configure project
- [ ] Create Firebase config (`src/lib/firebase.ts`)
- [ ] Create AuthContext provider (`src/context/AuthContext.tsx`)
- [ ] Create Login page (`src/app/login/page.tsx`)
- [ ] Create Sign-up page (`src/app/signup/page.tsx`)
- [ ] Add auth state to Navbar (avatar, sign out)
- [ ] Add route protection for tracking dashboard

## Algorithm Tracking
- [ ] Create Firestore tracking service (`src/lib/tracking.ts`)
- [ ] Track algorithm visits from visualizer & compare pages
- [ ] Create tracking dashboard page (`src/app/dashboard/page.tsx`)
- [ ] Show visit history, most used algorithms, recent activity

## Light/Dark Theme Toggle
- [ ] Create ThemeProvider with localStorage persistence
- [ ] Design light theme color tokens in globals.css
- [ ] Add theme toggle button to Navbar
- [ ] Verify all components look good in both themes

## Verification
- [ ] Build passes with 0 errors
- [ ] Auth flow works (sign up, login, logout)
- [ ] Tracking persists to Firestore
- [ ] Theme toggle works across all pages
- [ ] Update walkthrough
