# Art by Tvesa

**Live site: [artbytvesa.com](https://artbytvesa.com)**

---

## About the Website

Art by Tvesa is an online portfolio and gallery for Tvesa Medh, a visual artist. The website serves as a digital home for her artwork — a curated space where visitors can explore her pieces, get a feel for her creative style, and get in touch.

### What the site offers

- **Gallery** — A scrollable collection of Tvesa's artwork, each piece displayed with care and detail.
- **Featured carousel** — Highlighted works selected by Tvesa herself, shown prominently on the homepage.
- **Full collection** — Browse the complete body of work in one place.
- **Contact** — Reach Tvesa directly via email or through her Instagram and Pinterest profiles.

### For collaborators, collectors, or anyone curious

The site is designed to feel like stepping into an artist's studio — personal, considered, and reflective of the work itself. Whether you're here to commission a piece, explore the art, or simply appreciate it, you're welcome.

For enquiries: [artbytvesa@gmail.com](mailto:artbytvesa@gmail.com)

---

## For Developers

This project is built with **React + Vite** and uses **Firebase Firestore** as the backend for managing artwork and site content. It is deployed on **Vercel** at [artbytvesa.com](https://artbytvesa.com).

### Tech stack

- React 18
- Vite
- Firebase (Firestore)
- CSS (no UI framework)

### Prerequisites

- Node.js 18+
- npm

### Running locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/ShayanDsouza/Art_by_tvesa.git
   cd Art_by_tvesa
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root. You'll need a Firebase project with Firestore enabled. Add the following:

   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_ADMIN_EMAIL=
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:5173` (or whichever port Vite assigns).

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

### Project structure

```
src/
  components/     # React components (Hero, Gallery, Footer, Navbar, etc.)
  App.jsx         # Root component
  App.css         # Global styles
public/           # Static assets (images, fonts)
```

---

Designed by **Tvesa Medh** & **Yana Shah** · Developed by **Shayan Dsouza** & **Arav Pradosh**
