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

    {/* Visa */}
    <span className="sf-pay-badge" title="Visa" aria-label="Visa">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#fff"/>
        <path d="M278 334L311 136H364L331 334H278Z" fill="#00579F"/>
        <path d="M525 141c-11-4-29-8-51-8-57 0-97 30-97 74 0 32 29 50 51 61 22 11 30 18 30 27 0 14-18 21-35 21-23 0-36-3-55-12l-7-3-8 52c14 6 40 12 67 12 61 0 100-30 100-77 0-26-16-45-49-61-20-9-32-16-32-26 0-9 11-18 33-18 19 0 32 4 42 8l5 3 6-53Z" fill="#00579F"/>
        <path d="M614 136h-43c-13 0-23 4-29 18L463 334h57l11-32h74l8 32h53L614 136Zm-67 121c2-8 24-66 24-66l10 42 6 24h-40Z" fill="#00579F"/>
        <path d="M233 136l-55 131-6-29C163 214 130 181 96 163l52 171h57l87-198h-59Z" fill="#00579F"/>
        <path d="M136 136H49l-1 5c77 19 128 66 149 121L180 154c-4-15-14-19-44-18Z" fill="#FAA61A"/>
      </svg>
    </span>

    {/* Mastercard */}
    <span className="sf-pay-badge" title="Mastercard" aria-label="Mastercard">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#252525"/>
        <circle cx="280" cy="235" r="145" fill="#EB001B"/>
        <circle cx="470" cy="235" r="145" fill="#F79E1B"/>
        <path d="M375 120c40 27 66 71 66 115s-26 88-66 115c-40-27-66-71-66-115s26-88 66-115Z" fill="#FF5F00"/>
      </svg>
    </span>

    {/* American Express */}
    <span className="sf-pay-badge" title="American Express" aria-label="American Express">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#2557D6"/>
        <text x="375" y="215" textAnchor="middle" fill="#fff"
          fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="88" letterSpacing="-2">AMEX</text>
        <text x="375" y="305" textAnchor="middle" fill="rgba(255,255,255,0.8)"
          fontFamily="Arial,sans-serif" fontWeight="400" fontSize="52" letterSpacing="7">EXPRESS</text>
      </svg>
    </span>

    {/* Diners Club */}
    <span className="sf-pay-badge" title="Diners Club" aria-label="Diners Club">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#fff"/>
        <circle cx="305" cy="228" r="160" fill="none" stroke="#004A97" strokeWidth="14"/>
        <circle cx="445" cy="228" r="160" fill="none" stroke="#004A97" strokeWidth="14"/>
        <path d="M375 100c39 26 65 72 65 128s-26 102-65 128c-39-26-65-72-65-128s26-102 65-128Z" fill="#004A97"/>
        <text x="375" y="420" textAnchor="middle" fill="#004A97"
          fontFamily="Arial,sans-serif" fontWeight="700" fontSize="36" letterSpacing="1">DINERS CLUB</text>
      </svg>
    </span>

    {/* Maestro */}
    <span className="sf-pay-badge" title="Maestro" aria-label="Maestro">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#fff"/>
        <circle cx="265" cy="228" r="155" fill="#EB001B"/>
        <circle cx="485" cy="228" r="155" fill="#00A2E5"/>
        <path d="M375 105c42 27 69 73 69 123s-27 96-69 123c-42-27-69-73-69-123s27-96 69-123Z" fill="#7375CF"/>
        <text x="375" y="410" textAnchor="middle" fill="#1A1F6E"
          fontFamily="Arial,sans-serif" fontWeight="700" fontSize="44" letterSpacing="3">maestro</text>
      </svg>
    </span>

    {/* RuPay */}
    <span className="sf-pay-badge sf-pay-badge--banking" title="RuPay" aria-label="RuPay">
      <svg viewBox="0 0 750 471" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="471" rx="40" fill="#fff"/>
        {/* Saffron top band */}
        <rect x="30" y="30"  width="690" height="80" rx="20" fill="#FF9933"/>
        <rect x="30" y="70"  width="690" height="40"          fill="#FF9933"/>
        {/* Green bottom band */}
        <rect x="30" y="361" width="690" height="80" rx="20" fill="#138808"/>
        <rect x="30" y="361" width="690" height="40"          fill="#138808"/>
        {/* White middle */}
        <rect x="30" y="110" width="690" height="251"         fill="#fff"/>
        {/* RuPay logotype */}
        <text x="375" y="278" textAnchor="middle" fill="#003087"
          fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="118" letterSpacing="-3">RuPay</text>
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
