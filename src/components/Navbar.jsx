import { useState } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";

// Scroll to the fully-zoomed-in hold phase (progress 0.66 = middle of 0.60–0.72 hold).
// Uses 'instant' so the carousel jumps directly to zoomed-in state rather than
// animating through zoom-out → zoom-in → hold as smooth scroll passes each phase.
function scrollToGalleryZoomed(e) {
  e.preventDefault()
  const gallery = document.querySelector('#gallery')
  const wrapper = document.querySelector('.gallery-scroll-wrapper')
  if (!gallery || !wrapper) return
  const scrollableHeight = wrapper.offsetHeight - window.innerHeight
  const targetScrollY = gallery.offsetTop + 0.66 * scrollableHeight
  window.scrollTo({ top: targetScrollY, behavior: 'instant' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isCollection = location.pathname === '/collection'

  const handleHashLink = (hash) => {
    setMenuOpen(false)
    const element = document.querySelector(hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Not on a page that has this section — go home first
      navigate('/')
      // After navigation, scroll on next tick
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleGallery = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname === '/') {
      scrollToGalleryZoomed(e)
    } else {
      // Navigate home, then scroll to gallery
      window.location.href = '/#gallery'
    }
  }

  const handleContact = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector('#contact')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#contact'
    }
  }

  const handleCollectionClick = (e) => {
    setMenuOpen(false)
    // If already on collection page, just scroll to top
    if (isCollection) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Otherwise let the <Link> navigate normally — CollectionPage will scrollTo(0) on mount
  }

  return (
    <nav className="navbar">
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
        <li>
          <a href="#gallery" onClick={handleGallery}>Gallery</a>
        </li>
        <li>
          <a href="#about" onClick={(e) => { e.preventDefault(); handleHashLink('#about') }}>About</a>
        </li>
        <li>
          <a href="#contact" onClick={handleContact}>Contact</a>
        </li>
        <li>
          <Link
            to="/collection"
            className="navbar-collection-btn"
            onClick={handleCollectionClick}
          >
            <span className="navbar-collection-shimmer" aria-hidden="true" />
            <span className="navbar-collection-label">Full Collection</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}