import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const DEFAULT_BIO = `Hi, I'm Tvesa, thanks for being here! I'm an aspiring Criminologist and part-time artist that works primarily with acrylic and oil paints. I also enjoy the occasional tattoo-style ink work, watercolour and digital messing around.

Each piece here is close to my heart, and is intended to evoke a feeling you can't quite pinpoint. I hope you leave with a little more whimsy than you came here with, and if you'd like to take anything with you, feel free to reach out!

If you are curious about my academic work, check out my <a href="https://www.linkedin.com/in/tvesa-medh/" target="_blank" rel="noopener noreferrer" class="about-inline-link">LinkedIn</a> and/or my publication(s).`

export default function About() {
  const [bio, setBio] = useState(DEFAULT_BIO)

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about'))
      .then(snap => { if (snap.exists() && snap.data().bio) setBio(snap.data().bio) })
      .catch(() => {})
  }, [])

  // Split by double newline into paragraphs
  const paragraphs = bio.split('\n\n').filter(Boolean)

  return (
    <section id="about" className="about">
      <div className="about-content">
        <div className="about-image">
          <img src="/meet_artist.jpg" alt="Tvesa Medh" className="about-photo" />
        </div>
        <div className="about-text">
          <span className="section-overline">Meet the Artist</span>
          <h2>Tvesa Medh</h2>
          {paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </div>
    </section>
  )
}
