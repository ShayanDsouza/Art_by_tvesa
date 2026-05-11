import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import ShopFooter from '../components/ShopFooter'
import ShopCart from '../components/ShopCart'
import Contact from '../components/Contact'
import { useCart } from '../contexts/CartContext'
import { getCollectionProducts, formatPrice, SHOPIFY_ORDERS_URL } from '../lib/shopify'
import { isPostcardBundleProduct } from '../lib/postcardBundles'

const TABS = [
  { id: 'originals',   label: 'Original Artworks' },
  { id: 'prints',      label: 'Prints' },
  { id: 'commissions', label: 'Commissions' },
]

const PRINT_SUBTABS = [
  { id: 'postcards', label: 'Postcards' },
  { id: 'posters',   label: 'Posters' },
]

const COLLECTION_HANDLES = {
  originals:   'original-works',
  postcards:   'postcards',
  posters:     'posters',
  commissions: 'commissions',
}

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-az',    label: 'Alphabetically, A–Z' },
  { value: 'name-za',    label: 'Alphabetically, Z–A' },
]

const ON_SHOP_DOMAIN = window.location.hostname === 'shop.artbytvesa.com'
const SHOP_BASE    = ON_SHOP_DOMAIN ? ''       : '/shop'
const PRODUCT_BASE = ON_SHOP_DOMAIN ? '/product' : '/shop/product'

/* ─── Product card ───────────────────────────────────────── */
function ProductCard({ product, isPostcard, activeTab, activeSubTab }) {
  const { addItem, loading } = useCart()
  // null = idle; for postcards stores the qty just added; for others stores true
  const [added, setAdded] = useState(null)
  const [hovered, setHovered] = useState(false)

  const handleAdd = async (e, qty = 1) => {
    e.stopPropagation()
    e.preventDefault()
    if (!product.variant?.id) return
    await addItem(product.variant.id, qty)
    setAdded(qty)
    setTimeout(() => setAdded(null), 1800)
  }

  const showFramed = hovered && product.hoverImage
  const productUrl = `${PRODUCT_BASE}/${product.handle}?tab=${activeTab}${activeTab === 'prints' ? `&sub=${activeSubTab}` : ''}`
  // Prints use contain so full artwork shows; originals/commissions use cover to fill the frame
  const useContain = !isPostcard && activeTab === 'prints'

  return (
    <Link
      to={productUrl}
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
                  className={`browse-card-img${activeSubTab === 'posters' ? ' browse-card-img--fit' : ''}${showFramed ? ' hidden' : ''}`}
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
                alt={`${product.title} — framed`}
                className={`browse-card-img browse-card-img-hover${showFramed ? ' visible' : ''}`}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="browse-card-img-placeholder" />
        )}

        {/* Sold-out badge */}
        {!product.available && (
          <span className="browse-card-sold-badge">Sold out</span>
        )}

        {/* Add to cart overlay on hover */}
        <div className="browse-card-overlay">
          {isPostcardBundleProduct(product) ? (
            <span className="browse-card-btn browse-card-btn--choose">
              Choose postcards →
            </span>
          ) : (
            <button
              className={`browse-card-btn${added ? ' added' : ''}`}
              onClick={(e) => handleAdd(e, 1)}
              disabled={!product.available || !product.variant?.availableForSale || loading}
            >
              {!product.available ? 'Sold Out' : added ? '✓ Added' : 'Add to Cart'}
            </button>
          )}
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
    </Link>
  )
}

/* ─── Product grid with full Shopify-style filter + sort ─── */
function ProductGrid({ handle, isPostcard, activeTab, activeSubTab }) {
  const PRODUCTS_PER_PAGE = 12
  const [products, setProducts]   = useState([])
  const [status, setStatus]       = useState('loading')
  const [sort, setSort]           = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [openFilter, setOpenFilter] = useState(null) // 'availability' | 'price' | 'sort' | null
  const [filterInStock, setFilterInStock]       = useState(false)
  const [filterOutOfStock, setFilterOutOfStock] = useState(false)
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo]     = useState('')
  const [mobilePanel, setMobilePanel] = useState(null) // 'filter' | 'sort' | null
  const filterBarRef = useRef(null)

  useEffect(() => {
    setStatus('loading')
    setProducts([])
    setCurrentPage(1)
    getCollectionProducts(handle)
      .then(data => {
        setProducts(data)
        setStatus(data.length > 0 ? 'ok' : 'empty')
      })
      .catch(() => setStatus('error'))
  }, [handle])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset to page 1 whenever filters, sort, or collection change
  useEffect(() => {
    setCurrentPage(1)
  }, [handle, sort, filterInStock, filterOutOfStock, priceFrom, priceTo])

  if (status === 'loading') return <div className="browse-status">Loading…</div>
  if (status === 'error')   return <div className="browse-status">Could not load products. Please try again.</div>
  if (status === 'empty')   return <div className="browse-status">Coming soon — check back shortly.</div>

  // Counts for availability labels
  const inStockCount    = products.filter(p => p.available).length
  const outOfStockCount = products.filter(p => !p.available).length
  const maxPrice        = Math.max(0, ...products.map(p => parseFloat(p.variant?.price.amount ?? 0)))
  const availSelected   = (filterInStock ? 1 : 0) + (filterOutOfStock ? 1 : 0)

  const displayed = products
    .filter(p => {
      // Availability
      if (filterInStock || filterOutOfStock) {
        if (filterInStock && filterOutOfStock) return true
        if (filterInStock)    return p.available
        if (filterOutOfStock) return !p.available
      }
      return true
    })
    .filter(p => {
      // Price range
      const price = parseFloat(p.variant?.price.amount ?? 0)
      if (priceFrom !== '' && price < parseFloat(priceFrom)) return false
      if (priceTo   !== '' && price > parseFloat(priceTo))   return false
      return true
    })
    .sort((a, b) => {
      const pa = parseFloat(a.variant?.price.amount ?? 0)
      const pb = parseFloat(b.variant?.price.amount ?? 0)
      if (sort === 'price-asc')  return pa - pb
      if (sort === 'price-desc') return pb - pa
      if (sort === 'name-az')    return a.title.localeCompare(b.title)
      if (sort === 'name-za')    return b.title.localeCompare(a.title)
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(displayed.length / PRODUCTS_PER_PAGE))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const pagedProducts = displayed.slice(
    (currentPageSafe - 1) * PRODUCTS_PER_PAGE,
    currentPageSafe * PRODUCTS_PER_PAGE,
  )
  const startResult = displayed.length === 0 ? 0 : (currentPageSafe - 1) * PRODUCTS_PER_PAGE + 1
  const endResult = Math.min(currentPageSafe * PRODUCTS_PER_PAGE, displayed.length)

  const toggleFilter  = (name) => setOpenFilter(f => f === name ? null : name)
  const filterActive  = filterInStock || filterOutOfStock || !!priceFrom || !!priceTo
  const sortLabel     = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Featured'
  const resultText    = `${displayed.length} Result${displayed.length !== 1 ? 's' : ''}`

  return (
    <>
      {/* ── Filter / sort bar ── */}
      <div className="browse-filter-bar" ref={filterBarRef}>

        {/* Left: Filter button + count */}
        <div className="browse-filter-left">
          <div className="browse-filter-item">
            <button
              className={`browse-filter-main-btn${filterActive ? ' active' : ''}`}
              onClick={() => toggleFilter('filter')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {openFilter === 'filter' && (
              <div className="browse-filter-dropdown browse-filter-dropdown--combined">
                <p className="browse-filter-dropdown-section-label">Availability</p>
                <div className="browse-filter-dropdown-header">
                  <span className="browse-filter-selected-count">{availSelected} selected</span>
                  <button className="browse-filter-reset" onClick={() => { setFilterInStock(false); setFilterOutOfStock(false) }}>Reset</button>
                </div>
                <div className="browse-filter-dropdown-divider" />
                <label className="browse-filter-check-row">
                  <input type="checkbox" checked={filterInStock} onChange={e => setFilterInStock(e.target.checked)} />
                  In stock ({inStockCount})
                </label>
                <label className="browse-filter-check-row">
                  <input type="checkbox" checked={filterOutOfStock} onChange={e => setFilterOutOfStock(e.target.checked)} />
                  Out of stock ({outOfStockCount})
                </label>

                <div className="browse-filter-dropdown-divider" style={{margin: '14px 0'}} />
                <p className="browse-filter-dropdown-section-label">Price</p>
                <div className="browse-filter-dropdown-header">
                  <span className="browse-filter-price-info">Highest: {formatPrice(maxPrice, 'INR')}</span>
                  <button className="browse-filter-reset" onClick={() => { setPriceFrom(''); setPriceTo('') }}>Reset</button>
                </div>
                <div className="browse-filter-dropdown-divider" />
                <div className="browse-filter-price-inputs">
                  <div className="browse-filter-price-field">
                    <span className="browse-filter-price-currency">₹</span>
                    <input type="number" className="browse-filter-price-input" placeholder="From" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} min="0" />
                  </div>
                  <div className="browse-filter-price-field">
                    <span className="browse-filter-price-currency">₹</span>
                    <input type="number" className="browse-filter-price-input" placeholder="To" value={priceTo} onChange={e => setPriceTo(e.target.value)} min="0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="browse-product-count">{resultText}</span>
        </div>

        {/* Right: Sort */}
        <div className="browse-filter-item">
          <button
            className="browse-filter-main-btn"
            onClick={() => toggleFilter('sort')}
          >
            Sort: {sortLabel}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {openFilter === 'sort' && (
            <div className="browse-filter-dropdown browse-sort-dropdown browse-sort-dropdown--right">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`browse-sort-option${sort === o.value ? ' active' : ''}`}
                  onClick={() => { setSort(o.value); setOpenFilter(null) }}
                >
                  {o.value === sort && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="browse-sort-check">
                      <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Mobile filter/sort buttons (shown instead of desktop bar) ── */}
      <div className="browse-mobile-bar">
        <button className="browse-mobile-btn" onClick={() => setMobilePanel('filter')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filter{filterActive ? ' •' : ''}
        </button>
        <button className="browse-mobile-btn" onClick={() => setMobilePanel('sort')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5h10M11 9h7M11 13h4"/><path d="M3 5l4 4-4 4"/>
          </svg>
          {sortLabel}
        </button>
      </div>

      {/* ── Mobile bottom-sheet panels ── */}
      {mobilePanel && (
        <div className="browse-sheet-backdrop" onClick={() => setMobilePanel(null)}>
          <div className="browse-sheet" onClick={e => e.stopPropagation()}>
            <div className="browse-sheet-handle" />

            {mobilePanel === 'filter' && (
              <>
                <div className="browse-sheet-header">
                  <span className="browse-sheet-title">Filter</span>
                  <button className="browse-sheet-reset" onClick={() => { setFilterInStock(false); setFilterOutOfStock(false); setPriceFrom(''); setPriceTo('') }}>Reset all</button>
                </div>

                <div className="browse-sheet-section">
                  <p className="browse-sheet-label">Availability</p>
                  <label className="browse-filter-check-row">
                    <input type="checkbox" checked={filterInStock} onChange={e => setFilterInStock(e.target.checked)} />
                    In stock ({inStockCount})
                  </label>
                  <label className="browse-filter-check-row">
                    <input type="checkbox" checked={filterOutOfStock} onChange={e => setFilterOutOfStock(e.target.checked)} />
                    Out of stock ({outOfStockCount})
                  </label>
                </div>

                <div className="browse-sheet-section">
                  <p className="browse-sheet-label">Price range</p>
                  <div className="browse-filter-price-inputs">
                    <div className="browse-filter-price-field">
                      <span className="browse-filter-price-currency">₹</span>
                      <input type="number" className="browse-filter-price-input" placeholder="From" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} min="0" />
                    </div>
                    <div className="browse-filter-price-field">
                      <span className="browse-filter-price-currency">₹</span>
                      <input type="number" className="browse-filter-price-input" placeholder="To" value={priceTo} onChange={e => setPriceTo(e.target.value)} min="0" />
                    </div>
                  </div>
                </div>

                <button className="browse-sheet-apply" onClick={() => setMobilePanel(null)}>
                  Show {resultText}
                </button>
              </>
            )}

            {mobilePanel === 'sort' && (
              <>
                <div className="browse-sheet-header">
                  <span className="browse-sheet-title">Sort by</span>
                </div>
                <div className="browse-sheet-section">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`browse-sheet-sort-option${sort === o.value ? ' active' : ''}`}
                      onClick={() => { setSort(o.value); setMobilePanel(null) }}
                    >
                      {o.label}
                      {sort === o.value && (
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="browse-grid">
        {pagedProducts.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isPostcard={isPostcard}
            activeTab={activeTab}
            activeSubTab={activeSubTab}
          />
        ))}
      </div>

      {displayed.length > PRODUCTS_PER_PAGE && (
        <div className="browse-pagination">
          <p className="browse-pagination-summary">
            Showing {startResult}-{endResult} of {displayed.length}
          </p>
          <div className="browse-pagination-controls">
            <button
              className="browse-pagination-btn"
              onClick={() => { setCurrentPage(page => Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'instant' }) }}
              disabled={currentPageSafe === 1}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Previous
            </button>
            <span className="browse-pagination-page">
              {currentPageSafe} / {totalPages}
            </span>
            <button
              className="browse-pagination-btn"
              onClick={() => { setCurrentPage(page => Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'instant' }) }}
              disabled={currentPageSafe === totalPages}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
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
    activeTab === 'originals'   ? COLLECTION_HANDLES.originals :
    activeTab === 'commissions' ? COLLECTION_HANDLES.commissions :
    COLLECTION_HANDLES[activeSubTab] ?? COLLECTION_HANDLES.postcards

  const isPostcard = activeTab === 'prints'

  const pageTitle =
    activeTab === 'originals'   ? 'Original Artworks' :
    activeTab === 'commissions' ? 'Commissions' : 'Prints'

  return (
    <>
      <Helmet>
        <title>{pageTitle} — Art by Tvesa Shop</title>
        <meta name="description" content={
          activeTab === 'originals'
            ? 'Browse original one-of-a-kind paintings by Tvesa Medh — acrylic, oil, and mixed media. Each piece is unique and sold once.'
            : activeTab === 'commissions'
            ? 'Commission a custom artwork by Tvesa Medh.'
            : 'Browse fine-art prints and reproductions by Tvesa Medh. High-quality prints of selected original works.'
        } />
        <link rel="canonical" href="https://shop.artbytvesa.com/browse" />
      </Helmet>
      <Navbar />

      <main className="browse-main">

        {/* ── Sticky topbar: breadcrumb + actions ── */}
        <div className="browse-sticky-topbar">
          <nav className="browse-sticky-breadcrumb">
            <Link to={`${SHOP_BASE}/`}>Shop</Link>
            <span className="browse-sticky-sep">/</span>
            <span>{pageTitle}</span>
          </nav>
          <div className="browse-sticky-actions">
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

        {/* ── Page header ── */}
        <section className="browse-header">
          <div className="browse-header-text">
            <span className="browse-overline">Art by Tvesa</span>
            <h2 className="browse-title">{pageTitle}</h2>
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

        {/* ── Products — key forces re-mount on collection change ── */}
        <ProductGrid
          key={collectionHandle}
          handle={collectionHandle}
          isPostcard={isPostcard}
          activeTab={activeTab}
          activeSubTab={activeSubTab}
        />

        {/* ── Contact (commissions only) ── */}
        {activeTab === 'commissions' && <Contact />}

        {/* ── Back ── */}
        <div className="shop-back">
          <Link to={`${SHOP_BASE}/`} className="shop-back-link">← Back to Shop</Link>
        </div>

      </main>

      <ShopCart />
      <ShopFooter />
    </>
  )
}
