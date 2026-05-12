import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminArtworks from './pages/AdminArtworks'
import AdminMessages from './pages/AdminMessages'
import AdminContent from './pages/AdminContent'
import NotFound from './pages/NotFound'
import './App.css'
import CollectionPage from "./pages/CollectionPage";
import ShopPage from "./pages/ShopPage";
import ShopBrowsePage from "./pages/ShopBrowsePage"
import ProductPage from "./pages/ProductPage";
import { CartProvider } from "./contexts/CartContext";
import { CustomerProvider } from "./contexts/CustomerContext";

function PublicSite() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])
  return (
    <>
      <Helmet>
        <title>Art by Tvesa — Original Paintings &amp; Fine Art Prints</title>
        <meta name="description" content="Explore original paintings and fine-art prints by Tvesa Medh — acrylic, oil, and mixed media works. Shop unique one-of-a-kind pieces or high-quality reproductions." />
        <meta property="og:url" content="https://artbytvesa.com" />
        <link rel="canonical" href="https://artbytvesa.com" />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <div id ="gallery">
          <Gallery />
        </div>
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function ExternalRedirect() {
  useEffect(() => {
    // Replace the local domain with shop.artbytvesa.com and strip /shop prefix
    const newPath = window.location.pathname.replace(/^\/shop/, '') || '/'
    window.location.replace(`https://shop.artbytvesa.com${newPath}${window.location.search}`)
  }, [])
  return null
}

// Detect shop subdomain once at module load — no re-render needed
const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CustomerProvider>
        <CartProvider>
          <Router>
            <Routes>
              {ON_SHOP_DOMAIN ? (
                /* ── shop.artbytvesa.com: clean paths, no /shop prefix ── */
                <>
                  <Route path="/"                element={<ShopPage />} />
                  <Route path="/browse"           element={<ShopBrowsePage />} />
                  <Route path="/product/:handle"  element={<ProductPage />} />
                  <Route path="*"                 element={<Navigate to="/" replace />} />
                </>
              ) : (
                /* ── artbytvesa.com: full site ── */
                <>
                  <Route path="/"          element={<PublicSite />} />
                  <Route path="/archives"  element={<CollectionPage />} />
                  <Route path="/collection" element={<Navigate to="/archives" replace />} />
                  {/* In dev, allow testing shop locally. In prod, redirect to subdomain */}
                  {import.meta.env.DEV ? (
                    <Route path="/shop">
                      <Route index element={<ShopPage />} />
                      <Route path="browse" element={<ShopBrowsePage />} />
                      <Route path="product/:handle" element={<ProductPage />} />
                    </Route>
                  ) : (
                    <Route path="/shop/*" element={<ExternalRedirect />} />
                  )}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
                    <Route index           element={<AdminArtworks />} />
                    <Route path="artworks" element={<AdminArtworks />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="content"  element={<AdminContent />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </Router>
        </CartProvider>
        </CustomerProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
