import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ShopCart from '../components/ShopCart'
import { useCart } from '../contexts/CartContext'
import {
  getCollectionProducts, formatPrice,
  SHOPIFY_ACCOUNT_URL, SHOPIFY_ORDERS_URL, SHOPIFY_PROFILE_URL,
} from '../lib/shopify'

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

function ProductCard({ product, isPostcard }) {
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
      className={`browse-card${isPostcard ? ' browse-card--postcard' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="browse-card-img-wrap">
        {product.image ? (
          <>
            {isPostcard ? (
              <div className="browse-card-postcard-rotator">
                <img
                  src={product.image.url}
                  alt={product.image.altText || product.title}
                  className={`browse-card-img${showFramed ? ' hidden' : ''}`}
                  loading="lazy"
                />
              </div>
            ) : (
              <img
                src={product.image.url}
                alt={product.image.altText || product.title}
                className={`browse-card-img${showFramed ? ' hidden' : ''}`}
                loading="lazy"
              />
            )}
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

function ProductGrid({ handle, isPostcard }) {
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
      {products.map(p => <ProductCard key={p.id} product={p} isPostcard={isPostcard} />)}
    </div>
  )
}

export default function ShopBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { totalQuantity, openCart } = useCart()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountOpen])

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
          <div className="browse-header-actions">
            {/* ── Account menu ── */}
            <div className="account-menu-wrap" ref={accountRef}>
              <button
                className="cart-trigger"
                onClick={() => setAccountOpen(o => !o)}
                aria-label="Account"
                aria-expanded={accountOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  <a href={SHOPIFY_ACCOUNT_URL} target="_blank" rel="noopener noreferrer" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    My Account
                  </a>
                  <a href={SHOPIFY_ORDERS_URL} target="_blank" rel="noopener noreferrer" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <line x1="9" y1="12" x2="15" y2="12"/>
                      <line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                    My Orders
                  </a>
                  <a href={SHOPIFY_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                  </a>
                </div>
              )}
            </div>

            {/* ── Cart ── */}
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
          </div>
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
        <ProductGrid handle={collectionHandle} isPostcard={activeSubTab === 'postcards' && activeTab === 'prints'} />

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
