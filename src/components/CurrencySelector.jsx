import { useEffect, useRef, useState } from 'react'
import { useCurrency, regionFlagImgSrc } from '../contexts/CurrencyContext'

export default function CurrencySelector({ className = '' }) {
  const [regionOpen, setRegionOpen] = useState(false)
  const regionWrapRef = useRef(null)
  const { regionId, setRegionId, regions } = useCurrency()
  const currentRegion = regions.find((r) => r.id === regionId) || regions[0]

  useEffect(() => {
    const onDoc = (e) => {
      if (!regionWrapRef.current?.contains(e.target)) setRegionOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setRegionOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className={`navbar-region${regionOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`} ref={regionWrapRef}>
      <button
        type="button"
        className="navbar-region-trigger"
        onClick={() => setRegionOpen((o) => !o)}
        aria-expanded={regionOpen}
        aria-haspopup="listbox"
        aria-label={`Country and currency: ${currentRegion.name}, ${currentRegion.currency}`}
      >
        <img
          className="navbar-region-flag"
          src={regionFlagImgSrc(currentRegion.flagCode, 40)}
          alt=""
          width={20}
          height={15}
          decoding="async"
        />
        <span className="navbar-region-label-text">
          <span className="navbar-region-name">{currentRegion.name}</span>
          <span className="navbar-region-sep" aria-hidden="true">·</span>
          <span className="navbar-region-code">{currentRegion.currency}</span>
        </span>
        <span className="navbar-region-chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {regionOpen && (
        <ul className="navbar-region-menu" role="listbox">
          {regions.map((r) => (
            <li key={r.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={r.id === regionId}
                className={`navbar-region-item${r.id === regionId ? ' is-active' : ''}`}
                onClick={() => {
                  setRegionId(r.id)
                  setRegionOpen(false)
                }}
              >
                <img
                  className="navbar-region-flag"
                  src={regionFlagImgSrc(r.flagCode, 40)}
                  alt=""
                  width={20}
                  height={15}
                  decoding="async"
                />
                <span className="navbar-region-item-text">
                  <span className="navbar-region-name">{r.name}</span>
                  <span className="navbar-region-sep" aria-hidden="true">·</span>
                  <span className="navbar-region-code">{r.currency}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
