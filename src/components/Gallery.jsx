import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Link } from "react-router-dom";

const fallbackArt = [
  { id: '1', title: 'Artwork 1', description: 'A vibrant expression of color and emotion.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '2', title: 'Artwork 2', description: 'Delicate lines capturing a fleeting moment.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '3', title: 'Artwork 3', description: 'Bold strokes on a warm-toned surface.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '4', title: 'Artwork 4', description: 'A unique design brought to life on fabric.', medium: 'Tote Bag', category: 'Digital', status: 'available' },
  { id: '5', title: 'Artwork 5', description: 'Intricate details drawn with care.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '6', title: 'Artwork 6', description: 'Rich textures layered with meaning.', medium: 'Canvas', category: 'Painting', status: 'available' },
]

// Returns the thumbnail URL for a given artwork (starred, or first, or legacy imageUrl)
function getThumbnailUrl(art) {
  const imgs = art.images
  if (imgs && imgs.length > 0) {
    return (imgs.find(img => img.isThumbnail) || imgs[0]).url
  }
  return art.imageUrl || ''
}

// Returns ordered images array for modal (thumbnail first, then rest)
function getModalImages(art) {
  const imgs = art.images
  if (imgs && imgs.length > 0) return imgs
  if (art.imageUrl) return [{ url: art.imageUrl, isThumbnail: true }]
  return []
}

export default function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [selectedArt, setSelectedArt] = useState(null)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [isDragging, setIsDragging] = useState(false)
  const carouselRef = useRef(null)
  const gallerySceneRef = useRef(null)
  const galleryHeaderRef = useRef(null)
  const galleryWrapperRef = useRef(null)
  const dragStartRef = useRef(null)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(0)
  const animFrameRef = useRef(null)
  const autoRotateRef = useRef(null)
  const closeTimeoutRef = useRef(null)
  const zoomRafRef = useRef(null)
  const currentScaleRef = useRef(0.35)
  const currentRadiusRef = useRef(28)
  const currentOpacityRef = useRef(0.1)
  // Touch swipe for modal
  const modalTouchStartX = useRef(null)

  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setArtworks(fallbackArt)
        } else {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
          // Only show featured artworks in carousel; fallback to all if none starred
          const featured = docs.filter(a => a.featured)
          setArtworks(featured.length > 0 ? featured : docs)
        }
      }, () => setArtworks(fallbackArt))
      return unsubscribe
    } catch {
      setArtworks(fallbackArt)
    }
  }, [])

  // ── Sticky scroll-driven zoom effect ──────────────────────────────────────
  useEffect(() => {
    const scene = gallerySceneRef.current
    const header = galleryHeaderRef.current
    const wrapper = galleryWrapperRef.current
    if (!scene || !header || !wrapper) return

    const lerp = (a, b, t) => a + (b - a) * t
    const easeOutExpo = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)

    let targetScale   = 0.35
    let targetRadius  = 28
    let targetOpacity = 0.10

    const tick = () => {
      currentScaleRef.current   = lerp(currentScaleRef.current,   targetScale,   0.14)
      currentRadiusRef.current  = lerp(currentRadiusRef.current,  targetRadius,  0.14)
      currentOpacityRef.current = lerp(currentOpacityRef.current, targetOpacity, 0.14)

      scene.style.transform    = `scale(${currentScaleRef.current.toFixed(4)})`
      scene.style.borderRadius = `${currentRadiusRef.current.toFixed(2)}px`
      scene.style.opacity      = currentOpacityRef.current.toFixed(4)

      const stillMoving =
        Math.abs(currentScaleRef.current   - targetScale)   > 0.0003 ||
        Math.abs(currentRadiusRef.current  - targetRadius)  > 0.05   ||
        Math.abs(currentOpacityRef.current - targetOpacity) > 0.002

      if (stillMoving) zoomRafRef.current = requestAnimationFrame(tick)
    }

    let scrollRafPending = false

    const processScroll = () => {
      scrollRafPending = false
      const rect = wrapper.getBoundingClientRect()
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight
      if (scrollableHeight <= 0) return

      const scrolled = Math.max(0, -rect.top)
      const progress = Math.min(1, scrolled / scrollableHeight)

      // Phase 1: 0.00 → 0.18 — header fades, carousel stays tiny
      // Phase 2: 0.18 → 0.60 — carousel zooms IN
      // Phase 3: 0.60 → 0.72 — hold at full
      // Phase 4: 0.72 → 1.00 — carousel zooms OUT
      let carouselT
      if (progress < 0.18) {
        carouselT = 0
      } else if (progress < 0.60) {
        carouselT = easeOutExpo((progress - 0.18) / 0.42)
      } else if (progress < 0.72) {
        carouselT = 1
      } else {
        carouselT = easeOutExpo(1 - (progress - 0.72) / 0.28)
      }

      const headerOpacity = Math.max(0, 1 - progress / 0.14)
      header.style.opacity = headerOpacity.toFixed(4)
      header.style.pointerEvents = headerOpacity > 0.01 ? '' : 'none'

      targetScale   = 0.35 + carouselT * 0.50   // 0.35 → 0.85
      targetRadius  = (1 - carouselT) * 28
      targetOpacity = 0.10 + carouselT * 0.90

      if (carouselT > 0.55) {
        document.body.classList.add('gallery-active')
      } else {
        document.body.classList.remove('gallery-active')
      }

      cancelAnimationFrame(zoomRafRef.current)
      zoomRafRef.current = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      if (!scrollRafPending) {
        scrollRafPending = true
        requestAnimationFrame(processScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    processScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(zoomRafRef.current)
      document.body.classList.remove('gallery-active')
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
    setModalImageIndex(0)
  }

  // ── Responsive resize listener ────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
      setModalImageIndex(0)
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

  // ── Modal image navigation ────────────────────────────────────────────────
  const modalImages = selectedArt ? getModalImages(selectedArt) : []
  const modalImgCount = modalImages.length

  const prevModalImage = (e) => {
    e.stopPropagation()
    setModalImageIndex(i => (i - 1 + modalImgCount) % modalImgCount)
  }
  const nextModalImage = (e) => {
    e.stopPropagation()
    setModalImageIndex(i => (i + 1) % modalImgCount)
  }

  // Touch swipe support for modal images
  const handleModalTouchStart = (e) => { modalTouchStartX.current = e.touches[0].clientX }
  const handleModalTouchEnd = (e) => {
    if (modalTouchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - modalTouchStartX.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) setModalImageIndex(i => (i + 1) % modalImgCount)
      else setModalImageIndex(i => (i - 1 + modalImgCount) % modalImgCount)
    }
    modalTouchStartX.current = null
  }

  const count = artworks.length
  const angleStep = count > 0 ? 360 / count : 0
  const radius = windowWidth <= 480
    ? Math.max(180, count * 45)
    : windowWidth <= 900
      ? Math.max(260, count * 62)
      : Math.max(360, count * 80)

  const tallCard = windowWidth <= 480
    ? { width: '100px', height: '150px', left: '60px' }
    : windowWidth <= 900
      ? { width: '130px', height: '185px', left: '70px' }
      : { width: '210px', height: '290px', left: '115px' }

  const currentModalUrl = modalImages[modalImageIndex]?.url

  return (
    <section id="gallery" className="gallery">

      <div className="gallery-scroll-wrapper" ref={galleryWrapperRef}>
        <div className="gallery-stage">

          <div className="gallery-header" ref={galleryHeaderRef}>
            <span className="section-overline">Gallery</span>
            <h2>Selected Works</h2>
            <p className="carousel-hint">Scroll or drag to explore &middot; Click a piece to see details</p>
          </div>

          <div className="gallery-carousel-scene" ref={gallerySceneRef}>
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
                  const isTall = art.height === 'tall'
                  const cardStyle = isTall
                    ? {
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        width: tallCard.width,
                        height: tallCard.height,
                        left: tallCard.left,
                        top: '0',
                      }
                    : { transform: `rotateY(${angle}deg) translateZ(${radius}px)` }

                  const thumbUrl = getThumbnailUrl(art)

                  return (
                    <div
                      key={art.id}
                      className={`carousel-card${isTall ? ' carousel-card-tall' : ''}`}
                      style={cardStyle}
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
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={art.title} className="carousel-card-image" draggable={false} />
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
          </div>

          {/* "View Full Collection" sits outside the zooming scene */}
          <div className="gallery-view-all">
            <Link to="/collection" className="btn btn-outline btn-glitter">
              <span className="btn-glitter-shimmer" aria-hidden="true" />
              <span className="btn-glitter-label">View Full Collection</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ── Modal lives OUTSIDE all transforms ── */}
      {selectedArt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-popup${isClosing ? ' is-closing' : ''}`}>
            <button
              type="button"
              aria-label="Close"
              className="modal-popup-close"
              onClick={handleClose}
            >×</button>

            {/* Image panel with arrows */}
            <div
              className="modal-popup-image"
              onTouchStart={handleModalTouchStart}
              onTouchEnd={handleModalTouchEnd}
            >
              {currentModalUrl ? (
                <img
                  src={currentModalUrl}
                  alt={`${selectedArt.title} — image ${modalImageIndex + 1}`}
                  draggable={false}
                  key={currentModalUrl}
                />
              ) : (
                <div className="carousel-card-placeholder">{selectedArt.title}</div>
              )}

              {/* Left / right arrows — only shown when multiple images */}
              {modalImgCount > 1 && (
                <>
                  <button
                    className="modal-img-arrow modal-img-arrow-left"
                    onClick={prevModalImage}
                    aria-label="Previous image"
                  >&#8249;</button>
                  <button
                    className="modal-img-arrow modal-img-arrow-right"
                    onClick={nextModalImage}
                    aria-label="Next image"
                  >&#8250;</button>

                  {/* Dot indicators */}
                  <div className="modal-img-dots">
                    {modalImages.map((_, i) => (
                      <button
                        key={i}
                        className={`modal-img-dot${i === modalImageIndex ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setModalImageIndex(i) }}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
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
                {selectedArt.size && (
                  <div className="carousel-back-meta-row">
                    <span className="carousel-back-label">Size</span>
                    <span className="carousel-back-value">{selectedArt.size}</span>
                  </div>
                )}
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
                  Contact for Availability
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
