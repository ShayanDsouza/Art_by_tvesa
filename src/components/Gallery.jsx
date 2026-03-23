import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

const fallbackArt = [
  { id: '1', title: 'Artwork 1', description: 'A vibrant expression of color and emotion.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '2', title: 'Artwork 2', description: 'Delicate lines capturing a fleeting moment.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '3', title: 'Artwork 3', description: 'Bold strokes on a warm-toned surface.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '4', title: 'Artwork 4', description: 'A unique design brought to life on fabric.', medium: 'Tote Bag', category: 'Digital', status: 'available' },
  { id: '5', title: 'Artwork 5', description: 'Intricate details drawn with care.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '6', title: 'Artwork 6', description: 'Rich textures layered with meaning.', medium: 'Canvas', category: 'Painting', status: 'available' },
]

export default function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [selectedArt, setSelectedArt] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const carouselRef = useRef(null)
  const gallerySceneRef = useRef(null)
  const dragStartRef = useRef(null)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(0)
  const animFrameRef = useRef(null)
  const autoRotateRef = useRef(null)
  const closeTimeoutRef = useRef(null)
  const zoomRafRef = useRef(null)
  const currentScaleRef = useRef(0.38)

  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setArtworks(fallbackArt)
        } else {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
          setArtworks(docs)
        }
      }, () => setArtworks(fallbackArt))
      return unsubscribe
    } catch {
      setArtworks(fallbackArt)
    }
  }, [])

  // ── Scroll-driven zoom effect (LN-style punch-through) ────────────────────
  useEffect(() => {
    const scene = gallerySceneRef.current
    if (!scene) return
    const section = scene.parentElement

    const lerp = (a, b, t) => a + (b - a) * t

    // Expo-in easing: stays tiny, then BURSTS to fill (matches LN site feel)
    const easeOutExpo = t => t === 0 ? 0 : Math.pow(2, 10 * t - 10)

    let targetScale   = 0.38
    let targetRadius  = 28
    let targetOpacity = 0.40

    const tick = () => {
      const s = currentScaleRef.current
      currentScaleRef.current = lerp(s, targetScale, 0.16)

      const curScale   = currentScaleRef.current
      const curRadius  = lerp(parseFloat(scene.style.borderRadius) || 28, targetRadius,  0.16)
      const curOpacity = lerp(parseFloat(scene.style.opacity)      || 0.40, targetOpacity, 0.16)

      scene.style.transform    = `scale(${curScale.toFixed(4)})`
      scene.style.borderRadius = `${curRadius.toFixed(2)}px`
      scene.style.opacity      = curOpacity.toFixed(4)

      const stillMoving =
        Math.abs(curScale   - targetScale)   > 0.0003 ||
        Math.abs(curRadius  - targetRadius)  > 0.05   ||
        Math.abs(curOpacity - targetOpacity) > 0.002

      if (stillMoving) zoomRafRef.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const vh   = window.innerHeight

      let t = 0

      if (rect.top >= vh) {
        // Fully below viewport — closed
        t = 0
      } else if (rect.bottom <= 0) {
        // Fully above viewport — closed
        t = 0
      } else if (rect.top > 0) {
        // Entering from bottom:
        // rawT = 0 when section top is at viewport bottom (rect.top = vh)
        // rawT = 1 when section top reaches viewport top  (rect.top = 0)
        // Apply easeOutExpo so the zoom STARTS slow then RUSHES to fill
        const rawT = 1 - rect.top / vh
        t = easeOutExpo(Math.min(1, Math.max(0, rawT)))
      } else if (rect.bottom < vh) {
        // Exiting from top:
        // rawT = 1 when section bottom is at viewport bottom (rect.bottom = vh)
        // rawT = 0 when section bottom reaches viewport top  (rect.bottom = 0)
        const rawT = rect.bottom / vh
        t = easeOutExpo(Math.min(1, Math.max(0, rawT)))
      } else {
        // Section covers full viewport — fully open
        t = 1
      }

      // Scale  0.38 → 1.00  |  radius 28px → 0px  |  opacity 0.40 → 1.00
      targetScale   = 0.38 + t * 0.62
      targetRadius  = (1 - t) * 28
      targetOpacity = 0.40 + t * 0.60

      cancelAnimationFrame(zoomRafRef.current)
      zoomRafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(zoomRafRef.current)
    }
  }, [])

  // ── Body scroll lock when modal open ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = selectedArt ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedArt])

  // ── Auto-rotate carousel ──────────────────────────────────────────────────
  useEffect(() => {
    if (isDragging || selectedArt) return
    let lastTime = performance.now()
    const autoRotate = () => {
      const now = performance.now()
      const dt = now - lastTime
      lastTime = now
      rotationRef.current += 0.015 * (dt / 16)
      setRotation(rotationRef.current)
      autoRotateRef.current = requestAnimationFrame(autoRotate)
    }
    autoRotateRef.current = requestAnimationFrame(autoRotate)
    return () => cancelAnimationFrame(autoRotateRef.current)
  }, [isDragging, selectedArt])

  // ── Wheel handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const handleWheel = (e) => {
      e.preventDefault()
      rotationRef.current += e.deltaY * 0.1
      setRotation(rotationRef.current)
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePointerDown = useCallback((e) => {
    dragStartRef.current = e.clientX
    if (selectedArt) return
    setIsDragging(true)
    lastXRef.current = e.clientX
    velocityRef.current = 0
    cancelAnimationFrame(animFrameRef.current)
  }, [selectedArt])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    velocityRef.current = dx
    rotationRef.current -= dx * 0.25
    setRotation(rotationRef.current)
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    const decelerate = () => {
      velocityRef.current *= 0.94
      if (Math.abs(velocityRef.current) > 0.1) {
        rotationRef.current -= velocityRef.current * 0.25
        setRotation(rotationRef.current)
        animFrameRef.current = requestAnimationFrame(decelerate)
      }
    }
    animFrameRef.current = requestAnimationFrame(decelerate)
  }, [])

  const handleCardClick = (art, e, cardAngle) => {
    const startX = dragStartRef.current
    if (startX !== null && Math.abs(e.clientX - startX) > 8) return
    const totalAngle = ((rotationRef.current + cardAngle) % 360 + 360) % 360
    const isFrontFacing = totalAngle < 90 || totalAngle > 270
    if (!isFrontFacing) return
    setSelectedArt(art)
  }

  // ── Close timeout cleanup ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    if (closeTimeoutRef.current !== null) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedArt(null)
      setIsClosing(false)
      closeTimeoutRef.current = null
    }, 480)
  }

  const closeModal = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleInquire = (e) => {
    e.stopPropagation()
    const message = `Hi, I'm interested in "${selectedArt.title}". Could you share more details?`
    window.dispatchEvent(new CustomEvent('artInquiry', { detail: { message } }))
    handleClose()
    setTimeout(() => {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
    }, 520)
  }

  const count = artworks.length
  const angleStep = count > 0 ? 360 / count : 0
  const radius = Math.max(360, count * 80)

  return (
    <section id="gallery" className="gallery">

      {/* ── Zoom scene — everything inside scales on scroll ── */}
      <div className="gallery-scene" ref={gallerySceneRef}>
        <span className="section-overline">Gallery</span>
        <h2>Selected Works</h2>
        <p className="carousel-hint">Scroll or drag to explore &middot; Click a piece to see details</p>

        <div
          className="carousel-viewport"
          ref={carouselRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="carousel-ring"
            style={{ transform: `rotateY(${rotation}deg)` }}
          >
            {artworks.map((art, i) => {
              const angle = i * angleStep
              return (
                <div
                  key={art.id}
                  className="carousel-card"
                  style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleCardClick(art, e, angle)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (e.key !== 'Enter') e.preventDefault()
                      handleCardClick(art, e, angle)
                    }
                  }}
                >
                  <div className="carousel-face carousel-face-natural-back" />
                  <div className="carousel-face carousel-face-front">
                    {art.imageUrl ? (
                      <img src={art.imageUrl} alt={art.title} className="carousel-card-image" draggable={false} />
                    ) : (
                      <div className="carousel-card-placeholder">{art.title}</div>
                    )}
                    {art.status === 'sold' && <span className="carousel-sold-badge">Sold</span>}
                    <div className="carousel-card-label">
                      <span className="carousel-card-category">{art.category}</span>
                      <h3>{art.title}</h3>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="gallery-view-all">
          <a href="#gallery" className="btn btn-outline">View Full Collection</a>
        </div>
      </div>

      {/* ── Modal lives OUTSIDE gallery-scene so position:fixed is unaffected by scale ── */}
      {selectedArt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-popup${isClosing ? ' is-closing' : ''}`}>
            <button
              type="button"
              aria-label="Close"
              className="modal-popup-close"
              onClick={handleClose}
            >×</button>

            <div className="modal-popup-image">
              {selectedArt.imageUrl ? (
                <img src={selectedArt.imageUrl} alt={selectedArt.title} draggable={false} />
              ) : (
                <div className="carousel-card-placeholder">{selectedArt.title}</div>
              )}
            </div>

            <div className="modal-popup-details">
              <span className="carousel-back-category">{selectedArt.category}</span>
              <h2 className="modal-popup-title">{selectedArt.title}</h2>
              {selectedArt.status === 'sold' && <span className="carousel-back-sold">This piece has been sold</span>}
              <p className="modal-popup-desc">{selectedArt.description}</p>
              <div className="carousel-back-meta">
                <div className="carousel-back-meta-row">
                  <span className="carousel-back-label">Medium</span>
                  <span className="carousel-back-value">{selectedArt.medium}</span>
                </div>
                <div className="carousel-back-meta-row">
                  <span className="carousel-back-label">Category</span>
                  <span className="carousel-back-value">{selectedArt.category}</span>
                </div>
                <div className="carousel-back-meta-row">
                  <span className="carousel-back-label">Status</span>
                  <span className="carousel-back-value">{selectedArt.status === 'sold' ? 'Sold' : 'Available'}</span>
                </div>
              </div>
              {selectedArt.status !== 'sold' && (
                <button
                  className="carousel-back-btn modal-popup-btn"
                  onClick={handleInquire}
                >
                  Inquire About This Piece
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
