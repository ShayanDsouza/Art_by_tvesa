import { useState } from 'react'
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const handleHashLink = (hash) => {
    setMenuOpen(false)
    
    // If on homepage, scroll to hash
    if (location.pathname === '/') {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to homepage with hash
      window.location.href = `/${hash}`
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
        <img src="/logo.jpg" alt="Art by Tvesa" className="navbar-logo-img" />
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
