import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Link } from "react-router-dom";
import GalleryLoader from './GalleryLoader'

const fallbackArt = [
  { id: '1', title: 'Artwork 1', description: 'A vibrant expression of color and emotion.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '2', title: 'Artwork 2', description: 'Delicate lines capturing a fleeting moment.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '3', title: 'Artwork 3', description: 'Bold strokes on a warm-toned surface.', medium: 'Canvas', category: 'Painting', status: 'available' },
  { id: '4', title: 'Artwork 4', description: 'A unique design brought to life on fabric.', medium: 'Tote Bag', category: 'Digital', status: 'available' },
  { id: '5', title: 'Artwork 5', description: 'Intricate details drawn with care.', medium: 'Paper', category: 'Sketch', status: 'available' },
  { id: '6', title: 'Artwork 6', description: 'Rich textures layered with meaning.', medium: 'Canvas', category: 'Painting', status: 'available' },
]

function getThumbnailUrl(art) {
  const imgs = art.images
  if (imgs && imgs.length > 0) {
    return (imgs.find(img => img.isThumbnail) || imgs[0]).url
  }
  return art.imageUrl || ''
}

export default function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [imageSizes, setImageSizes] = useState({})
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
  const zoomRafRef = useRef(null)
  const currentScaleRef = useRef(0.35)
  const currentRadiusRef = useRef(28)
  const currentOpacityRef = useRef(0.1)

  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setArtworks(fallbackArt)
        } else {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
          const featured = docs.filter(a => a.featured).slice(0, 8)
          setArtworks(featured.length > 0 ? featured : docs.slice(0, 8))
        }
        setLoading(false)
      }, () => { setArtworks(fallbackArt); setLoading(false) })
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

      targetScale   = 0.35 + carouselT * 0.50
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

  // ── Auto-rotate carousel ──────────────────────────────────────────────────
  useEffect(() => {
    if (isDragging) return
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
  }, [isDragging])

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
    setIsDragging(true)
    lastXRef.current = e.clientX
    velocityRef.current = 0
    cancelAnimationFrame(animFrameRef.current)
  }, [])

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

  // Measure image dimensions
  useEffect(() => {
    if (!artworks.length) return
    artworks.forEach(art => {
      const thumbUrl = getThumbnailUrl(art)
      if (!thumbUrl) return
      const img = new window.Image()
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setImageSizes(prev => prev[art.id] ? prev : { ...prev, [art.id]: img.naturalWidth / img.naturalHeight })
        }
      }
      img.src = thumbUrl
    })
  }, [artworks])

  const handleImageLoad = useCallback((e, artId) => {
    const { naturalWidth, naturalHeight } = e.target
    if (!naturalWidth || !naturalHeight) return
    setImageSizes(prev => prev[artId] ? prev : { ...prev, [artId]: naturalWidth / naturalHeight })
  }, [])

  // ── Responsive resize listener ────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const count = artworks.length
  const angleStep = count > 0 ? 360 / count : 0
  const radius = windowWidth <= 480
    ? Math.max(130, count * 28)
    : windowWidth <= 900
      ? Math.max(200, count * 42)
      : Math.max(360, Math.min(count * 80, 560))

  const cardHeight = windowWidth <= 480 ? 150 : windowWidth <= 900 ? 185 : 290

  return (
    <section id="gallery" className="gallery">

      <div className="gallery-scroll-wrapper" ref={galleryWrapperRef}>
        <div className="gallery-stage">

          <div className="gallery-header" ref={galleryHeaderRef}>
            <span className="section-overline">Gallery</span>
            <h2>Selected Works</h2>
            <p className="carousel-hint">Scroll or drag to explore &middot; Hover a piece to interact</p>
          </div>

          {loading && <GalleryLoader />}

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
                  const ratio = imageSizes[art.id] ?? 0.75
                  const cardW = Math.round(cardHeight * ratio)
                  const cardStyle = {
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    width: `${cardW}px`,
                    height: `${cardHeight}px`,
                    left: `${-Math.round(cardW / 2)}px`,
                    top: `${-Math.round(cardHeight / 2)}px`,
                  }

                  const thumbUrl = getThumbnailUrl(art)
                  const isAvailable = art.status === 'available' || !art.status

                  return (
                    <div
                      key={art.id}
                      className="carousel-card"
                      style={cardStyle}
                    >
                      <div className="carousel-face carousel-face-natural-back" />
                      <div className="carousel-face carousel-face-front">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={art.title} className="carousel-card-image" draggable={false} onLoad={(e) => handleImageLoad(e, art.id)} />
                        ) : (
                          <div className="carousel-card-placeholder">{art.title}</div>
                        )}
                        <div className="carousel-card-label">
                          <span className="carousel-card-category">{art.category}</span>
                          <h3>{art.title}</h3>
                        </div>

                        {/* Hover overlay */}
                        <div className="carousel-card-hover-overlay">
                          {isAvailable && art.shopUrl ? (
                            <a
                              href={art.shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="carousel-hover-shop-btn"
                              onPointerDown={e => e.stopPropagation()}
                            >
                              View in Shop
                            </a>
                          ) : !isAvailable ? (
                            <span className="carousel-hover-status">
                              {art.status === 'sold' ? 'Sold' : 'Not Available'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Buttons sit outside the zooming scene */}
          <div className="gallery-view-all">
            <Link to="/collection" className="btn btn-outline">
              View Archives
            </Link>
            <Link to="/shop" className="btn btn-outline btn-glitter">
              <span className="btn-glitter-shimmer" aria-hidden="true" />
              <span className="btn-glitter-label">View Shop</span>
            </Link>
          </div>

        </div>
      </div>

    </section>
  )
}
