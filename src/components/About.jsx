import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import DOMPurify from 'dompurify'
import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { db } from '../config/firebase'

// Allow only safe inline formatting; strip scripts/iframes/event-handlers.
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

function sanitizeBio(html) {
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}

const DEFAULT_BIO = `Hi, I'm Tvesa, thanks for being here! I'm an aspiring Criminologist and part-time artist that works primarily with acrylic and oil paints. I also enjoy the occasional tattoo-style ink work, watercolour and digital messing around.

Each piece here is close to my heart, and is intended to evoke a feeling you can't quite pinpoint. I hope you leave with a little more whimsy than you came here with, and if you'd like to take anything with you, feel free to reach out!

If you are curious about my academic work, check out my <a href="https://www.linkedin.com/in/tvesa-medh/" target="_blank" rel="noopener noreferrer" class="about-inline-link">LinkedIn</a> and/or my publication(s).`

export default function About() {
  // Start empty so the stale bundled photo / default text never flash before
  // the live Firestore content loads — only the newest content is ever shown.
  const [bio, setBio] = useState(null)
  const [artistImageUrl, setArtistImageUrl] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about'))
      .then(snap => {
        const data = snap.exists() ? snap.data() : {}
        setBio(data.bio || DEFAULT_BIO)
        setArtistImageUrl(data.artistImageUrl || null)
      })
      .catch(() => setBio(DEFAULT_BIO))
      .finally(() => setLoaded(true))
  }, [])

  const paragraphs = (bio || '').split('\n\n').filter(Boolean)

  return (
    <section id="about" className="about">
      <div className="about-content">
        <div className="about-image">
          {loaded && artistImageUrl && (
            <img src={artistImageUrl} alt="Tvesa Medh" className="about-photo" />
          )}
        </div>
        <div className="about-text">
          <span className="about-overline">Meet the Artist</span>
          <h2 className="about-name">Tvesa Medh</h2>
          {loaded && paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: sanitizeBio(p) }} />
          ))}
          <div className="about-socials">
            <a href="https://www.instagram.com/artbytvesa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://in.pinterest.com/artbytvesa/my-art/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <FaPinterest />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
