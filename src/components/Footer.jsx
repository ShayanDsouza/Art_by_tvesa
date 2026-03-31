import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-logo">Art by Tvesa</span>
        <div className="footer-links">
          <a href="https://www.instagram.com/artbytvesa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://in.pinterest.com/artbytvesa/my-art/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><FaPinterest /></a>
          <a href="mailto:artbytvesa@gmail.com" aria-label="Email"><HiOutlineMail /></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Art by Tvesa. All rights reserved.</p>
        <p className="footer-credits">
          Artwork &amp; creative direction — <span>Tvesa Medh</span> &amp; <span>Yana Shah</span>
          &ensp;·&ensp;
          Website Developed by{' '}
          <a href="mailto:dsouza.shayan@gmail.com" className="footer-credit-link">Shayan Dsouza</a>
          {' '}&amp;{' '}
          <a href="mailto:aravpradosh06427@gmail.com" className="footer-credit-link">Arav Pradosh</a>
        </p>
      </div>
    </footer>
  )
}
