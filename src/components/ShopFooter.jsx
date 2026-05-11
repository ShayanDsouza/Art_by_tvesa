import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToNewsletter } from '../lib/shopify'
import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

const STUDIO_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Archives', to: '/archives' },
  { label: 'About',    to: '/#about' },
  { label: 'Contact',  to: '/#contact' },
]

const SUPPORT_LINKS = [
  { label: 'Refunds & Returns', href: `https://${STORE_DOMAIN}/policies/refund-policy` },
  { label: 'Privacy Policy',    href: `https://${STORE_DOMAIN}/policies/privacy-policy` },
  { label: 'Terms of Service',  href: `https://${STORE_DOMAIN}/policies/terms-of-service` },
  { label: 'FAQs',              href: `https://${STORE_DOMAIN}/pages/faqs` },
]

/* ── Accurate coloured SVG payment badges ── */
const PaymentIcons = () => (
  <div className="sf-payments">
    <span className="sf-pay-badge" title="Visa" aria-label="Visa">
      <img src="/payment-icons/visa.svg" alt="Visa" />
    </span>
    <span className="sf-pay-badge" title="Mastercard" aria-label="Mastercard">
      <img src="/payment-icons/mastercard.svg" alt="Mastercard" />
    </span>
    <span className="sf-pay-badge" title="American Express" aria-label="American Express">
      <img src="/payment-icons/amex.svg" alt="American Express" />
    </span>
    <span className="sf-pay-badge" title="Diners Club" aria-label="Diners Club">
      <img src="/payment-icons/diners.svg" alt="Diners Club" />
    </span>
    <span className="sf-pay-badge" title="Maestro" aria-label="Maestro">
      <img src="/payment-icons/maestro.svg" alt="Maestro" />
    </span>
    <span className="sf-pay-badge sf-pay-badge--banking" title="RuPay" aria-label="RuPay">
      <img src="/payment-icons/rupay.svg" alt="RuPay" />
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
            Original paintings and fine-art prints by Tvesa Medh. Each piece made with intention and love.
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
