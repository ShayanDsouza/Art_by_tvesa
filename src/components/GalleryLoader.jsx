export default function GalleryLoader() {
  return (
    <div className="gallery-loader">
      <svg className="gallery-loader-brush" viewBox="0 0 80 80">
        <defs>
          {/* Blurry filter for the watercolour bleed layer */}
          <filter id="wc-bleed" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
        </defs>

        {/* Wide, blurry spread — the watercolour wet-edge glow */}
        <circle
          className="gallery-loader-spread"
          cx="40" cy="40" r="28"
          pathLength="100"
          filter="url(#wc-bleed)"
        />

        {/* Main thick brush stroke on top */}
        <circle
          className="gallery-loader-stroke"
          cx="40" cy="40" r="28"
          pathLength="100"
        />
      </svg>
      <p className="gallery-loader-text">gathering works</p>
    </div>
  )
}
