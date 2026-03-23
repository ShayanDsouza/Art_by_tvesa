import { useEffect, useState } from 'react'
import HeroCanvas from './HeroCanvas'

export default function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="hero" className="hero">
      <HeroCanvas />
      <div className="hero-bg-pattern"></div>
      <div className={`hero-content ${visible ? 'hero-visible' : ''}`}>
        <span className="hero-overline">Welcome to my studio</span>
        <h1>Art by Tvesa</h1>
        <div className="hero-divider"></div>
        <a href="#gallery" className="btn btn-outline">View Gallery</a>
      </div>
      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="hero-scroll-line"></div>
      </div>
    </section>
  )
}
