// src/components/GridGallery.jsx

import { useState, useEffect, useRef } from "react";
import { useFetchArtworks } from "../hooks/useFetchArtworks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import GalleryLoader from "./GalleryLoader";
import ArtworkModal from "./ArtworkModal";
import "./Gallery.css";

function getThumbnailUrl(artwork) {
  const imgs = artwork.images
  if (imgs && imgs.length > 0) {
    return (imgs.find(img => img.isThumbnail) || imgs[0]).url
  }
  return artwork.imageUrl || ''
}

// ── Artwork Card ──────────────────────────────────────────
function ArtworkCard({ artwork, onOpen }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("gallery-card--visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      className="gallery-card"
      onClick={() => onOpen(artwork)}
      aria-label={`View details for ${artwork.title}`}
    >
      <div className="gallery-card__img-wrap">
        <img
          src={getThumbnailUrl(artwork)}
          alt={artwork.title}
          className="gallery-card__img"
          loading="lazy"
        />

        <div className="gallery-card__overlay">
          <p className="gallery-card__title">{artwork.title}</p>
          <span className="gallery-hover-shop-btn">View Details</span>
        </div>
      </div>
    </button>
  );
}

// ── Layout toggle icons ───────────────────────────────────
function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7" height="10" rx="1.5" fill="currentColor"/>
      <rect x="10" y="1" width="7" height="6" rx="1.5" fill="currentColor"/>
      <rect x="1" y="13" width="7" height="4" rx="1.5" fill="currentColor"/>
      <rect x="10" y="9" width="7" height="8" rx="1.5" fill="currentColor"/>
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor"/>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────
export default function GridGallery() {
  const { artworks, loading, error } = useFetchArtworks();

  const [activeCategory, setActiveCategory] = useState("All");
  const [layout, setLayout] = useState("pinterest");
  const [collectionText, setCollectionText] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "siteContent", "collection"))
      .then(snap => {
        const data = snap.exists() ? snap.data() : { eyebrow: "The Gallery of Trying", heading: "Gallery", subheading: "" }
        // Migrate old heading values
        if (data.heading === 'The Collection' || data.heading === 'Archives') data.heading = 'Gallery'
        setCollectionText(data)
      })
      .catch(() => {
        setCollectionText({ eyebrow: "The Gallery of Trying", heading: "Gallery", subheading: "" })
      });
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))),
  ];

  const filtered = artworks.filter((a) => {
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      a.title?.toLowerCase().includes(query) ||
      a.tags?.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  if (error) {
    return (
      <section className="gallery-section">
        <p className="gallery-error">Could not load artworks. Please try again later.</p>
      </section>
    );
  }

  return (
    <section className="gallery-section">

      {/* Header */}
      <div className="gallery-header">
        {collectionText && <>
          <p className="gallery-eyebrow">{collectionText.eyebrow}</p>
          <h2 className="gallery-heading">{collectionText.heading}</h2>
          {collectionText.subheading && <p className="gallery-subheading">{collectionText.subheading}</p>}
        </>}
      </div>

      {/* Controls */}
      <div className="gallery-controls">
        <div className="gallery-search-wrap">
          <input
            type="text"
            className="gallery-search"
            placeholder="Search by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search artworks"
          />
          {searchQuery && (
            <button className="gallery-search-clear" onClick={() => setSearchQuery("")}>×</button>
          )}
        </div>

        <div className="gallery-filters" role="tablist" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-filter-btn${activeCategory === cat ? " gallery-filter-btn--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="gallery-count">
          {filtered.length} {filtered.length === 1 ? "work" : "works"}
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </p>
      )}

      {/* Layout Toggle */}
      <div className="layout-toggle" role="group" aria-label="Toggle gallery layout">
        <button
          className={`layout-toggle-btn${layout === "pinterest" ? " layout-toggle-btn--active" : ""}`}
          onClick={() => setLayout("pinterest")}
          aria-pressed={layout === "pinterest"}
          title="Masonry layout"
        >
          <PinterestIcon />
          <span>Masonry</span>
        </button>
        <button
          className={`layout-toggle-btn${layout === "grid" ? " layout-toggle-btn--active" : ""}`}
          onClick={() => setLayout("grid")}
          aria-pressed={layout === "grid"}
          title="Grid layout"
        >
          <GridIcon />
          <span>Grid</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <GalleryLoader />
      ) : filtered.length === 0 ? (
        <div className="gallery-empty">
          <p>No artworks found.</p>
          <button
            className="gallery-filter-btn"
            onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={`gallery-masonry${layout === "grid" ? " gallery-masonry--grid" : ""}`}>
          {filtered.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} onOpen={setSelectedArtwork} />
          ))}
        </div>
      )}

      <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />

    </section>
  );
}
