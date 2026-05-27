import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <NewsletterSignup />
      </div>
      <div className="footer-legal">
        <div className="footer-legal-links">
          <a href="https://shop.artbytvesa.com/policies/privacy-policy" className="footer-legal-link">Privacy Policy</a>
          <span className="footer-legal-sep">·</span>
          <a href="https://shop.artbytvesa.com/policies/terms-of-service" className="footer-legal-link">Terms of Service</a>
          <span className="footer-legal-sep">·</span>
          <a href="https://shop.artbytvesa.com/policies/refund-policy" className="footer-legal-link">Refund Policy</a>
        </div>
        <p className="footer-legal-copy">© {new Date().getFullYear()} Art by Tvesa. All artwork © Tvesa Medh. All rights reserved.</p>
      </div>
    </footer>
  )
}
