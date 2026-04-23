import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NewsletterSignup from '../components/NewsletterSignup'

export default function ShopPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.classList.add('shop-page')
    return () => document.body.classList.remove('shop-page')
  }, [])

  return (
    <>
      <Navbar />
      <main className="shop-main">

        {/* ── Hero ── */}
        <section className="shop-hero">
          <span className="section-overline">Art by Tvesa</span>
          <h1 className="shop-hero-title">The Shop</h1>
          <p className="shop-hero-sub">
            Original works and prints — each piece made with intention.
          </p>
        </section>

        {/* ── Two big category cards ── */}
        <section className="shop-categories">

          <Link
            to="/shop/browse?tab=originals"
            className="shop-card shop-card-originals"
          >
            <div className="shop-card-inner">
              <span className="shop-card-overline">One of a Kind</span>
              <h2 className="shop-card-title">Original Artworks</h2>
              <p className="shop-card-desc">
                Unique, hand-crafted pieces in acrylic, oil, and mixed media.
                Each artwork is sold once — yours forever.
              </p>
              <span className="shop-card-cta">Browse Originals →</span>
            </div>
          </Link>

          <Link
            to="/shop/browse?tab=prints"
            className="shop-card shop-card-prints"
          >
            <div className="shop-card-inner">
              <span className="shop-card-overline">Reproductions</span>
              <h2 className="shop-card-title">Prints</h2>
              <p className="shop-card-desc">
                High-quality fine-art prints of selected works. Bring the
                colour and emotion of each piece into your space.
              </p>
              <span className="shop-card-cta">Browse Prints →</span>
            </div>
          </Link>

        </section>

        {/* ── Newsletter ── */}
        <NewsletterSignup />

        {/* ── Back link ── */}
        <div className="shop-back">
          <Link to="/collection" className="shop-back-link">
            ← Archives
          </Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
