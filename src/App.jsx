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
import AdminLegal from './pages/AdminLegal'
import NotFound from './pages/NotFound'
import './App.css'
import CollectionPage from './pages/CollectionPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import RefundsPage from './pages/RefundsPage'

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
        <title>Art by Tvesa — Original Paintings &amp; Fine Art</title>
        <meta name="description" content="Explore original paintings and fine art by Tvesa Medh — acrylic, oil, and mixed media works." />
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

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/"          element={<PublicSite />} />
            <Route path="/gallery"   element={<CollectionPage />} />
            {/* Legacy paths → new /gallery */}
            <Route path="/archives"   element={<Navigate to="/gallery" replace />} />
            <Route path="/collection" element={<Navigate to="/gallery" replace />} />

            {/* Legal pages — admin-editable content */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms"   element={<TermsPage />} />
            <Route path="/refunds" element={<RefundsPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
              <Route index           element={<AdminArtworks />} />
              <Route path="artworks" element={<AdminArtworks />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="content"  element={<AdminContent />} />
              <Route path="legal"    element={<AdminLegal />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  )
}
