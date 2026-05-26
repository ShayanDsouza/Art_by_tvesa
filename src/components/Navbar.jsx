import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom"
import DarkModeToggle from './DarkModeToggle'

const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export default function Navbar() {
  const [menuOpen, setMenuOpen]             = useState(false)
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const dropRef   = useRef(null)

  const isCollection = location.pathname === '/archives'
  const isShop       = location.pathname.startsWith('/shop')

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

  /* Close shop dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShopDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeAll = () => {
    setMenuOpen(false)
    setShopDropdownOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Lamp toggle — left of logo on Archives page */}
        {isCollection && <DarkModeToggle />}
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

        {/* ── Shop button with dropdown ── */}
        <li
          className="navbar-shop-item"
          ref={dropRef}
          onMouseEnter={() => setShopDropdownOpen(true)}
          onMouseLeave={() => setShopDropdownOpen(false)}
        >
          {ON_SHOP_DOMAIN ? (
            <Link
              to="/"
              className="navbar-collection-btn"
              onClick={(e) => {
                if (isShop && location.pathname === '/') {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                closeAll()
              }}
            >
              <span className="navbar-collection-shimmer" aria-hidden="true" />
              <span className="navbar-collection-label">View Shop</span>
            </Link>
          ) : (import.meta.env.DEV || IS_LOCAL) ? (
            <Link
              to="/shop"
              className="navbar-collection-btn"
              onClick={closeAll}
            >
              <span className="navbar-collection-shimmer" aria-hidden="true" />
              <span className="navbar-collection-label">View Shop</span>
            </Link>
          ) : (
            <a
              href="https://shop.artbytvesa.com"
              className="navbar-collection-btn"
              onClick={closeAll}
            >
              <span className="navbar-collection-shimmer" aria-hidden="true" />
              <span className="navbar-collection-label">View Shop</span>
            </a>
          )}

          {shopDropdownOpen && (
            <div className="navbar-shop-dropdown">
              {ON_SHOP_DOMAIN ? (
                <>
                  <Link to="/" onClick={closeAll}>Shop All</Link>
                  <Link to="/browse?tab=originals" onClick={closeAll}>Original Artworks</Link>
                  <Link to="/browse?tab=prints" onClick={closeAll}>Prints</Link>
                  <Link to="/browse?tab=commissions" onClick={closeAll}>Commissions</Link>
                </>
              ) : (import.meta.env.DEV || IS_LOCAL) ? (
                <>
                  <Link to="/shop" onClick={closeAll}>Shop All</Link>
                  <Link to="/shop/browse?tab=originals" onClick={closeAll}>Original Artworks</Link>
                  <Link to="/shop/browse?tab=prints" onClick={closeAll}>Prints</Link>
                  <Link to="/shop/browse?tab=commissions" onClick={closeAll}>Commissions</Link>
                </>
              ) : (
                <>
                  <a href="https://shop.artbytvesa.com" onClick={closeAll}>Shop All</a>
                  <a href="https://shop.artbytvesa.com/browse?tab=originals" onClick={closeAll}>Original Artworks</a>
                  <a href="https://shop.artbytvesa.com/browse?tab=prints" onClick={closeAll}>Prints</a>
                  <a href="https://shop.artbytvesa.com/browse?tab=commissions" onClick={closeAll}>Commissions</a>
                </>
              )}
            </div>
          )}
        </li>

      </ul>
    </nav>
  )
}
