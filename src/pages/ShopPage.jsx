import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import ShopFooter from '../components/ShopFooter'

const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'
const BROWSE_BASE = ON_SHOP_DOMAIN ? '/browse' : '/shop/browse'

const COLLECTIONS = [
  {
    id: 'originals',
    title: 'Original Paintings',
    desc: [
      'An original painting is a one of a kind artwork produced by the artist. It is ideated, designed and produced by me.                        ',
      '                          ',
    ],
    link: `${BROWSE_BASE}?tab=originals`,
    image: '/originals.jpg',
  },
  {
    id: 'prints',
    title: 'Fine Art Prints',
    desc: [
      'Prints are high quality reproductions of my paintings on various surfaces, so you can own the work you love without the original price tag.'
    ],
    link: `${BROWSE_BASE}?tab=prints`,
    image: '/prints.jpg',
  },
  {
    id: 'commissions',
    title: 'Commissions',
    desc: [
      'If my style speaks to you and you have a specific idea in mind, we can work together to bring it to life.',
      '                          ',
    ],
    link: `${BROWSE_BASE}?tab=commissions`,
    image: '/commissions.jpg',
  },
]

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

        {/* ── Header ── */}
        <section className="shop-hero">
          <span className="section-overline">Art by Tvesa</span>
          <h1 className="shop-hero-title">Shop Collections</h1>
          <div className="shop-hero-rule" />
        </section>

        {/* ── Three image cards ── */}
        <section className="shop-categories">
          {COLLECTIONS.map(col => (
            <Link
              key={col.id}
              to={col.link}
              className="shop-card"
              style={{ backgroundImage: `url(${col.image})` }}
            >
              <div className="shop-card-overlay" />
              <div className="shop-card-inner">
                <h2 className="shop-card-title">
                  {col.title.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </h2>
                {col.desc.map((p, i) => (
                  <p key={i} className="shop-card-desc">{p}</p>
                ))}
              </div>
            </Link>
          ))}
        </section>

        {/* ── Back link ── */}
        {!ON_SHOP_DOMAIN && (
          <div className="shop-back">
            <Link to="/archives" className="shop-back-link">
              ← Back to Archives
            </Link>
          </div>
        )}

      </main>
      <ShopFooter />
    </>
  )
}
