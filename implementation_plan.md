# PrismAlgo Studio Implementation Plan

## Overview
PrismAlgo Studio is a premium, cinematic algorithm visualizer with an educational focus. The app will be built exactly to the user-provided Stitch designs, using a modern frontend stack.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Primitives: shadcn/ui
- Animation: Framer Motion
- Icons: Lucide React
- State Management: React useState / useReducer (or Zustand for complex cross-component state if needed)

## Proposed Architecture

### Global Setup
- Scaffold a Next.js App Router project: `npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Initialize shadcn/ui: `npx shadcn@latest init`
- Install dependencies: `npm install framer-motion lucide-react zustand clsx tailwind-merge`
- Define CSS Variables in `global.css` for the premium dark theme (deep slate background, cyan/blue defaults, violet/pink for active states, emerald/teal for sorted states).

### Layout & Components
#### [NEW] `src/app/layout.tsx`
- Setup top-level layout with deep slate background.
- Setup global fonts (Inter).

#### [NEW] `src/components/layout/Navbar.tsx` & `src/components/layout/Footer.tsx`
- PrismAlgo Studio branding and premium navigation.
- Responsive hamburger menu for mobile.

#### [NEW] `src/app/page.tsx`
- Landing / Hero section with premium headline, CTA buttons, feature badges, and summary cards.
- Roadmap / categories section (Sorting Studio, Pathfinding Arena, Tree & Graph Lab, DP & Recursion Lens).
- Learn section with premium feature cards, AI explain mode, and learning tracks.

#### [NEW] `src/app/visualizer/page.tsx`
- The Main Visualizer Workspace.
- Left control panel (Algorithm selector, custom input, array size, speed).
- Center canvas (Live visualization with Framer Motion bars).
- Right panel (Information, step feed, code preview).
- Responsive stacking behavior for tablet/mobile.

#### [NEW] `src/app/compare/page.tsx`
- Side-by-side algorithm comparison mode.
- Metric summary cards with responsive stacking.

### Core Modules
#### [NEW] `src/lib/algorithms.ts`
- Implement sorting algorithms as generators or arrays of state snapshots to step forward/backward.
- Algorithms: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort.

#### [NEW] `src/store/visualizerStore.ts`
- Zustand store to manage visualizer state (array, speed, size, playing/paused, current step).

## Verification Plan
1. **Build & Typecheck:** Run `npm run build` and `npm run typecheck` to ensure 0 errors.
2. **Visual QA Loop:** 
   - Start the local dev server using `npm run dev`.
   - Use the browser tool to capture screenshots at Mobile, Tablet, and Desktop viewport sizes.
   - Compare the results against the original Stitch screens.
   - Check typography hierarchy, card border radii, shadow softness, and color accuracy (glassmorphism effects).
   - Fix any discrepancies and repeat.
3. **Functional Verification:**
   - Verify array randomization and custom inputs.
   - Verify play, pause, and speed adjustments.
   - Verify accuracy of sorting algorithm steps.
   - Verify responsiveness on different screen widths without horizontal scrolling or overflow.
