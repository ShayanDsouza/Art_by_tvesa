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
          <a href="mailto:dsouza.shayan@gmail.com" aria-label="Email"><HiOutlineMail /></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Art by Tvesa. All rights reserved.</p>
      </div>
    </footer>
  )
}
