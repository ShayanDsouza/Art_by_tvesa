import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <a href="#hero" className="navbar-logo">
        <img src="/logo.jpg" alt="Art by Tvesa" className="navbar-logo-img" />
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
        <li><a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a></li>
        <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
        <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
        <li>
          <a href="#gallery" className="navbar-collection-btn" onClick={() => setMenuOpen(false)}>
            <span className="navbar-collection-shimmer" aria-hidden="true" />
            Full Collection
          </a>
        </li>
      </ul>
    </nav>
  )
}
