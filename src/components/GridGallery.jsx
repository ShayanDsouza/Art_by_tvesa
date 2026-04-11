// src/components/GridGallery.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useFetchArtworks } from "../hooks/useFetchArtworks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import GalleryLoader from "./GalleryLoader";
import "./Gallery.css";

function getThumbnailUrl(artwork) {
  const imgs = artwork.images
  if (imgs && imgs.length > 0) {
    return (imgs.find(img => img.isThumbnail) || imgs[0]).url
  }
  return artwork.imageUrl || ''
}

function getModalImages(art) {
  const imgs = art.images;
  if (imgs && imgs.length > 0) return imgs;
  if (art.imageUrl) return [{ url: art.imageUrl, isThumbnail: true }];
  return [];
}

// ── Rich Modal ────────────────────────────────────────────
function ArtworkModal({ artwork, onClose, onInquire }) {
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const modalImages = getModalImages(artwork);
  const modalImgCount = modalImages.length;
  const currentModalUrl = modalImages[modalImageIndex]?.url;

  const touchStartX = useRef(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 280);
  };

  const prevImage = (e) => { e.stopPropagation(); setModalImageIndex(i => Math.max(0, i - 1)); };
  const nextImage = (e) => { e.stopPropagation(); setModalImageIndex(i => Math.min(modalImgCount - 1, i + 1)); };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? setModalImageIndex(i => Math.min(modalImgCount - 1, i + 1)) : setModalImageIndex(i => Math.max(0, i - 1));
    touchStartX.current = null;
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") setModalImageIndex(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setModalImageIndex(i => Math.min(modalImgCount - 1, i + 1));
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [modalImgCount]);

  if (!artwork) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal-popup${isClosing ? " is-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Close" className="modal-popup-close" onClick={handleClose}>×</button>

        {/* Image panel */}
        <div className="modal-popup-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {currentModalUrl ? (
            <img src={currentModalUrl} alt={`${artwork.title} — image ${modalImageIndex + 1}`} draggable={false} key={currentModalUrl} />
          ) : (
            <div className="carousel-card-placeholder">{artwork.title}</div>
          )}

          {modalImgCount > 1 && (
            <>
              <button className="modal-img-arrow modal-img-arrow-left" onClick={prevImage} aria-label="Previous image">&#8249;</button>
              <button className="modal-img-arrow modal-img-arrow-right" onClick={nextImage} aria-label="Next image">&#8250;</button>
              <div className="modal-img-dots">
                {modalImages.map((_, i) => (
                  <button
                    key={i}
                    className={`modal-img-dot${i === modalImageIndex ? " active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setModalImageIndex(i); }}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details panel */}
        <div className="modal-popup-details">
          <span className="carousel-back-category">{artwork.category}</span>
          <h2 className="modal-popup-title">{artwork.title}</h2>
          {artwork.status === "sold" && <span className="carousel-back-sold">This piece has been sold</span>}
          {artwork.description && <p className="modal-popup-desc">{artwork.description}</p>}
          <div className="carousel-back-meta">
            {artwork.medium && (
              <div className="carousel-back-meta-row">
                <span className="carousel-back-label">Medium</span>
                <span className="carousel-back-value">{artwork.medium}</span>
              </div>
            )}
            <div className="carousel-back-meta-row">
              <span className="carousel-back-label">Category</span>
              <span className="carousel-back-value">{artwork.category}</span>
            </div>
            {artwork.size && (
              <div className="carousel-back-meta-row">
                <span className="carousel-back-label">Size</span>
                <span className="carousel-back-value">{artwork.size}</span>
              </div>
            )}
            <div className="carousel-back-meta-row">
              <span className="carousel-back-label">Status</span>
              <span className="carousel-back-value">{artwork.status === "sold" ? "Sold" : "Available"}</span>
            </div>
          </div>
          {artwork.status !== "sold" && (
            <button className="carousel-back-btn modal-popup-btn" onClick={onInquire}>
              Contact for Availability
            </button>
          )}
        </div>
      </div>
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
          src={getThumbnailUrl(artwork)}
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
  const [collectionText, setCollectionText] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "siteContent", "collection"))
      .then(snap => {
        setCollectionText(snap.exists() ? snap.data() : {
          eyebrow: "The Gallery of Trying",
          heading: "The Collection",
          subheading: "",
        })
      })
      .catch(() => {
        setCollectionText({ eyebrow: "The Gallery of Trying", heading: "The Collection", subheading: "" })
      });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArt, setSelectedArt] = useState(null);

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

  const openModal = useCallback((artwork) => setSelectedArt(artwork), []);
  const closeModal = () => setSelectedArt(null);

  const handleInquire = useCallback((artwork) => {
    closeModal();

    // Dispatch the artInquiry event so Contact pre-fills the message
    if (artwork) {
      window.dispatchEvent(new CustomEvent('artInquiry', {
        detail: { message: `Hi! I'm interested in "${artwork.title}". Could you please provide more information about availability and pricing?` }
      }));
    }

    // Always scroll to #contact on the current page
    const el = document.querySelector("#contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback: not on a page with #contact (shouldn't happen now)
      window.location.href = "/#contact";
    }
  }, []);

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
        {collectionText && <>
          <p className="gallery-eyebrow">{collectionText.eyebrow}</p>
          <h1 className="gallery-heading">{collectionText.heading}</h1>
          {collectionText.subheading && <p className="gallery-subheading">{collectionText.subheading}</p>}
        </>}
      </div>

      {/* Controls */}
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

      {/* Content */}
      {loading ? (
        <GalleryLoader />
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
              onClick={openModal}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedArt && (
        <ArtworkModal
          artwork={selectedArt}
          onClose={closeModal}
          onInquire={() => handleInquire(selectedArt)}
        />
      )}
    </section>
  );
}