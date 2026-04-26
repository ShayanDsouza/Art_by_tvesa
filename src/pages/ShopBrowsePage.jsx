import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ShopCart from '../components/ShopCart'
import { useCart } from '../contexts/CartContext'
import { getCollectionProducts, formatPrice } from '../lib/shopify'

const TABS = [
  { id: 'originals', label: 'Original Artworks' },
  { id: 'prints',    label: 'Prints' },
]

const PRINT_SUBTABS = [
  { id: 'postcards', label: 'Postcards' },
  { id: 'posters',   label: 'Posters' },
]

const COLLECTION_HANDLES = {
  originals: 'original-works',
  postcards: 'postcards',
  posters:   'posters',
}

function ProductCard({ product }) {
  const { addItem, loading } = useCart()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAdd = async (e) => {
    e.stopPropagation()
    if (!product.variant?.id) return
    await addItem(product.variant.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const showFramed = hovered && product.hoverImage

  return (
    <div
      className="browse-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="browse-card-img-wrap">
        {product.image ? (
          <>
            <img
              src={product.image.url}
              alt={product.image.altText || product.title}
              className={`browse-card-img${showFramed ? ' hidden' : ''}`}
              loading="lazy"
            />
            {product.hoverImage && (
              <img
                src={product.hoverImage.url}
                alt={`${product.title} — framed`}
                className={`browse-card-img browse-card-img-hover${showFramed ? ' visible' : ''}`}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="browse-card-img-placeholder" />
        )}

        {/* Add to cart overlay on hover */}
        <div className="browse-card-overlay">
          <button
            className={`browse-card-btn${added ? ' added' : ''}`}
            onClick={handleAdd}
            disabled={!product.available || !product.variant?.availableForSale || loading}
          >
            {!product.available ? 'Sold Out' : added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="browse-card-info">
        <p className="browse-card-title">{product.title}</p>
        <p className="browse-card-vendor">Art by Tvesa</p>
        {product.variant && (
          <p className="browse-card-price">
            {formatPrice(product.variant.price.amount, product.variant.price.currencyCode)}
          </p>
        )}
      </div>
    </div>
  )
}

function ProductGrid({ handle }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus('loading')
    setProducts([])
    getCollectionProducts(handle)
      .then(data => {
        setProducts(data)
        setStatus(data.length > 0 ? 'ok' : 'empty')
      })
      .catch(() => setStatus('error'))
  }, [handle])

  if (status === 'loading') return <div className="browse-status">Loading…</div>
  if (status === 'error')   return <div className="browse-status">Could not load products. Please try again.</div>
  if (status === 'empty')   return <div className="browse-status">Coming soon — check back shortly.</div>

  return (
    <div className="browse-grid">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

export default function ShopBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { totalQuantity, openCart } = useCart()

  const activeTab    = searchParams.get('tab') || 'originals'
  const activeSubTab = searchParams.get('sub') || 'postcards'

  const setTab    = (tab) => setSearchParams({ tab })
  const setSubTab = (sub) => setSearchParams({ tab: 'prints', sub })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.add('shop-page', 'shop-browse-page')
    return () => document.body.classList.remove('shop-page', 'shop-browse-page')
  }, [])

  const collectionHandle =
    activeTab === 'originals'
      ? COLLECTION_HANDLES.originals
      : COLLECTION_HANDLES[activeSubTab] ?? COLLECTION_HANDLES.postcards

  return (
    <>
      <Helmet>
        <title>{activeTab === 'originals' ? 'Original Artworks' : 'Prints'} — Art by Tvesa Shop</title>
        <meta name="description" content={activeTab === 'originals'
          ? 'Browse original one-of-a-kind paintings by Tvesa Medh — acrylic, oil, and mixed media. Each piece is unique and sold once.'
          : 'Browse fine-art prints and reproductions by Tvesa Medh. High-quality prints of selected original works.'} />
        <link rel="canonical" href="https://artbytvesa.com/shop/browse" />
      </Helmet>
      <Navbar />

      <main className="browse-main">

        {/* ── Page header ── */}
        <section className="browse-header">
          <div className="browse-header-text">
            <span className="browse-overline">Art by Tvesa</span>
            <h2 className="browse-title">
              {activeTab === 'originals' ? 'Original Artworks' : 'Prints'}
            </h2>
          </div>
          <button className="cart-trigger" onClick={openCart} aria-label="Open cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalQuantity > 0 && (
              <span className="cart-trigger-count">{totalQuantity}</span>
            )}
          </button>
        </section>

        {/* ── Main tabs ── */}
        <div className="browse-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`browse-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Print sub-tabs ── */}
        {activeTab === 'prints' && (
          <div className="browse-subtabs">
            {PRINT_SUBTABS.map(sub => (
              <button
                key={sub.id}
                className={`browse-subtab${activeSubTab === sub.id ? ' active' : ''}`}
                onClick={() => setSubTab(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Products ── */}
        <ProductGrid handle={collectionHandle} />

        {/* ── Back ── */}
        <div className="shop-back">
          <Link to="/shop" className="shop-back-link">← Back to Shop</Link>
        </div>

      </main>

      <ShopCart />
      <Footer />
    </>
  )
}
