import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Link } from 'react-router-dom'
import GalleryLoader from './GalleryLoader'

const fallbackArt = [
  { id: '1', title: 'Artwork 1', category: 'Painting', medium: 'Acrylic' },
  { id: '2', title: 'Artwork 2', category: 'Sketch',   medium: 'Paper'   },
  { id: '3', title: 'Artwork 3', category: 'Painting', medium: 'Canvas'  },
  { id: '4', title: 'Artwork 4', category: 'Digital',  medium: 'Tote Bag'},
  { id: '5', title: 'Artwork 5', category: 'Sketch',   medium: 'Paper'   },
]

function getThumbnailUrl(art) {
  const imgs = art.images
  if (imgs && imgs.length > 0) return (imgs.find(img => img.isThumbnail) || imgs[0]).url
  return art.imageUrl || ''
}

const SLOT_W = 320   // px between artwork centres

export default function Gallery() {
  const [artworks, setArtworks]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const wallRef         = useRef(null)
  const carouselZoneRef = useRef(null)   // scroll-intercepting zone (artwork strip area only)
  const artEls          = useRef([])
  const offsetRef       = useRef(0)
  const velocityRef     = useRef(0)
  const animRef         = useRef(null)
  const isDragging      = useRef(false)
  const lastXRef        = useRef(0)
  const artworksRef     = useRef([])

  /* ── Firebase ─────────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsub = onSnapshot(q, snap => {
        if (snap.empty) { setArtworks(fallbackArt); setLoading(false); return }
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        const featured = docs.filter(a => a.featured).slice(0, 11)
        setArtworks(featured.length > 0 ? featured : docs.slice(0, 11))
        setLoading(false)
      }, () => { setArtworks(fallbackArt); setLoading(false) })
      return unsub
    } catch { setArtworks(fallbackArt); setLoading(false) }
  }, [])

  useEffect(() => { artworksRef.current = artworks }, [artworks])

  /* ── Navbar: hide while gallery is in view ────────────────────────── */
  useEffect(() => {
    const el = wallRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => document.body.classList.toggle('gallery-active', e.isIntersecting),
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => { obs.disconnect(); document.body.classList.remove('gallery-active') }
  }, [])

  /* ── Core: apply offset → DOM transforms (no React re-render) ────── */
  const applyOffset = useCallback((off) => {
    offsetRef.current = off
    const arts = artworksRef.current
    const n = arts.length
    if (!n) return

    artEls.current.forEach((el, i) => {
      if (!el) return
      let rel = ((i - off) % n + n * 1.5) % n - n / 2
      const x    = rel * SLOT_W
      const dist = Math.abs(rel)
      const scale      = Math.max(0.55, 1.35 - dist * 0.28)
      const opacity    = dist > 2.4 ? 0 : dist > 1.6 ? 0.55 : 1
      // Darken side pieces — center (dist≈0) is full brightness, sides progressively dimmer
      const brightness = Math.max(0.35, 1 - dist * 0.38)

      el.style.transform = `translateX(${x.toFixed(1)}px) scale(${scale.toFixed(3)})`
      el.style.opacity   = opacity
      el.style.zIndex    = Math.round(20 - dist * 4)
      el.style.filter    = `brightness(${brightness.toFixed(2)})`
    })

    const newActive = ((Math.round(off) % n) + n) % n
    setActiveIndex(prev => prev === newActive ? prev : newActive)
  }, [])

  /* ── Wheel: only on carousel zone, page scrolls normally elsewhere ── */
  useEffect(() => {
    const zone = carouselZoneRef.current
    if (!zone) return
    const onWheel = (e) => {
      e.preventDefault()
      cancelAnimationFrame(animRef.current)
      velocityRef.current += e.deltaY * 0.0015
      const tick = () => {
        velocityRef.current *= 0.88
        applyOffset(offsetRef.current + velocityRef.current)
        if (Math.abs(velocityRef.current) > 0.001) {
          animRef.current = requestAnimationFrame(tick)
        } else {
          velocityRef.current = 0
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    zone.addEventListener('wheel', onWheel, { passive: false })
    return () => zone.removeEventListener('wheel', onWheel)
  }, [applyOffset])

  /* ── Drag (on carousel zone only) ───────────────────────────────── */
  const onPointerDown = useCallback((e) => {
    isDragging.current  = true
    lastXRef.current    = e.clientX
    velocityRef.current = 0
    cancelAnimationFrame(animRef.current)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    velocityRef.current = -dx / SLOT_W
    applyOffset(offsetRef.current - dx / SLOT_W)
  }, [applyOffset])

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const decel = () => {
      velocityRef.current *= 0.94
      applyOffset(offsetRef.current + velocityRef.current)
      if (Math.abs(velocityRef.current) > 0.001) {
        animRef.current = requestAnimationFrame(decel)
      } else {
        velocityRef.current = 0
      }
    }
    animRef.current = requestAnimationFrame(decel)
  }, [applyOffset])

  /* ── Init ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (artworks.length > 0) applyOffset(0)
  }, [artworks, applyOffset])

  const centerArt = artworks[activeIndex] ?? null

  return (
    <section id="gallery" className="gallery">
      {loading && <GalleryLoader />}

      <div className="museum-wall" ref={wallRef}>

        {/* ── Spotlight ── */}
        <div className="museum-spotlight" />

        {/* ── Carousel zone: intercepts scroll + drag, covers artwork strip ── */}
        <div
          className="museum-carousel-zone"
          ref={carouselZoneRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Strip: origin at zone centre, items positioned via JS */}
          <div className="museum-strip">
            {artworks.map((art, i) => {
              const isCenter = i === activeIndex
              const url      = getThumbnailUrl(art)
              const hasShop  = !!art.shopUrl

              return (
                <div
                  key={art.id}
                  className="museum-strip-item"
                  ref={el => { artEls.current[i] = el }}
                >
                  {/* Inner clip: contains artwork + hover overlay */}
                  <div className="museum-strip-inner">
                    {url
                      ? <img src={url} alt={art.title} className="museum-strip-img" draggable={false} />
                      : <div className="museum-strip-placeholder" />
                    }

                    {/* Hover overlay */}
                    <div className="museum-hover-overlay">
                      <span className="museum-hover-title">{art.title}</span>
                      {hasShop && (
                        <a
                          href={art.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="museum-hover-btn"
                          onPointerDown={e => e.stopPropagation()}
                        >
                          View in Shop
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Frame PNG — sits outside inner so it's not clipped */}
                  {isCenter && (
                    <img src="/frame.png" alt="" className="museum-frame-overlay" aria-hidden="true"
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>{/* .museum-carousel-zone */}

        {/* ── Buttons above the green strip ── */}
        <div className="museum-cta-row">
          <Link to="/collection" className="museum-cta-btn museum-cta-btn--grey">View Archives</Link>
          <Link to="/shop"       className="museum-cta-btn museum-cta-btn--green">View Shop</Link>
        </div>

        {/* ── Green baseboard ── */}
        <div className="museum-baseboard" />

      </div>{/* .museum-wall */}
    </section>
  )
}
