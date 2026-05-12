import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import DOMPurify from 'dompurify'
import Navbar from '../components/Navbar'
import ShopFooter from '../components/ShopFooter'
import ShopCart from '../components/ShopCart'
import { useCart } from '../contexts/CartContext'
import {
  getProduct,
  getCollectionProducts,
  createCartWithAttributes,
  formatPrice,
  SHOPIFY_ORDERS_URL,
} from '../lib/shopify'
import {
  buildPostcardBundleAttributesFromCounts,
  getPostcardBundleSize,
  isPostcardBundleProduct,
} from '../lib/postcardBundles'

const STORE_DOMAIN  = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'
const BROWSE_BASE   = ON_SHOP_DOMAIN ? '/browse'  : '/shop/browse'
const PRODUCT_BASE  = ON_SHOP_DOMAIN ? '/product' : '/shop/product'
const SHOP_BASE     = ON_SHOP_DOMAIN ? ''         : '/shop'

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
  const [hovered, setHovered] = useState(false)
  
  const isPoster = product.productType === 'Posters' || product.tags?.includes('Poster') || product.tags?.includes('Posters')
  const isPostcard = product.productType === 'Postcards' || product.tags?.includes('Postcard') || product.tags?.includes('Postcards') || isPoster
  const isPrint = product.productType === 'Prints' || product.tags?.includes('Prints')
  
  const showFramed = hovered && product.hoverImage
  const useContain = isPrint && !showFramed

  return (
    <Link 
      to={`${PRODUCT_BASE}/${product.handle}`} 
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
                className={`browse-card-img${useContain ? ' browse-card-img--contain' : ''}${showFramed ? ' hidden' : ''}`}
                loading="lazy"
              />
            )}
            {product.hoverImage && (
              <img
                src={product.hoverImage.url}
                alt={`${product.title} - framed`}
                className={`browse-card-img browse-card-img-hover${showFramed ? ' visible' : ''}`}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="browse-card-img-placeholder" />
        )}

        {!product.available && (
          <span className="browse-card-sold-badge">Sold out</span>
        )}
      </div>

      <div className="browse-card-info">
        <p className="browse-card-title">{product.title}</p>
        {product.variant && (
          <p className="browse-card-price">
            {formatPrice(product.variant.price.amount, product.variant.price.currencyCode)}
          </p>
        )}
      </div>
    </Link>
  )
}

/* ─── Main product page ──────────────────────────────────── */
export default function ProductPage() {
  const { handle } = useParams()
  const [searchParams] = useSearchParams()
  const { addItem, openCart, loading: cartLoading, totalQuantity, lines: cartLines } = useCart()

  const [product, setProduct]           = useState(null)
  const [status, setStatus]             = useState('loading')
  const [activeImage, setActiveImage]   = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity]         = useState(1)
  const [added, setAdded]               = useState(false)
  const [related, setRelated]           = useState([])
  const [bundleOptions, setBundleOptions] = useState([])
  const [bundleStatus, setBundleStatus] = useState('idle')
  const [selectedBundleCounts, setSelectedBundleCounts] = useState({})
  const [bundleError, setBundleError]   = useState('')

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
    setBundleOptions([])
    setBundleStatus('idle')
    setSelectedBundleCounts({})
    setBundleError('')
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
    if (!product || !isPostcardBundleProduct(product)) {
      setBundleOptions([])
      setBundleStatus('idle')
      return
    }

    setBundleStatus('loading')
    getCollectionProducts('postcards')
      .then(products => {
        const selectable = products.filter(item => !isPostcardBundleProduct(item))
        setBundleOptions(selectable)
        setBundleStatus(selectable.length > 0 ? 'ok' : 'empty')
      })
      .catch(() => setBundleStatus('error'))
  }, [product])

  useEffect(() => {
    getCollectionProducts(collHandle)
      .then(products => {
        const filtered = products.filter(p => p.handle !== handle && p.available).slice(0, 4)
        setRelated(filtered)
      })
      .catch(() => {})
  }, [handle, collHandle])

  const bundleSize = getPostcardBundleSize(product)
  const isBundleProduct = Boolean(bundleSize)
  const bundleTotal = Object.values(selectedBundleCounts).reduce((a, b) => a + b, 0)

  // Build the set of known individual-postcard handles (loaded from collection)
  const postcardHandleSet = new Set(bundleOptions.map(o => o.handle))

  // Count how many of each postcard handle are already committed in the cart.
  // Two sources:
  //   1. Bundle lines  — have a `postcard_handles` attribute (comma-separated, repeated per qty)
  //   2. Individual lines — no `postcard_handles`; use merchandise.product.handle directly
  const cartPostcardCounts = {}
  cartLines.forEach(line => {
    const bundleAttr = line.attributes?.find(a => a.key === 'postcard_handles')
    if (bundleAttr?.value) {
      // Bundle line: handles repeated once per card × line.quantity
      bundleAttr.value.split(',').filter(Boolean).forEach(h => {
        cartPostcardCounts[h] = (cartPostcardCounts[h] || 0) + line.quantity
      })
    } else {
      // Individual line: count it if its product is a known postcard
      const productHandle = line.merchandise?.product?.handle
      if (productHandle && postcardHandleSet.has(productHandle)) {
        cartPostcardCounts[productHandle] = (cartPostcardCounts[productHandle] || 0) + line.quantity
      }
    }
  })
  const bundleReady = !isBundleProduct || bundleTotal === bundleSize
  const bundleAttributes = isBundleProduct
    ? buildPostcardBundleAttributesFromCounts(selectedBundleCounts, bundleOptions, bundleSize)
    : []

  const incrementBundle = (handle) => {
    setBundleError('')
    setSelectedBundleCounts(prev => {
      const cur = prev[handle] || 0
      const total = Object.values(prev).reduce((a, b) => a + b, 0)
      if (total >= bundleSize) return prev
      // respect stock minus what's already in the cart
      const opt = bundleOptions.find(o => o.handle === handle)
      const stock = opt?.variant?.quantityAvailable
      const inCart = cartPostcardCounts[handle] || 0
      if (stock != null && cur + inCart >= stock) return prev
      return { ...prev, [handle]: cur + 1 }
    })
  }

  const decrementBundle = (handle) => {
    setBundleError('')
    setSelectedBundleCounts(prev => {
      const cur = prev[handle] || 0
      if (cur === 0) return prev
      if (cur === 1) { const { [handle]: _, ...rest } = prev; return rest }
      return { ...prev, [handle]: cur - 1 }
    })
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    if (!bundleReady) {
      setBundleError(`Choose ${bundleSize} postcards to continue.`)
      return
    }
    await addItem(selectedVariant.id, quantity, bundleAttributes)
    if (isBundleProduct) {
      setSelectedBundleCounts({})
      setBundleError('')
      setQuantity(1)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    openCart()
  }

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return
    if (!bundleReady) {
      setBundleError(`Choose ${bundleSize} postcards to continue.`)
      return
    }
    try {
      const cart = await createCartWithAttributes(selectedVariant.id, quantity, bundleAttributes)
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
            <Link to={`${SHOP_BASE}/`}>Shop</Link>
            <span> / </span>
            <Link to={`${BROWSE_BASE}?tab=${fromTab}`}>
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

              {isBundleProduct && (
                <div className="product-bundle-builder">
                  <div className="product-bundle-header">
                    <div>
                      <p className="product-bundle-eyebrow">Postcard bundle</p>
                      <h2 className="product-bundle-title">Choose your {bundleSize} postcards</h2>
                    </div>
                    <span className={`product-bundle-count${bundleTotal === bundleSize ? ' complete' : ''}`}>
                      {bundleTotal} / {bundleSize}
                    </span>
                  </div>

                  <p className="product-bundle-copy">
                    Use + and − on each card to build your set. You can repeat designs.
                  </p>

                  {bundleStatus === 'loading' && (
                    <div className="product-bundle-status">Loading postcard options…</div>
                  )}
                  {bundleStatus === 'error' && (
                    <div className="product-bundle-status">Could not load postcard options. Please try again.</div>
                  )}
                  {bundleStatus === 'empty' && (
                    <div className="product-bundle-status">No postcard options are available right now.</div>
                  )}

                  {bundleStatus === 'ok' && (
                    <div className="product-bundle-grid">
                      {bundleOptions.map(option => {
                        const count = selectedBundleCounts[option.handle] || 0
                        const stock = option.variant?.quantityAvailable
                        const cartCount = cartPostcardCounts[option.handle] || 0
                        const soldOut = !option.available || !option.variant?.availableForSale
                        // remaining = stock not yet committed to cart or current selection
                        const remaining = stock != null ? stock - cartCount : null
                        const atStockLimit = !soldOut && remaining != null && count >= remaining
                        const canInc = !soldOut && bundleTotal < bundleSize && !atStockLimit

                        return (
                          <div
                            key={option.id}
                            className={`product-bundle-card${count > 0 ? ' active' : ''}${soldOut ? ' disabled' : ''}`}
                          >
                            <div className="product-bundle-card-image-wrap">
                              {option.image ? (
                                <img
                                  src={option.image.url}
                                  alt={option.image.altText || option.title}
                                  className="product-bundle-card-image"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="product-bundle-card-image product-bundle-card-image--placeholder" />
                              )}
                              {soldOut && (
                                <span className="product-bundle-card-badge">Sold out</span>
                              )}
                              {/* Per-card quantity counter in the corner */}
                              <div className="product-bundle-card-counter">
                                <button
                                  className="product-bundle-card-qty-btn"
                                  onClick={() => decrementBundle(option.handle)}
                                  disabled={count === 0}
                                  aria-label="Remove one"
                                >−</button>
                                <span className="product-bundle-card-qty-num">{count}</span>
                                <button
                                  className="product-bundle-card-qty-btn"
                                  onClick={() => incrementBundle(option.handle)}
                                  disabled={!canInc}
                                  aria-label="Add one"
                                >+</button>
                              </div>
                            </div>
                            <span className="product-bundle-card-title">{option.title}</span>
                            {atStockLimit && (
                              <span className="product-bundle-card-stock-msg">
                                {remaining <= 0
                                  ? 'No more in stock'
                                  : `Only ${remaining} left`}
                                {cartCount > 0 && remaining > 0 && ` (${cartCount} in cart)`}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {bundleError && (
                    <p className="product-bundle-error">{bundleError}</p>
                  )}
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
                  disabled={!isAvailable || cartLoading || (isBundleProduct && bundleStatus !== 'ok')}
                >
                  {!isAvailable ? 'Sold out' : added ? '✓ Added to cart' : 'Add to cart'}
                </button>
                <button
                  className="product-btn-buy"
                  onClick={handleBuyNow}
                  disabled={!isAvailable || (isBundleProduct && bundleStatus !== 'ok')}
                >
                  Buy it now
                </button>
              </div>

              <ShareBtn title={product.title} />

              {/* Description */}
              {product.descriptionHtml && (
                <div
                  className="product-description"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.descriptionHtml, {
                    ALLOWED_TAGS: ['p','ul','ol','li','a','b','i','em','strong','br','h1','h2','h3','h4','blockquote'],
                    ALLOWED_ATTR: ['href','target','rel'],
                  }) }}
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
          <Link to={`${BROWSE_BASE}?tab=${fromTab}`} className="shop-back-link">
            ← Back
          </Link>
        </div>

      </main>

      <ShopCart />
      <ShopFooter />
    </>
  )
}
