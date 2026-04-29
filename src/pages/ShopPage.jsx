import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ShopPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.classList.add('shop-page', 'shop-cards-page')
    return () => document.body.classList.remove('shop-page', 'shop-cards-page')
  }, [])

  return (
    <>
      <Helmet>
        <title>Shop — Art by Tvesa</title>
        <meta name="description" content="Shop original paintings and fine-art prints by Tvesa Medh. One-of-a-kind artworks in acrylic, oil, and mixed media, plus high-quality reproductions." />
        <meta property="og:title" content="Shop — Art by Tvesa" />
        <meta property="og:description" content="Shop original paintings and fine-art prints by Tvesa Medh." />
        <meta property="og:url" content="https://artbytvesa.com/shop" />
        <link rel="canonical" href="https://artbytvesa.com/shop" />
      </Helmet>
      <Navbar />

      <main className="shop-main">

        {/* ── Hero ── */}
        <section className="shop-hero">
          <span className="section-overline">Art by Tvesa</span>
          <h1 className="shop-hero-title">The Shop</h1>
          <div className="shop-hero-rule" />
          <p className="shop-hero-sub">
            Original works and prints — each piece made with intention.
          </p>
        </section>

        {/* ── Three editorial category panels ── */}
        <section className="shop-categories">

          <Link
            to="/shop/browse?tab=originals"
            className="shop-card shop-card-originals"
          >
            <div className="shop-card-inner">
              <div className="shop-card-top">
                <span className="shop-card-overline">One of a Kind</span>
                <span className="shop-card-number">01</span>
              </div>
              <div className="shop-card-body">
                <h2 className="shop-card-title">Original<br />Artworks</h2>
                <p className="shop-card-desc">
                  Unique, hand-crafted pieces in acrylic, oil, and mixed media.
                  Each artwork is sold once — yours forever.
                </p>
                <div className="shop-card-cta">
                  <span>Browse Originals</span>
                  <span className="shop-card-arrow">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/shop/browse?tab=prints"
            className="shop-card shop-card-prints"
          >
            <div className="shop-card-inner">
              <div className="shop-card-top">
                <span className="shop-card-overline">Reproductions</span>
                <span className="shop-card-number">02</span>
              </div>
              <div className="shop-card-body">
                <h2 className="shop-card-title">Fine Art<br />Prints</h2>
                <p className="shop-card-desc">
                  High-quality fine-art prints of selected works. Bring the
                  colour and emotion of each piece into your space.
                </p>
                <div className="shop-card-cta">
                  <span>Browse Prints</span>
                  <span className="shop-card-arrow">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/shop/browse?tab=commissions"
            className="shop-card shop-card-commissions"
          >
            <div className="shop-card-inner">
              <div className="shop-card-top">
                <span className="shop-card-overline">Custom Work</span>
                <span className="shop-card-number">03</span>
              </div>
              <div className="shop-card-body">
                <h2 className="shop-card-title">Commissions</h2>
                <p className="shop-card-desc">
                  A handpicked selection of past commissions. Each piece was
                  made to order — explore what's possible.
                </p>
                <div className="shop-card-cta">
                  <span>View Commissions</span>
                  <span className="shop-card-arrow">→</span>
                </div>
              </div>
            </div>
          </Link>

        </section>

        {/* ── Back link ── */}
        <div className="shop-back">
          <Link to="/collection" className="shop-back-link">
            ← Back to Archives
          </Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
