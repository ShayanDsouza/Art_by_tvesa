import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import './ArtworkModal.css'

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'a', 'b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

function getPrimaryImageUrl(artwork) {
  const imgs = artwork?.images
  if (imgs && imgs.length > 0) {
    // Prefer a non-thumbnail (full-size) image for the detail view
    return (imgs.find(img => !img.isThumbnail) || imgs[0]).url
  }
  return artwork?.imageUrl || ''
}

const STATUS_LABELS = {
  available: 'Available',
  sold: 'Sold',
  not_for_sale: 'Not for sale',
}

export default function ArtworkModal({ artwork, onClose }) {
  // Lock body scroll + close on Escape while open
  useEffect(() => {
    if (!artwork) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [artwork, onClose])

  if (!artwork) return null

  const imageUrl = getPrimaryImageUrl(artwork)
  const statusLabel = STATUS_LABELS[artwork.status] || STATUS_LABELS.available
  const details = [
    ['Category', artwork.category],
    ['Medium', artwork.medium],
    ['Size', artwork.size],
    ['Status', statusLabel],
  ].filter(([, value]) => value)

  return (
    <div
      className="artwork-modal"
      role="dialog"
      aria-modal="true"
      aria-label={artwork.title}
      onClick={onClose}
    >
      <div className="artwork-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="artwork-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left: image */}
        <div className="artwork-modal__image-wrap">
          {imageUrl
            ? <img src={imageUrl} alt={artwork.title} className="artwork-modal__image" draggable={false} />
            : <div className="artwork-modal__image-placeholder" />
          }
        </div>

        {/* Right: details */}
        <div className="artwork-modal__info">
          <p className="artwork-modal__eyebrow">Art by Tvesa</p>
          <h2 className="artwork-modal__title">{artwork.title}</h2>

          {details.length > 0 && (
            <dl className="artwork-modal__meta">
              {details.map(([label, value]) => (
                <div className="artwork-modal__meta-row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {artwork.description && (
            <div
              className="artwork-modal__description"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(artwork.description, PURIFY_CONFIG),
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
