import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Gallery from './components/Gallery'
import GridGallery from "./components/GridGallery";
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminArtworks from './pages/AdminArtworks'
import AdminMessages from './pages/AdminMessages'
import './App.css'

function PublicSite() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Gallery Section */}
        <div id="gallery">
          <Gallery />        {/* Shayan’s rotating gallery */}
          <GridGallery />    {/* Your grid gallery */}
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
            <Route index element={<AdminArtworks />} />
            <Route path="artworks" element={<AdminArtworks />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
