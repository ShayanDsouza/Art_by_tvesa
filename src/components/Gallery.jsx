const placeholderArt = [
  { id: 1, title: 'Artwork 1', category: 'Painting' },
  { id: 2, title: 'Artwork 2', category: 'Sketch' },
  { id: 3, title: 'Artwork 3', category: 'Painting' },
  { id: 4, title: 'Artwork 4', category: 'Digital' },
  { id: 5, title: 'Artwork 5', category: 'Sketch' },
  { id: 6, title: 'Artwork 6', category: 'Painting' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {placeholderArt.map((art) => (
          <div key={art.id} className="gallery-item">
            <div className="gallery-placeholder">{art.title}</div>
            <div className="gallery-info">
              <h3>{art.title}</h3>
              <span className="gallery-category">{art.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
