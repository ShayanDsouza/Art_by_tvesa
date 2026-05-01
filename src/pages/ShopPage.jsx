import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import ShopFooter from '../components/ShopFooter'
import { getCollectionProducts } from '../lib/shopify'

const COLLECTIONS = [
  {
    id: 'originals',
    handle: 'original-works',
    title: 'Original\nPaintings',
    desc: 'Unique, hand-crafted pieces in acrylic, oil, and mixed media. Each artwork is sold once — yours forever.',
    link: '/shop/browse?tab=originals',
  },
  {
    id: 'prints',
    handle: 'postcards',
    title: 'Fine Art\nPrints',
    desc: 'High-quality fine-art prints of selected works. Bring the colour and emotion of each piece into your space.',
    link: '/shop/browse?tab=prints',
  },
  {
    id: 'commissions',
    handle: 'commissions',
    title: 'Commissioned\nWorks',
    desc: 'A handpicked selection of past commissions. Each piece was made to order — explore what\'s possible.',
    link: '/shop/browse?tab=commissions',
  },
]

export default function ShopPage() {
  const [images, setImages] = useState({})

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.classList.add('shop-page', 'shop-cards-page')
    return () => document.body.classList.remove('shop-page', 'shop-cards-page')
  }, [])

  useEffect(() => {
    COLLECTIONS.forEach(col => {
      getCollectionProducts(col.handle)
        .then(products => {
          const img = products[0]?.image?.url
          if (img) setImages(prev => ({ ...prev, [col.id]: img }))
        })
        .catch(() => {})
    })
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
              style={images[col.id] ? { backgroundImage: `url(${images[col.id]})` } : {}}
            >
              <div className="shop-card-overlay" />
              <div className="shop-card-inner">
                <h2 className="shop-card-title">
                  {col.title.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </h2>
                <p className="shop-card-desc">{col.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* ── Back link ── */}
        <div className="shop-back">
          <Link to="/collection" className="shop-back-link">
            ← Back to Archives
          </Link>
        </div>

      </main>
      <ShopFooter />
    </>
  )
}
