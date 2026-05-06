export default function GalleryLoader({ className = '' }) {
  return (
    <div className={`gallery-loader ${className}`.trim()}>
      <svg className="gallery-loader-brush" viewBox="0 0 80 80">
        <circle className="gallery-loader-stroke" cx="40" cy="40" r="28" pathLength="100" />
      </svg>
      <p className="gallery-loader-text">gathering works</p>
    </div>
  )
}
