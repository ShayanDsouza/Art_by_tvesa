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

const ITEM_W    = 260   // px — must match .museum-strip-item width in CSS
const EQUAL_GAP = 36    // px gap between edges of adjacent artworks
const DRAG_SLOT = 300   // px of drag = 1 slot (sensitivity)

/* Scale at a given distance from centre — mirrors applyOffset logic */
function scaleAt(dist) {
  return Math.max(0.55, 1.35 - dist * 0.28)
}

/* Precompute equal-gap x-positions for slot 0, 1, 2, … */
const MAX_SLOTS = 20
const slotPositions = (() => {
  const pos = [0]
  for (let k = 1; k < MAX_SLOTS; k++) {
    pos.push(
      pos[k - 1] +
      scaleAt(k - 1) * ITEM_W / 2 +
      EQUAL_GAP +
      scaleAt(k) * ITEM_W / 2
    )
  }
  return pos
})()

/* Convert fractional relative position → pixel x with equal edge gaps */
function xFromRel(rel) {
  const sign   = rel >= 0 ? 1 : -1
  const absRel = Math.abs(rel)
  const lo     = Math.floor(absRel)
  const t      = absRel - lo
  const xLo    = slotPositions[Math.min(lo,     MAX_SLOTS - 1)]
  const xHi    = slotPositions[Math.min(lo + 1, MAX_SLOTS - 1)]
  return sign * (xLo + t * (xHi - xLo))
}

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
  const resumeTimerRef  = useRef(null)   // setTimeout ID that re-enables auto-rotate
  const userActiveRef   = useRef(false)  // true while user is interacting

  /* ── Firebase ─────────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsub = onSnapshot(q, snap => {
        if (snap.empty) { setArtworks(fallbackArt); setLoading(false); return }
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        const featured = docs.filter(a => a.featured).slice(0, 11)
        const list = featured.length > 0 ? featured : docs.slice(0, 11)
        setArtworks(list)
        setLoading(false)
        // Preload all images immediately so fast drags never show a blank frame
        list.forEach(art => {
          const url = getThumbnailUrl(art)
          if (url) { const img = new Image(); img.src = url }
        })
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
      const x    = xFromRel(rel)
      const dist = Math.abs(rel)
      const scale      = scaleAt(dist)
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

  /* ── Snap centre item to exact integer offset ────────────────────── */
  const snapToNearest = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    const target = Math.round(offsetRef.current)
    const snap = () => {
      const diff = target - offsetRef.current
      if (Math.abs(diff) < 0.001) {
        applyOffset(target)
        return
      }
      applyOffset(offsetRef.current + diff * 0.12)
      animRef.current = requestAnimationFrame(snap)
    }
    animRef.current = requestAnimationFrame(snap)
  }, [applyOffset])

  /* ── Pause auto-rotate on user interaction, resume after 3 s ─────── */
  const pauseAutoRotate = useCallback(() => {
    userActiveRef.current = true
    clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      userActiveRef.current = false
    }, 3000)
  }, [])

  /* ── Wheel: only on carousel zone, page scrolls normally elsewhere ── */
  useEffect(() => {
    const zone = carouselZoneRef.current
    if (!zone) return
    const onWheel = (e) => {
      e.preventDefault()
      pauseAutoRotate()
      cancelAnimationFrame(animRef.current)
      velocityRef.current += e.deltaY * 0.0015
      const tick = () => {
        velocityRef.current *= 0.88
        applyOffset(offsetRef.current + velocityRef.current)
        if (Math.abs(velocityRef.current) > 0.001) {
          animRef.current = requestAnimationFrame(tick)
        } else {
          velocityRef.current = 0
          snapToNearest()
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    zone.addEventListener('wheel', onWheel, { passive: false })
    return () => zone.removeEventListener('wheel', onWheel)
  }, [applyOffset, snapToNearest, pauseAutoRotate])

  /* ── Drag (on carousel zone only) ───────────────────────────────── */
  const onPointerDown = useCallback((e) => {
    isDragging.current  = true
    lastXRef.current    = e.clientX
    velocityRef.current = 0
    pauseAutoRotate()
    cancelAnimationFrame(animRef.current)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [pauseAutoRotate])

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    velocityRef.current = -dx / DRAG_SLOT
    applyOffset(offsetRef.current - dx / DRAG_SLOT)
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
        snapToNearest()
      }
    }
    animRef.current = requestAnimationFrame(decel)
  }, [applyOffset, snapToNearest])

  /* ── Auto-rotate: slow continuous drift, pauses on interaction ────── */
  useEffect(() => {
    if (artworks.length === 0) return
    const AUTO_SPEED = 0.0004   // slots per frame — very slow
    let rafId
    const tick = () => {
      if (!userActiveRef.current && !isDragging.current) {
        applyOffset(offsetRef.current + AUTO_SPEED)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(resumeTimerRef.current)
    }
  }, [artworks, applyOffset])

  /* ── Init ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (artworks.length > 0) applyOffset(0)
  }, [artworks, applyOffset])

  const centerArt = artworks[activeIndex] ?? null

  return (
    <section id="gallery" className="gallery">
      {loading && <GalleryLoader className="gallery-loader--overlay" />}

      {/* ── Light fixture: original (desktop) / alternate (mobile) ── */}
      <img
        src="/light fixture.png"
        alt=""
        className="museum-light-fixture museum-light-fixture--orig"
        aria-hidden="true"
        draggable={false}
      />
      <img
        src="/alt light fixture.png"
        alt=""
        className="museum-light-fixture museum-light-fixture--alt"
        aria-hidden="true"
        draggable={false}
      />

      <div className="museum-wall" ref={wallRef}>

        {/* ── Spotlight (disabled) ── */}
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
                      ? <img src={url} alt={art.title} className="museum-strip-img" draggable={false} loading="eager" fetchpriority="high" />
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
          <Link to="/archives" className="museum-cta-btn museum-cta-btn--grey">View Archives</Link>
          <a href="https://shop.artbytvesa.com" className="museum-cta-btn museum-cta-btn--green">View Shop</a>
        </div>

        {/* ── Green baseboard ── */}
        <div className="museum-baseboard" />

      </div>{/* .museum-wall */}
    </section>
  )
}
