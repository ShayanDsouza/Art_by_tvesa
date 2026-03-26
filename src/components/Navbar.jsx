import { useState } from 'react'

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

  const handleGallery = (e) => {
    scrollToGalleryZoomed(e)
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <a href="#hero" className="navbar-logo">
        <img src="/logo.png" alt="Art by Tvesa" className="navbar-logo-img" />
      </a>
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
        <li><a href="#gallery" onClick={handleGallery}>Gallery</a></li>
        <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
        <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
        <li>
          <a href="#gallery" className="navbar-collection-btn" onClick={handleGallery}>
            <span className="navbar-collection-shimmer" aria-hidden="true" />
            Full Collection
          </a>
        </li>
      </ul>
    </nav>
  )
}
