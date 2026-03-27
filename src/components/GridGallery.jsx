// src/components/GridGallery.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useFetchArtworks } from "../hooks/useFetchArtworks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "./Gallery.css";

// ── Lightbox ──────────────────────────────────────────────
function Lightbox({ artwork, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    document.body.classList.add("gallery-active");

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      document.body.classList.remove("gallery-active");
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!artwork) return null;

  return (
    <div className="lightbox-backdrop" onClick={handleBackdrop}>
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {hasPrev && (
        <button className="lightbox-nav lightbox-nav--prev" onClick={onPrev}>
          ‹
        </button>
      )}

      <div className="lightbox-content">
        <img src={artwork.imageUrl} alt={artwork.title} className="lightbox-img" />

        <div className="lightbox-info">
          <h2 className="lightbox-title">{artwork.title}</h2>

          {artwork.category && (
            <span className="lightbox-category">{artwork.category}</span>
          )}

          {artwork.tags?.length > 0 && (
            <div className="lightbox-tags">
              {artwork.tags.map((tag) => (
                <span key={tag} className="lightbox-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasNext && (
        <button className="lightbox-nav lightbox-nav--next" onClick={onNext}>
          ›
        </button>
      )}
    </div>
  );
}

// ── Artwork Card ──────────────────────────────────────────
function ArtworkCard({ artwork, onClick }) {
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
    <div
      ref={cardRef}
      className="gallery-card"
      onClick={() => onClick(artwork)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(artwork)}
    >
      <div className="gallery-card__img-wrap">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="gallery-card__img"
          loading="lazy"
        />

        <div className="gallery-card__overlay">
          <span className="gallery-card__zoom-icon">⤢</span>
          <p className="gallery-card__title">{artwork.title}</p>

          {artwork.category && (
            <p className="gallery-card__category">{artwork.category}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function GridGallery() {
  const { artworks, loading, error } = useFetchArtworks();

  const [activeCategory, setActiveCategory] = useState("All");
  const [collectionText, setCollectionText] = useState({
    eyebrow: "The Gallery of Trying",
    heading: "The Collection",
    subheading: "A curated selection of original works — exploring colour, form & emotion.",
  });

  useEffect(() => {
    getDoc(doc(db, "siteContent", "collection"))
      .then(snap => { if (snap.exists()) setCollectionText(t => ({ ...t, ...snap.data() })) })
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const categories = [
    "All",
    ...Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))),
  ];

  const filtered = artworks.filter((a) => {
    const matchesCategory =
      activeCategory === "All" || a.category === activeCategory;

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !query ||
      a.title?.toLowerCase().includes(query) ||
      a.tags?.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const openLightbox = useCallback(
    (artwork) => {
      const idx = filtered.findIndex((a) => a.id === artwork.id);
      setLightboxIndex(idx);
    },
    [filtered]
  );

  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => setLightboxIndex((i) => Math.max(0, i - 1));
  const nextLightbox = () =>
    setLightboxIndex((i) => Math.min(filtered.length - 1, i + 1));

  if (error) {
    return (
      <section className="gallery-section">
        <p className="gallery-error">
          Could not load artworks. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <section className="gallery-section">

      {/* Header */}
      <div className="gallery-header">
        <p className="gallery-eyebrow">{collectionText.eyebrow}</p>
        <h1 className="gallery-heading">{collectionText.heading}</h1>
        <p className="gallery-subheading">{collectionText.subheading}</p>
      </div>

      {/* Controls (FIXED STRUCTURE) */}
      <div className="gallery-controls">

        {/* Search */}
        <div className="gallery-search-wrap">
          <input
            type="text"
            className="gallery-search"
            placeholder="Search by title or tag…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search artworks"
          />

          {searchQuery && (
            <button
              className="gallery-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="gallery-filters" role="tablist" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
            key={cat}
                className={`gallery-filter-btn${
                    activeCategory === cat ? " gallery-filter-btn--active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
                role="tab"                          // ADD BACK
                aria-selected={activeCategory === cat}  // ADD BACK
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

      {/* Content */}
      {loading ? (
        <div className="gallery-skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="gallery-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="gallery-empty">
          <p>No artworks found.</p>
          <button
            className="gallery-filter-btn"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="gallery-masonry">
          {filtered.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={openLightbox}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          artwork={filtered[lightboxIndex]}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < filtered.length - 1}
        />
      )}
    </section>
  );
}
