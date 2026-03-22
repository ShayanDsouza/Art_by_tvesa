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
  const dragStartRef = useRef(null)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const lastXRef = useRef(0)
  const animFrameRef = useRef(null)
  const autoRotateRef = useRef(null)
  const closeTimeoutRef = useRef(null)

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
      }, () => {
        setArtworks(fallbackArt)
      })
      return unsubscribe
    } catch {
      setArtworks(fallbackArt)
    }
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedArt ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedArt])

  // Auto-rotate slowly when not dragging and no modal open
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

  // Wheel handler
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
    e.currentTarget.setPointerCapture(e.pointerId)
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

  const handlePointerUp = useCallback((e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
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
    // Only open modal for front-facing cards
    const totalAngle = ((rotationRef.current + cardAngle) % 360 + 360) % 360
    const isFrontFacing = totalAngle < 90 || totalAngle > 270
    if (!isFrontFacing) return
    setSelectedArt(art)
  }

  // Cleanup closeTimeout on unmount
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
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current)
    }
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
      <span className="section-overline">Collection</span>
      <h2>The Gallery</h2>
      <p className="section-subtitle">Each piece is a window into a world of imagination</p>
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
                {/* White canvas — shows when card faces away */}
                <div className="carousel-face carousel-face-natural-back" />

                {/* Front face — artwork image */}
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

      {/* Large popup modal with flip-in animation */}
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
