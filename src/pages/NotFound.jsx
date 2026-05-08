import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Art by Tvesa</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'var(--color-bg, #E7DDDA)',
      }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#5F578A' }}>404</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#172C16', margin: 0 }}>
          Page not found
        </h1>
        <p style={{ color: '#3b0c0c', opacity: 0.7, maxWidth: 380, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" style={{
          display: 'inline-block',
          marginTop: '0.5rem',
          padding: '10px 28px',
          background: '#172C16',
          color: '#E7DDDA',
          borderRadius: 4,
          textDecoration: 'none',
          fontSize: '0.85rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
