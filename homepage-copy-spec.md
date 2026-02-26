# Feature Spec: Homepage Copy & Mobile Responsiveness

## Objective
Update the landing page (`app/page.tsx`) to clearly explain the "Illuminated Payments" MVP while ensuring the entire page, including the new copy and buttons, is perfectly optimized for mobile devices.

## Phase 1: Copy & Value Proposition
1. **Main Headline**: Change the main title from "Disruptive FinTech" to "Illuminated Payments". Include the glowing `<Lightbulb />` icon to match the theme.
2. **Sub-headline/Value Prop**: Add a clean, readable paragraph explaining the MVP capabilities. For example: 
   *"Shed light on your expenses. Upload receipts, let AI instantly extract the data, and securely organize your finances with custom, private categories."*

## Phase 2: Mobile Optimization (Tailwind)
1. **Typography Scaling**: Ensure the main headline uses responsive text sizes so it doesn't overflow on small phone screens (e.g., `text-4xl md:text-6xl lg:text-7xl font-bold`).
2. **Layout & Padding**: Ensure the main container has safe mobile padding (`px-4 sm:px-6 lg:px-8`) so text and buttons don't touch the physical edges of the phone screen.
3. **Button Stacking**: Ensure the call-to-action buttons (e.g., "Login to Dashboard") are full-width on mobile for easy tapping (`w-full md:w-auto`).

## Phase 3: Self-QA & Review
- Did you remove all generic placeholder text?
- Are Tailwind responsive prefixes (`md:`, `lg:`, `sm:`) used correctly to ensure a flawless mobile view?
- Conclude your output with "HOMEPAGE & MOBILE POLISH COMPLETE."