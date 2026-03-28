import { useEffect, useState, useRef } from 'react'
import HeroCanvas from './HeroCanvas'

export default function Hero() {
  const [phase, setPhase] = useState(0)
  // 0 = nothing, 1 = icarus, 2 = A, 3 = Gallery, 4 = of, 5 = Trying, 6 = content
  const icarusRef = useRef(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // icarus drops
      setTimeout(() => setPhase(2), 1100),  // A
      setTimeout(() => setPhase(3), 1500),  // Gallery
      setTimeout(() => setPhase(4), 1900),  // of
      setTimeout(() => setPhase(5), 2300),  // Trying
      setTimeout(() => setPhase(6), 2700),  // hero text + button
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Scroll: float Icarus upward & fade
  useEffect(() => {
    const wrap = icarusRef.current
    if (!wrap) return
    const onScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      if (scrollY === 0) { wrap.style.transform = ''; wrap.style.opacity = ''; return }
      const progress = Math.min(1, scrollY / (vh * 0.80))
      const eased = progress * progress * progress
      wrap.style.transform = `translateY(${-(eased * 200).toFixed(2)}px)`
      wrap.style.opacity = Math.max(0, 1 - progress * 1.1).toFixed(4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToGallery = (e) => {
    e.preventDefault()
    const gallery = document.querySelector('#gallery')
    const wrapper = document.querySelector('.gallery-scroll-wrapper')
    if (gallery && wrapper) {
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight
      window.scrollTo({ top: gallery.offsetTop + 0.64 * scrollableHeight, behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="hero">
      <HeroCanvas />
      <div className="hero-bg-pattern" />

      {/* Left: title + button */}
      <div className={`hero-content${phase >= 6 ? ' hero-visible' : ''}`}>
        <span className="hero-overline">Welcome to my studio</span>
        <h1>Art by Tvesa</h1>
        <div className="hero-divider" />
        <a href="#gallery" className="btn btn-outline" onClick={scrollToGallery}>
          View Gallery
        </a>
      </div>

      {/* Right: Icarus + floating word images */}
      <div ref={icarusRef} className="hero-composition">

        {/* Icarus drops first */}
        <img
          src="/icarus.png"
          alt="Icarus"
          className={`hc-icarus${phase >= 1 ? ' visible' : ''}`}
          draggable={false}
        />

        {/* A — top left */}
        <img
          src="/a-removebg-preview.png"
          alt="A"
          className={`hc-word hc-a${phase >= 2 ? ' visible' : ''}`}
          draggable={false}
        />

        {/* Gallery — centre right */}
        <img
          src="/gallery-removebg-preview.png"
          alt="Gallery"
          className={`hc-word hc-gallery${phase >= 3 ? ' visible' : ''}`}
          draggable={false}
        />

        {/* of — right */}
        <img
          src="/of-removebg-preview.png"
          alt="of"
          className={`hc-word hc-of${phase >= 4 ? ' visible' : ''}`}
          draggable={false}
        />

        {/* Trying — bottom left */}
        <img
          src="/trying-removebg-preview.png"
          alt="Trying"
          className={`hc-word hc-trying${phase >= 5 ? ' visible' : ''}`}
          draggable={false}
        />
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
