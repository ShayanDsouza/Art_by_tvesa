import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToNewsletter } from '../lib/shopify'
import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

const STUDIO_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Shop',     to: '/shop' },
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

const PaymentIcons = () => (
  <div className="sf-payments">
    <span className="sf-pay-badge" title="Visa">
      <svg viewBox="0 0 64 40" aria-label="Visa" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <path d="M20 11h4.8l-3 18H17z" fill="#1A1F71"/>
        <path d="M42.6 11.5c-.9-.4-2.4-.8-4.2-.8-4.6 0-7.8 2.4-7.8 5.9 0 2.6 2.4 4 4.2 4.9 1.9.9 2.5 1.5 2.5 2.3 0 1.2-1.5 1.8-2.9 1.8-2 0-3-.3-4.6-1l-.6-.3-.7 4.1c1.2.5 3.3 1 5.6 1 4.9 0 8.1-2.4 8.2-6.1 0-2-1.2-3.6-3.9-4.8-1.6-.8-2.7-1.3-2.7-2.2 0-.7.9-1.5 2.7-1.5 1.5 0 2.7.3 3.6.7l.4.2.7-4Z" fill="#1A1F71"/>
        <path d="M31 11.1h-3.8c-1.2 0-2.1.4-2.7 1.6l-7.2 15.9h5c.8-2 1-2.5 1.4-3.5h6.1c.1.8.4 2.1.6 3.5h4.4Zm-5.8 10.3c.4-1 1.9-4.8 1.9-4.8s.4-1 .6-1.6l.3 1.4s.9 4.1 1.1 5H25.2Z" fill="#1A1F71"/>
        <path d="M14.8 11.1h-7.6l-.1.4c5.9 1.5 9.8 5 11.4 9.2l-1.6-8.1c-.3-1.2-1.2-1.5-2.1-1.5Z" fill="#F7B600"/>
        <path d="M16.9 12.6 20 28.7h-5l-4-13.7c2.4 1.3 4.5 3.3 5.9 5.8Z" fill="#1A1F71"/>
      </svg>
    </span>
    <span className="sf-pay-badge" title="Mastercard">
      <svg viewBox="0 0 64 40" aria-label="Mastercard" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <circle cx="27" cy="20" r="9.5" fill="#EB001B"/>
        <circle cx="37" cy="20" r="9.5" fill="#F79E1B"/>
        <path d="M32 12.8a9.4 9.4 0 0 0 0 14.4 9.4 9.4 0 0 0 0-14.4Z" fill="#FF5F00"/>
      </svg>
    </span>
    <span className="sf-pay-badge" title="PayPal">
      <svg viewBox="0 0 64 40" aria-label="PayPal" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <path d="M24.4 10h8.8c3.6 0 6.1 2.2 5.4 5.8-.8 4.1-3.8 6.1-7.8 6.1h-2.5l-1.3 7.1h-4.7Z" fill="#003087"/>
        <path d="M28.2 12.5h7.3c3 0 4.8 1.8 4.2 4.8-.6 3.4-3.2 5.2-6.5 5.2h-2.1l-1.1 5.9h-4Z" fill="#009CDE"/>
        <path d="M22 10h4.3l-3.6 19h-4.3Z" fill="#012169"/>
      </svg>
    </span>
    <span className="sf-pay-badge" title="American Express">
      <svg viewBox="0 0 64 40" aria-label="American Express" role="img">
        <rect width="64" height="40" rx="6" fill="#016FD0"/>
        <rect x="10" y="10" width="44" height="20" fill="none" stroke="#fff" strokeWidth="1.2"/>
        <text x="32" y="18" textAnchor="middle" fill="#fff" fontSize="6.2" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing=".6">AMERICAN</text>
        <text x="32" y="25.5" textAnchor="middle" fill="#fff" fontSize="6.2" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing=".6">EXPRESS</text>
      </svg>
    </span>
    <span className="sf-pay-badge" title="RuPay">
      <svg viewBox="0 0 64 40" aria-label="RuPay" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <path d="M14 27c4.8-7.9 12.2-12.7 24.5-13.3 4.8-.3 9.4.3 13.5 1.4-4.4 6.1-10.4 10.3-18.8 11.8-7 1.3-13.5.9-19.2.1Z" fill="#F58220"/>
        <path d="M12.3 24.9c5.2-7.2 12-11.8 22.4-12.9 4-.4 8-.2 11.7.5-3.5 5.4-8.5 9.1-15.5 10.6-6.1 1.3-12.2 1.6-18.6 1.8Z" fill="#00AEEF"/>
        <path d="M12 21.5c4.9-5.2 10.9-8.5 18.8-9.4 2.4-.3 5.6-.3 8.7.1-2.7 4-6.9 6.6-12 7.9-4.9 1.3-9.9 1.5-15.5 1.4Z" fill="#1B3280"/>
        <text x="31.5" y="23.2" textAnchor="middle" fill="#1B3280" fontSize="10" fontStyle="italic" fontWeight="700" fontFamily="Arial,sans-serif">RuPay</text>
      </svg>
    </span>
    <span className="sf-pay-badge" title="UPI">
      <svg viewBox="0 0 64 40" aria-label="UPI" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <text x="24" y="24" textAnchor="middle" fill="#1f1f1f" fontSize="13" fontWeight="700" fontFamily="Arial,sans-serif">UPI</text>
        <path d="M36 11 46.5 20 36 29l2.4-6h8.1l-5.8-5 5.8-5h-8.1Z" fill="#F58220"/>
        <path d="m38.4 12.2 8.1 6.8-8.1 7-1.7-4.2h6.7l-5.2-4.8 5.2-4.8h-6.7Z" fill="#00AEEF" opacity=".9"/>
      </svg>
    </span>
    <span className="sf-pay-badge sf-pay-badge--banking" title="Net Banking">
      <svg viewBox="0 0 64 40" aria-label="Net Banking" role="img">
        <rect width="64" height="40" rx="6" fill="#fff"/>
        <path d="M14 17.5 32 10l18 7.5v2.7H14Z" fill="#172C16"/>
        <path d="M18 18.8h3.2v9.2H18zm8.6 0h3.2v9.2h-3.2zm8.6 0h3.2v9.2h-3.2zm8.6 0H47v9.2h-3.2z" fill="#172C16"/>
        <path d="M13 29.2h38v2.8H13Z" fill="#172C16"/>
        <text x="32" y="36" textAnchor="middle" fill="#172C16" fontSize="6.4" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing=".7">NET BANKING</text>
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
