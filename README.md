# Art by Tvesa

**Live site: [artbytvesa.com](https://artbytvesa.com)**

A portfolio and gallery experience for visual artist Tvesa Medh — an animated,
interactive space to explore original paintings and mixed-media work, backed by
a custom content-management system so the artist can manage everything herself,
with no code changes and no third-party CMS.

---

## Preview

<!-- Replace the placeholders below with real screenshots (e.g. docs/screenshots/*.png) -->

| Home / Hero | Gallery | Artwork detail |
|:---:|:---:|:---:|
| ![Home page](docs/screenshots/home.png) | ![Gallery grid](docs/screenshots/gallery.png) | ![Artwork detail popup](docs/screenshots/artwork-modal.png) |

| Admin — Artworks | Admin — Content | Admin — Legal |
|:---:|:---:|:---:|
| ![Admin artworks](docs/screenshots/admin-artworks.png) | ![Admin content](docs/screenshots/admin-content.png) | ![Admin legal](docs/screenshots/admin-legal.png) |

> _Screenshots coming soon — drop images into `docs/screenshots/` and they'll render here._

---

## Highlights

- **Animated hero** — a Three.js scene with floating framed artworks and drifting
  particles, paired with a staggered, scroll-reactive title reveal.
- **Custom gallery carousel** — a hand-built, physics-driven carousel (drag,
  momentum, and snap-to-centre) that renders each frame straight to the DOM for
  smooth 60fps interaction instead of re-rendering through React on every frame.
- **Full gallery** — searchable, category-filterable grid with masonry and grid
  layouts, plus a portal-rendered detail popup (artwork on the left, details on
  the right).
- **Real-time content** — the gallery subscribes to the database, so anything the
  artist changes in the admin panel appears live with no page refresh.
- **Custom admin CMS** — Google sign-in, drag-and-drop artwork reordering,
  client-side image compression before upload, rich-text bio editing, and
  self-service editing of the Privacy / Terms / Refunds pages.
- **Polished UX** — dark mode, fully responsive layouts, smooth transitions, and
  SEO-ready metadata (Open Graph, Twitter cards, structured data).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8 |
| Styling | Plain CSS with custom properties + dark mode |
| 3D / animation | Three.js |
| Database | Firebase Firestore (real-time) |
| File storage | Firebase Storage |
| Authentication | Firebase Authentication (Google OAuth) |
| Backend | Firebase Cloud Functions (email notifications) |
| Testing | Vitest + Testing Library |
| Hosting | Vercel |

---

## Architecture at a glance

```
src/
├── components/     Shared UI — hero, gallery carousel, artwork modal, nav, footer
├── pages/          Route-level pages — home, gallery, admin panel, legal pages
├── contexts/       React context providers (auth)
├── hooks/          Custom data-fetching hooks
├── config/         Firebase SDK initialisation
└── __tests__/      Unit & integration tests (Vitest)
functions/          Firebase Cloud Functions (contact-form email)
```

A few decisions worth calling out:

- **Headless, self-hosted CMS** — rather than bolting on a third-party CMS, the
  site reads and writes structured content (artworks, bio, page copy) directly
  from Firestore, keeping the whole stack in one place.
- **Direct-DOM carousel** — the carousel precomputes layout positions once and
  mutates element transforms imperatively during interaction, sidestepping
  React's render cycle on the hot path.
- **Portal-based modals** — the artwork detail popup renders through a React
  portal so it layers cleanly above fixed UI regardless of where it's triggered.

---

## Running locally

```bash
git clone https://github.com/ShayanDsouza/Art_by_tvesa.git
cd Art_by_tvesa
npm install
npm run dev        # → http://localhost:5173
```

> Requires Node.js ≥ 18 and a set of Firebase environment variables
> (`VITE_FIREBASE_*`) in a local `.env.local` file.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |

---

Designed by **Tvesa Medh** & **Yana Shah** · Developed by **Shayan Dsouza** & **Arav Pradosh**
