# Ajith Nellikott Krishnadas — Portfolio

React + TypeScript + Vite portfolio with a React Three Fiber hero, GSAP ScrollTrigger reveals,
Lenis smooth scrolling and Motion for UI transitions. Tailwind CSS v4 for styling.

## Scripts

- `npm install`
- `npm run dev` — local dev server
- `npm run build` — type-check and production build
- `npm run preview` — serve the production build

## Where to edit content

All copy, experience, skills, projects, education and links live in `src/config/profile.ts`.

## Before publishing

- Add `public/resume.pdf` (the Download Resume button checks for it and shows a message if missing).
- Set `linkedin` and `github` in `src/config/profile.ts`. Empty values show "coming soon" states instead of links.
- Set `siteUrl` in `src/config/profile.ts` and the matching `og:url` / `canonical` / `og:image` values in `index.html`.
- Add project `github` / `liveDemo` URLs and screenshots in `src/config/profile.ts`.
- The contact form has no backend. It opens the visitor's email client with the message prefilled.
  To send server-side, replace the `mailto` logic in `src/components/contact/ContactForm.tsx`.
