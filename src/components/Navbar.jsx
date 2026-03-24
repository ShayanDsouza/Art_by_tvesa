import { useState, useEffect } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const sections = document.querySelectorAll('section, div[id]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        threshold: 0.6, // adjust sensitivity
      }
    )

    sections.forEach((section) => {
      if (section.id) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const getClass = (id) =>
    activeSection === id ? 'active-link' : ''

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
        <li>
          <a
            href="#gallery"
            className={getClass('gallery')}
            onClick={() => setMenuOpen(false)}
          >
            Gallery
          </a>
        </li>

        <li>
          <a
            href="#about"
            className={getClass('about')}
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>
        </li>


        <li>
          <a
            href="#contact"
            className={getClass('contact')}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  )
}