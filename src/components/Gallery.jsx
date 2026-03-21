import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

function GalleryItem({ art, onClick, index }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`gallery-item gallery-item-${art.height || 'normal'} ${isVisible ? 'gallery-item-visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={() => onClick(art)}
    >
      {art.imageUrl ? (
        <img src={art.imageUrl} alt={art.title} className="gallery-image" />
      ) : (
        <div className="gallery-placeholder">{art.title}</div>
      )}
      {art.status === 'sold' && <span className="gallery-sold-badge">Sold</span>}
      <div className="gallery-overlay">
        <span className="gallery-overlay-category">{art.category}</span>
        <h3>{art.title}</h3>
        <span className="gallery-overlay-cta">View Details</span>
      </div>
    </div>
  )
}

// Fallback data when Firestore is empty or not configured
const fallbackArt = [
  { id: '1', title: 'Artwork 1', description: 'A vibrant expression of color and emotion.', medium: 'Canvas', category: 'Painting', height: 'tall', status: 'available' },
  { id: '2', title: 'Artwork 2', description: 'Delicate lines capturing a fleeting moment.', medium: 'Paper', category: 'Sketch', height: 'normal', status: 'available' },
  { id: '3', title: 'Artwork 3', description: 'Bold strokes on a warm-toned surface.', medium: 'Canvas', category: 'Painting', height: 'normal', status: 'available' },
  { id: '4', title: 'Artwork 4', description: 'A unique design brought to life on fabric.', medium: 'Tote Bag', category: 'Digital', height: 'tall', status: 'available' },
  { id: '5', title: 'Artwork 5', description: 'Intricate details drawn with care.', medium: 'Paper', category: 'Sketch', height: 'normal', status: 'available' },
  { id: '6', title: 'Artwork 6', description: 'Rich textures layered with meaning.', medium: 'Canvas', category: 'Painting', height: 'tall', status: 'available' },
]

export default function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [selectedArt, setSelectedArt] = useState(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    try {
      const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setArtworks(fallbackArt)
          setUseFallback(true)
        } else {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
          setArtworks(docs)
          setUseFallback(false)
        }
      }, () => {
        // Firestore error (not configured), use fallback
        setArtworks(fallbackArt)
        setUseFallback(true)
      })
      return unsubscribe
    } catch {
      setArtworks(fallbackArt)
      setUseFallback(true)
    }
  }, [])

  useEffect(() => {
    if (selectedArt) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedArt])

  const closeModal = (e) => {
    if (e.target === e.currentTarget) setSelectedArt(null)
  }

  return (
    <section id="gallery" className="gallery">
      <span className="section-overline">Collection</span>
      <h2>The Gallery</h2>
      <p className="section-subtitle">Each piece is a window into a world of imagination</p>

      <div className="gallery-masonry">
        {artworks.map((art, i) => (
          <GalleryItem key={art.id} art={art} onClick={setSelectedArt} index={i} />
        ))}
      </div>

      {selectedArt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal">
            <button className="modal-close" onClick={() => setSelectedArt(null)}>&times;</button>
            <div className="modal-content">
              <div className="modal-image">
                {selectedArt.imageUrl ? (
                  <img src={selectedArt.imageUrl} alt={selectedArt.title} className="modal-art-image" />
                ) : (
                  <div className="gallery-placeholder modal-placeholder">{selectedArt.title}</div>
                )}
              </div>
              <div className="modal-details">
                <span className="modal-category-tag">{selectedArt.category}</span>
                <h2>{selectedArt.title}</h2>
                {selectedArt.status === 'sold' && <span className="modal-sold-tag">This piece has been sold</span>}
                <p className="modal-description">{selectedArt.description}</p>
                <div className="modal-meta-group">
                  <div className="modal-meta">
                    <span className="modal-label">Medium</span>
                    <span className="modal-value">{selectedArt.medium}</span>
                  </div>
                  <div className="modal-meta">
                    <span className="modal-label">Category</span>
                    <span className="modal-value">{selectedArt.category}</span>
                  </div>
                  <div className="modal-meta">
                    <span className="modal-label">Status</span>
                    <span className="modal-value">{selectedArt.status === 'sold' ? 'Sold' : 'Available'}</span>
                  </div>
                </div>
                {selectedArt.status !== 'sold' && (
                  <a
                    href={`mailto:dsouza.shayan@gmail.com?subject=Inquiry about "${selectedArt.title}"&body=Hi, I'm interested in "${selectedArt.title}". Could you share more details?`}
                    className="btn modal-inquiry-btn"
                  >
                    Inquire About This Piece
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
