export default function GalleryLoader() {
  return (
    <div className="gallery-loader">
      <svg className="gallery-loader-brush" viewBox="0 0 120 54" xmlns="http://www.w3.org/2000/svg">
        {/* Soft wide glow layer behind the main stroke */}
        <path className="gallery-loader-brush-glow" d="M 14,40 Q 60,6 106,40" />
        {/* Main brush stroke — draws itself left to right */}
        <path className="gallery-loader-brush-path" d="M 14,40 Q 60,6 106,40" />
      </svg>
      <p className="gallery-loader-text">gathering works</p>
    </div>
  )
}
