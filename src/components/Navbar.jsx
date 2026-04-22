import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isShop = location.pathname === '/shop'

  /* Close mobile drawer when home gallery enters "carousel mode" */
  useEffect(() => {
    const syncMenu = () => {
      if (document.body.classList.contains('gallery-active')) setMenuOpen(false)
    }
    const obs = new MutationObserver(syncMenu)
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    syncMenu()
    return () => obs.disconnect()
  }, [])

  const handleHashLink = (hash) => {
    setMenuOpen(false)
    const element = document.querySelector(hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
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

  const handleShopClick = (e) => {
    setMenuOpen(false)
    if (isShop) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-wrap">
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="Art by Tvesa" className="navbar-logo-img" />
          </Link>
        </div>
      </div>

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
          <Link to="/collection" onClick={() => setMenuOpen(false)}>Gallery</Link>
        </li>
        <li>
          <a href="#about" onClick={(e) => { e.preventDefault(); handleHashLink('#about') }}>About</a>
        </li>
        <li>
          <a href="#contact" onClick={handleContact}>Contact</a>
        </li>
        <li>
          <Link
            to="/shop"
            className="navbar-collection-btn"
            onClick={handleShopClick}
          >
            <span className="navbar-collection-shimmer" aria-hidden="true" />
            <span className="navbar-collection-label">View Shop</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
