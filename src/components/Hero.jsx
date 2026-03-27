import { useEffect, useState, useRef } from 'react'
import HeroCanvas from './HeroCanvas'

export default function Hero() {
  const [visible, setVisible] = useState(false)
  const icarusRef = useRef(null)

  // Entrance: reveal after short delay
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Scroll: float Icarus upward & fade like a raindrop lifting
  useEffect(() => {
    const wrap = icarusRef.current
    if (!wrap) return

    const onScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight

      if (scrollY === 0) {
        wrap.style.transform = ''
        wrap.style.opacity = ''
        return
      }

      // progress 0 → 1 over first 80% of the viewport height (slower departure)
      const progress = Math.min(1, scrollY / (vh * 0.80))

      // Cubic ease-in: very slow start, then gradually accelerates upward
      const eased = progress * progress * progress
      const translateY = -(eased * 200)          // up to -200px
      const opacity    = Math.max(0, 1 - progress * 1.1)

      wrap.style.transform = `translateY(${translateY.toFixed(2)}px)`
      wrap.style.opacity   = opacity.toFixed(4)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="hero" className="hero">
      <HeroCanvas />
      <div className="hero-bg-pattern"></div>

      <div className={`hero-content ${visible ? 'hero-visible' : ''}`}>
        <span className="hero-overline">Welcome to my studio</span>
        <h1>Art by Tvesa</h1>
        <div className="hero-divider"></div>
        <a
          href="#gallery"
          className="btn btn-outline"
          onClick={e => {
            e.preventDefault()
            const gallery = document.querySelector('#gallery')
            const wrapper = document.querySelector('.gallery-scroll-wrapper')
            if (gallery && wrapper) {
              const scrollableHeight = wrapper.offsetHeight - window.innerHeight
              window.scrollTo({ top: gallery.offsetTop + 0.64 * scrollableHeight, behavior: 'smooth' })
            }
          }}
        >View Gallery</a>
      </div>

      <div
        ref={icarusRef}
        className={`hero-image-wrap ${visible ? 'hero-visible' : ''}`}
      >
        <img
          src="/icarus.PNG"
          alt="Icarus — Art by Tvesa"
          className="hero-icarus"
          draggable={false}
        />
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="hero-scroll-line"></div>
      </div>
    </section>
  )
}
