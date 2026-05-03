import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ShopCart from '../components/ShopCart'
import { useCart } from '../contexts/CartContext'
import {
  getProduct,
  getCollectionProducts,
  createCart,
  formatPrice,
  SHOPIFY_ORDERS_URL,
} from '../lib/shopify'

const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

const COLLECTION_FROM_TAB = {
  originals:   'original-works',
  prints:      'postcards',
  postcards:   'postcards',
  posters:     'posters',
  commissions: 'commissions',
}

/* ─── Share button ───────────────────────────────────────── */
function ShareBtn({ title }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button className="product-share-btn" onClick={share}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  )
}

/* ─── Related product card ───────────────────────────────── */
function RelatedCard({ product }) {
  return (
    <Link to={`/shop/product/${product.handle}`} className="product-related-card">
      {product.image ? (
        <img
          src={product.image.url}
          alt={product.image.altText || product.title}
          className="product-related-img"
          loading="lazy"
        />
      ) : (
        <div className="product-related-img-placeholder" />
      )}
      <p className="product-related-title">{product.title}</p>
      {product.variant && (
        <p className="product-related-price">
          {formatPrice(product.variant.price.amount, product.variant.price.currencyCode)}
        </p>
      )}
    </Link>
  )
}

/* ─── Main product page ──────────────────────────────────── */
export default function ProductPage() {
  const { handle } = useParams()
  const [searchParams] = useSearchParams()
  const { addItem, openCart, loading: cartLoading, totalQuantity } = useCart()

  const [product, setProduct]           = useState(null)
  const [status, setStatus]             = useState('loading')
  const [activeImage, setActiveImage]   = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity]         = useState(1)
  const [added, setAdded]               = useState(false)
  const [related, setRelated]           = useState([])

  const fromTab = searchParams.get('tab') || 'originals'
  const collHandle = COLLECTION_FROM_TAB[fromTab] ?? 'original-works'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.add('shop-page')
    return () => document.body.classList.remove('shop-page')
  }, [])

  useEffect(() => {
    setStatus('loading')
    setProduct(null)
    setActiveImage(0)
    setQuantity(1)
    setAdded(false)
    getProduct(handle)
      .then(p => {
        if (!p) { setStatus('not-found'); return }
        setProduct(p)
        setSelectedVariant(p.variants.edges[0]?.node ?? null)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [handle])

  useEffect(() => {
    getCollectionProducts(collHandle)
      .then(products => {
        const filtered = products.filter(p => p.handle !== handle).slice(0, 4)
        setRelated(filtered)
      })
      .catch(() => {})
  }, [handle, collHandle])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    await addItem(selectedVariant.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    openCart()
  }

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return
    try {
      const cart = await createCart(selectedVariant.id, quantity)
      window.location.href = cart.checkoutUrl
    } catch {
      // fallback to Shopify product page
      window.open(`https://${STORE_DOMAIN}/products/${handle}`, '_blank', 'noopener,noreferrer')
    }
  }

  const images = product?.images.edges.map(e => e.node) ?? []
  const isAvailable = selectedVariant?.availableForSale && product?.availableForSale
  const maxQty = selectedVariant?.quantityAvailable ?? Infinity

  return (
    <>
      <Helmet>
        <title>{product ? `${product.title} — Art by Tvesa` : 'Product — Art by Tvesa'}</title>
        <meta name="description" content={product ? `${product.title} by Art by Tvesa.` : ''} />
      </Helmet>
      <Navbar />

      <main className="product-main">

        {/* ── Breadcrumb + action buttons ── */}
        <div className="product-topbar">
          <nav className="product-breadcrumb">
            <Link to="/shop">Shop</Link>
            <span> / </span>
            <Link to={`/shop/browse?tab=${fromTab}`}>
              {fromTab === 'originals' ? 'Original Artworks' :
               fromTab === 'commissions' ? 'Commissions' : 'Prints'}
            </Link>
            {product && <><span> / </span><span>{product.title}</span></>}
          </nav>
          <div className="product-topbar-actions">
            <a
              href={SHOPIFY_ORDERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cart-trigger"
              aria-label="My orders"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </a>
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
        </div>

        {status === 'loading' && (
          <div className="product-status">Loading…</div>
        )}
        {status === 'error' && (
          <div className="product-status">Could not load product. Please try again.</div>
        )}
        {status === 'not-found' && (
          <div className="product-status">Product not found.</div>
        )}

        {status === 'ok' && product && (
          <div className="product-layout">

            {/* ── Image gallery ── */}
            <div className="product-gallery">
              <div className="product-gallery-main">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage].url}
                    alt={images[activeImage].altText || product.title}
                    className="product-gallery-img"
                  />
                ) : (
                  <div className="product-gallery-placeholder" />
                )}
              </div>
              {images.length > 1 && (
                <div className="product-gallery-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`product-gallery-thumb${activeImage === i ? ' active' : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={img.url} alt={img.altText || product.title} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product info ── */}
            <div className="product-info">
              <p className="product-vendor">ART BY TVESA</p>
              <h1 className="product-title">{product.title}</h1>

              <div className="product-price-row">
                {selectedVariant && (
                  <span className="product-price">
                    {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
                  </span>
                )}
                {!isAvailable && (
                  <span className="product-sold-badge">Sold out</span>
                )}
              </div>

              {/* Variant selector (only if multiple variants) */}
              {product.variants.edges.length > 1 && (
                <div className="product-variants">
                  {product.variants.edges.map(({ node }) => (
                    <button
                      key={node.id}
                      className={`product-variant-btn${selectedVariant?.id === node.id ? ' active' : ''}${!node.availableForSale ? ' sold-out' : ''}`}
                      onClick={() => { setSelectedVariant(node); setQuantity(1) }}
                    >
                      {node.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="product-quantity-row">
                <span className="product-quantity-label">Quantity</span>
                <div className="product-quantity-ctrl">
                  <button
                    className="product-qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >−</button>
                  <span className="product-qty-value">{quantity}</span>
                  <button
                    className="product-qty-btn"
                    onClick={() => setQuantity(q => Math.min(q + 1, maxQty))}
                    disabled={!isAvailable || quantity >= maxQty}
                  >+</button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="product-actions">
                <button
                  className={`product-btn-cart${added ? ' added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!isAvailable || cartLoading}
                >
                  {!isAvailable ? 'Sold out' : added ? '✓ Added to cart' : 'Add to cart'}
                </button>
                <button
                  className="product-btn-buy"
                  onClick={handleBuyNow}
                  disabled={!isAvailable}
                >
                  Buy it now
                </button>
              </div>

              <ShareBtn title={product.title} />

              {/* Description */}
              {product.descriptionHtml && (
                <div
                  className="product-description"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              )}
            </div>

          </div>
        )}

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section className="product-related">
            <h2 className="product-related-title-main">You may also like</h2>
            <div className="product-related-grid">
              {related.map(p => <RelatedCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        <div className="shop-back">
          <Link to={`/shop/browse?tab=${fromTab}`} className="shop-back-link">
            ← Back
          </Link>
        </div>

      </main>

      <ShopCart />
      <Footer />
    </>
  )
}
