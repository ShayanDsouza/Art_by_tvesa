import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <NewsletterSignup />
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Art by Tvesa. All rights reserved.</p>
        <p className="footer-credits">
          <span className="footer-credits-line">Artwork &amp; creative direction — <span>Tvesa Medh</span> &amp; <span>Yana Shah</span></span>
          <br />
          <span className="footer-credits-line">Website Developed by{' '}
          <a href="mailto:dsouza.shayan@gmail.com" className="footer-credit-link">Shayan Dsouza</a>
          {' '}&amp;{' '}
          <a href="mailto:aravpradosh06427@gmail.com" className="footer-credit-link">Arav Pradosh</a></span>
        </p>
      </div>
    </footer>
  )
}
