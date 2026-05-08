# Art by Tvesa

**Live site: [artbytvesa.com](https://artbytvesa.com)**

Personal portfolio and e-commerce site for artist Tvesa Medh — a curated space to explore original paintings, prints, and get in touch.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8 |
| Styling | Plain CSS with custom properties + dark mode |
| Database | Firebase Firestore |
| File storage | Firebase Storage |
| Email | Firebase Cloud Functions + Gmail (nodemailer) |
| Shop | Shopify Storefront API (headless) |
| Auth | Firebase Authentication |
| Hosting | Vercel |

## Project structure

```
├── functions/          Firebase Cloud Functions (email notifications)
├── public/             Static assets (fonts, images, sitemap, robots.txt)
├── scripts/            One-time admin setup scripts (credentials gitignored)
├── src/
│   ├── __tests__/      Unit & integration tests (Vitest)
│   ├── components/     Shared UI components
│   ├── config/         Firebase SDK initialisation
│   ├── contexts/       React contexts (Auth, Cart, Currency)
│   ├── hooks/          Custom hooks
│   ├── lib/            Third-party API clients (shopify.js)
│   ├── pages/          Route-level page components
│   └── test/           Vitest global setup
├── firestore.rules     Firestore security rules
├── storage.rules       Cloud Storage security rules
└── vite.config.js      Vite + Vitest configuration
```

## Local development

### Prerequisites

- Node.js ≥ 18
- A Firebase project with Firestore, Storage, and Authentication enabled
- A Shopify store with Storefront API access

### 1 — Clone and install

```bash
git clone https://github.com/ShayanDsouza/Art_by_tvesa.git
cd Art_by_tvesa
npm install
```

### 2 — Environment variables

Create a `.env.local` file in the project root (never commit this):

```env
# Firebase — from Firebase Console → Project Settings → Your Apps
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Shopify — Shopify Admin → Apps → Storefront API
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your-public-storefront-token
```

> `VITE_SHOPIFY_STOREFRONT_TOKEN` is a **public** Storefront Access Token with read-only permissions — it is intentionally browser-exposed.

### 3 — Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (CI mode) |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:ui` | Vitest browser UI |

## Testing

Tests live in `src/__tests__/` and use [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com).

```bash
npm test
```

| Test file | Coverage |
|---|---|
| `shopify.test.js` | `formatPrice` formatting; `subscribeToNewsletter` success, already-subscribed, and error paths; email normalisation |
| `adminStatus.test.js` | `getStatusLabel`, `getNextStatus`, `getNextStatusActionLabel` cycling and edge cases |
| `emailEscape.test.js` | `esc()` HTML sanitiser used in Cloud Function email notifications |
| `cartContext.test.jsx` | Cart state machine — add (create vs add), remove, update, open/close drawer, error guards |

## Firebase setup

### Deploy security rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

### Granting admin access

Admin access uses Firebase Custom Claims — no emails are hardcoded in source.

```bash
# 1. Firebase Console → Project Settings → Service Accounts → Generate new private key
#    Save as  scripts/service-account.json  (gitignored — never commit this)

# 2. Install Admin SDK (one-time, dev only)
npm install firebase-admin --save-dev

# 3. Grant the claim
node scripts/set-admin-claims.js admin@example.com
```

The user must sign out and back in for the claim to activate.

### Email notifications (Cloud Functions)

Contact form submissions trigger a Gmail notification.

```bash
cd functions && npm install

# Store credentials as Firebase Secrets (not env vars, never in source)
firebase functions:secrets:set GMAIL_USER
firebase functions:secrets:set GMAIL_APP_PASSWORD

firebase deploy --only functions
```

> Use a **Gmail App Password** (not your account password). Enable 2FA, then generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

## Deployment (Vercel)

1. Connect the repo in the Vercel dashboard and set the `Shayan` branch as production
2. Add all `VITE_*` env vars in Vercel → Settings → Environment Variables
3. Push to `Shayan` — Vercel builds and deploys automatically

---

## Security notes

- **Admin auth** — Firestore and Storage writes require a Firebase Custom Claim (`admin: true`) plus verified email. No emails hardcoded in rules.
- **Bio sanitisation** — The artist bio allows a limited allow-list of HTML tags (`<a>`, `<b>`, `<em>`, etc.) and is sanitised with [DOMPurify](https://github.com/cure53/DOMPurify) before rendering, preventing XSS even if an admin account is compromised.
- **Email safety** — Cloud Function email bodies HTML-escape all user-supplied fields before embedding them in the notification.
- **Shopify token scope** — The Storefront token has read-only cart/product permissions; no Admin API token is exposed to the browser.
- **Sensitive files** — `scripts/service-account.json` and `.env*.local` are gitignored.

---

Designed by **Tvesa Medh** & **Yana Shah** · Developed by **Shayan Dsouza** & **Arav Pradosh**
