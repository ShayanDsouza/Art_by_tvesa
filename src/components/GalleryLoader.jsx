export default function GalleryLoader() {
  return (
    <div className="gallery-loader">
      <div className="gallery-loader-rings">
        {/* Outer arc — grape, clockwise */}
        <svg className="gallery-loader-arc gallery-loader-arc--outer" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" />
        </svg>
        {/* Inner arc — evergreen, counter-clockwise */}
        <svg className="gallery-loader-arc gallery-loader-arc--inner" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="13" />
        </svg>
      </div>
      <p className="gallery-loader-text">gathering works</p>
    </div>
  )
}
