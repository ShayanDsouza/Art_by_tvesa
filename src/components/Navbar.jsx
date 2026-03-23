// src/components/Navbar.jsx

import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", target: "home" },
  { label: "About", target: "about" },
  { label: "Gallery", target: "gallery" },
  { label: "Contact", target: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const menuRef = useRef(null);

  // ── Scroll detection (for glass effect) ─────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Scroll Spy ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120; // offset for navbar height

      NAV_LINKS.forEach(({ target }) => {
        const section = document.getElementById(target);
        if (!section) return;

        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollY >= top && scrollY < top + height) {
          setActiveSection(target);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run once on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close menu on outside click ─────────────────────
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // ── Lock scroll when mobile menu open ───────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  // ── Smooth scroll ──────────────────────────────────
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      {/* Brand */}
      <div
        className="navbar__brand"
        onClick={() => handleScrollTo("home")}
        style={{ cursor: "pointer" }}
      >
        Art by Tvesa
      </div>

      {/* Links */}
      <ul
        ref={menuRef}
        className={`navbar__links${menuOpen ? " navbar__links--open" : ""}`}
      >
        {NAV_LINKS.map(({ label, target }) => (
          <li key={target}>
            <button
              className={`navbar__link ${
                activeSection === target ? "navbar__link--active" : ""
              }`}
              onClick={() => handleScrollTo(target)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Hamburger */}
      <button
        className={`navbar__hamburger${
          menuOpen ? " navbar__hamburger--open" : ""
        }`}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="navbar__hamburger-bar" />
        <span className="navbar__hamburger-bar" />
        <span className="navbar__hamburger-bar" />
      </button>
    </nav>
  );
}