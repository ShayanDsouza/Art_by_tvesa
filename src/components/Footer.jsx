import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-legal">
        <div className="footer-legal-links">
          <Link to="/privacy" className="footer-legal-link">Privacy Policy</Link>
          <span className="footer-legal-sep">·</span>
          <Link to="/terms" className="footer-legal-link">Terms of Service</Link>
          <span className="footer-legal-sep">·</span>
          <Link to="/refunds" className="footer-legal-link">Refund Policy</Link>
        </div>
        <p className="footer-legal-copy">© {new Date().getFullYear()} Art by Tvesa. All artwork © Tvesa Medh. All rights reserved.</p>
      </div>
    </footer>
  )
}
