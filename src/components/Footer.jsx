import NewsletterSignup from './NewsletterSignup'

const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <NewsletterSignup />
      </div>
      <div className="footer-legal">
        <div className="footer-legal-links">
          <a
            href={`https://${STORE_DOMAIN}/policies/privacy-policy`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-legal-link"
          >
            Privacy Policy
          </a>
          <span className="footer-legal-sep">·</span>
          <a
            href={`https://${STORE_DOMAIN}/policies/terms-of-service`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-legal-link"
          >
            Terms of Service
          </a>
          <span className="footer-legal-sep">·</span>
          <a
            href={`https://${STORE_DOMAIN}/policies/refund-policy`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-legal-link"
          >
            Refund Policy
          </a>
        </div>
        <p className="footer-legal-copy">© {new Date().getFullYear()} Art by Tvesa. All artwork © Tvesa Medh. All rights reserved.</p>
      </div>
    </footer>
  )
}
