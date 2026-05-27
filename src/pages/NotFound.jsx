import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Art by Tvesa</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main className="not-found-page">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-copy">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="not-found-link">
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
