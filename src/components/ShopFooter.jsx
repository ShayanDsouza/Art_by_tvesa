import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToNewsletter } from '../lib/shopify'
import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

const STUDIO_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Shop',     to: '/shop' },
  { label: 'Archives', to: '/collection' },
  { label: 'About',    to: '/#about' },
  { label: 'Contact',  to: '/#contact' },
]

const SUPPORT_LINKS = [
  { label: 'Refunds & Returns', href: `https://${STORE_DOMAIN}/policies/refund-policy` },
  { label: 'Privacy Policy',    href: `https://${STORE_DOMAIN}/policies/privacy-policy` },
  { label: 'Terms of Service',  href: `https://${STORE_DOMAIN}/policies/terms-of-service` },
  { label: 'FAQs',              href: `https://${STORE_DOMAIN}/pages/faqs` },
]

/* Simple inline SVG payment badge icons */
const PaymentIcons = () => (
  <div className="sf-payments">
    {/* Visa */}
    <span className="sf-pay-badge" title="Visa">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="Visa">
        <rect width="50" height="32" rx="4" fill="#1a1f71"/>
        <text x="25" y="22" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif" letterSpacing="1">VISA</text>
      </svg>
    </span>
    {/* Mastercard */}
    <span className="sf-pay-badge" title="Mastercard">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="Mastercard">
        <rect width="50" height="32" rx="4" fill="#252525"/>
        <circle cx="19" cy="16" r="10" fill="#eb001b" opacity="0.9"/>
        <circle cx="31" cy="16" r="10" fill="#f79e1b" opacity="0.9"/>
        <circle cx="25" cy="16" r="5" fill="#ff5f00" opacity="0.9"/>
      </svg>
    </span>
    {/* PayPal */}
    <span className="sf-pay-badge" title="PayPal">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="PayPal">
        <rect width="50" height="32" rx="4" fill="#003087"/>
        <text x="25" y="14" textAnchor="middle" fill="#009cde" fontSize="9" fontWeight="bold" fontFamily="Arial,sans-serif">Pay</text>
        <text x="25" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="Arial,sans-serif">Pal</text>
      </svg>
    </span>
    {/* American Express */}
    <span className="sf-pay-badge" title="American Express">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="American Express">
        <rect width="50" height="32" rx="4" fill="#2557d6"/>
        <text x="25" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="Arial,sans-serif" letterSpacing="0.3">AMERICAN</text>
        <text x="25" y="24" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="Arial,sans-serif" letterSpacing="0.3">EXPRESS</text>
      </svg>
    </span>
    {/* RuPay */}
    <span className="sf-pay-badge" title="RuPay">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="RuPay">
        <rect width="50" height="32" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1"/>
        <text x="25" y="14" textAnchor="middle" fill="#1a5276" fontSize="8" fontWeight="bold" fontFamily="Arial,sans-serif">Ru</text>
        <text x="25" y="24" textAnchor="middle" fill="#e74c3c" fontSize="8" fontWeight="bold" fontFamily="Arial,sans-serif">Pay</text>
      </svg>
    </span>
    {/* UPI */}
    <span className="sf-pay-badge" title="UPI">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="UPI">
        <rect width="50" height="32" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1"/>
        <text x="25" y="20" textAnchor="middle" fill="#6b3fa0" fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif" letterSpacing="1">UPI</text>
      </svg>
    </span>
    {/* Netbanking */}
    <span className="sf-pay-badge" title="Net Banking">
      <svg viewBox="0 0 50 32" width="50" height="32" aria-label="Net Banking">
        <rect width="50" height="32" rx="4" fill="#f8f8f8" stroke="#ddd" strokeWidth="1"/>
        <text x="25" y="14" textAnchor="middle" fill="#333" fontSize="7" fontWeight="bold" fontFamily="Arial,sans-serif">Net</text>
        <text x="25" y="24" textAnchor="middle" fill="#333" fontSize="7" fontWeight="bold" fontFamily="Arial,sans-serif">Banking</text>
      </svg>
    </span>
  </div>
)

export default function ShopFooter() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const result = await subscribeToNewsletter(email.trim())
      setStatus(result === 'already_subscribed' ? 'already' : 'success')
      setEmail('')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <footer className="shop-footer">
      <div className="sf-main">

        {/* ── Col 1: Brand ── */}
        <div className="sf-brand">
          <img src="/footer logo.png" alt="Art by Tvesa" className="sf-logo" />
          <p className="sf-tagline">
            Original paintings and fine-art prints by Tvesa Medh — each piece made with intention and love.
          </p>
        </div>

        {/* ── Col 2: Studio ── */}
        <div className="sf-col">
          <h3 className="sf-col-title">Studio</h3>
          <ul className="sf-links">
            {STUDIO_LINKS.map(link => (
              <li key={link.label}>
                <Link to={link.to} className="sf-link">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3: Support ── */}
        <div className="sf-col">
          <h3 className="sf-col-title">Support</h3>
          <ul className="sf-links">
            {SUPPORT_LINKS.map(link => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="sf-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 4: Newsletter ── */}
        <div className="sf-col sf-newsletter-col">
          <h3 className="sf-col-title">Newsletter</h3>
          <p className="sf-newsletter-sub">Subscribe for updates</p>

          {status === 'success' ? (
            <p className="sf-newsletter-done">Almost there! Check your inbox to confirm.</p>
          ) : status === 'already' ? (
            <p className="sf-newsletter-done">You're already on the list!</p>
          ) : (
            <form className="sf-newsletter-form" onSubmit={handleSubmit}>
              <div className="sf-newsletter-row">
                <input
                  type="email"
                  className="sf-newsletter-input"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  className="sf-newsletter-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? '…' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p className="sf-newsletter-error">Something went wrong. Please try again.</p>
              )}
            </form>
          )}

          <div className="sf-socials">
            <a href="https://www.instagram.com/artbytvesa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://in.pinterest.com/artbytvesa/my-art/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><FaPinterest /></a>
            <a href="mailto:artbytvesa@gmail.com" aria-label="Email"><HiOutlineMail /></a>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="sf-bottom">
        <p className="sf-copy">© 2026 Art by Tvesa. All rights reserved.</p>
        <PaymentIcons />
      </div>
    </footer>
  )
}
