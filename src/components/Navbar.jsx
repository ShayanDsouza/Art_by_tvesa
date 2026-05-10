import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom"
import DarkModeToggle from './DarkModeToggle'

const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()

  const isCollection = location.pathname === '/archives'

  /* Close mobile drawer when carousel is active */
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

  const closeAll = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-wrap">
          {window.location.hostname === 'shop.artbytvesa.com' ? (
            <a href="https://artbytvesa.com" className="navbar-logo">
              <img src="/logo.png"           alt="Art by Tvesa" className="navbar-logo-img navbar-logo-light" />
              <img src="/dark_mode_logo.png" alt="Art by Tvesa" className="navbar-logo-img navbar-logo-dark" />
            </a>
          ) : (
          <Link to="/" className="navbar-logo" onClick={closeAll}>
            <img src="/logo.png"           alt="Art by Tvesa" className="navbar-logo-img navbar-logo-light" />
            <img src="/dark_mode_logo.png" alt="Art by Tvesa" className="navbar-logo-img navbar-logo-dark" />
          </Link>
          )}
        </div>
        {/* Dark mode toggle only on the Archives page */}
        {isCollection && <DarkModeToggle />}
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
          {ON_SHOP_DOMAIN
            ? <a href="https://artbytvesa.com/archives" onClick={closeAll}>Archives</a>
            : <Link to="/archives" onClick={closeAll}>Archives</Link>
          }
        </li>
        <li>
          {ON_SHOP_DOMAIN
            ? <a href="https://artbytvesa.com/#about" onClick={closeAll}>About</a>
            : <a href="#about" onClick={(e) => { e.preventDefault(); handleHashLink('#about') }}>About</a>
          }
        </li>
        <li>
          {ON_SHOP_DOMAIN
            ? <a href="https://artbytvesa.com/#contact" onClick={closeAll}>Contact</a>
            : <a href="#contact" onClick={handleContact}>Contact</a>
          }
        </li>
      </ul>
    </nav>
  )
}
