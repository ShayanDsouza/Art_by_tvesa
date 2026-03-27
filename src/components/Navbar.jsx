import { useState } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";

// Scroll to the fully-zoomed-in state (middle of the hold phase, progress ~0.64)
function scrollToGalleryZoomed(e) {
  e.preventDefault()
  const gallery = document.querySelector('#gallery')
  const wrapper = document.querySelector('.gallery-scroll-wrapper')
  if (!gallery || !wrapper) return
  const scrollableHeight = wrapper.offsetHeight - window.innerHeight
  const targetScrollY = gallery.offsetTop + 0.64 * scrollableHeight
  window.scrollTo({ top: targetScrollY, behavior: 'smooth' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleHashLink = (hash) => {
    setMenuOpen(false)
    
    // If on homepage, scroll to hash directly
    if (location.pathname === '/') {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to homepage with hash via React Router (no full reload)
      navigate(`/${hash}`)
    }
  }

  const handleGallery = (e) => {
    scrollToGalleryZoomed(e)
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      {/*My version*/}
      <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
        <img src="/logo.png" alt="Art by Tvesa" className="navbar-logo-img" />
      </Link>
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li><a href="#gallery" onClick={(e) => { e.preventDefault(); handleHashLink('#gallery') }}>Gallery</a></li>
        <li><a href="#about" onClick={(e) => { e.preventDefault(); handleHashLink('#about') }}>About</a></li>
        <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleHashLink('#contact') }}>Contact</a></li>
        <li>
          <Link to="/collection" className="navbar-collection-btn" onClick={() => setMenuOpen(false)}>
            <span className="navbar-collection-shimmer" aria-hidden="true" />
            Full Collection
          </Link>
        </li>
      </ul>
    </nav>
  )
}