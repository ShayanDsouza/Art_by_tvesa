import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const DEFAULT_BIO = `Hi, I'm Tvesa, thanks for being here! I'm an aspiring Criminologist and part-time artist that works primarily with acrylic and oil paints. I also enjoy the occasional tattoo-style ink work, watercolour and digital messing around.

Each piece here is close to my heart, and is intended to evoke a feeling you can't quite pinpoint. I hope you leave with a little more whimsy than you came here with, and if you'd like to take anything with you, feel free to reach out!

If you are curious about my academic work, check out my <a href="https://www.linkedin.com/in/tvesa-medh/" target="_blank" rel="noopener noreferrer" class="about-inline-link">LinkedIn</a> and/or my publication(s).`

export default function AdminContent() {
  const [bio, setBio] = useState(DEFAULT_BIO)
  const [collection, setCollection] = useState({
    eyebrow: 'The Gallery of Trying',
    heading: 'The Collection',
    subheading: 'A curated selection of original works — exploring colour, form & emotion.',
  })
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about')).then(s => { if (s.exists() && s.data().bio) setBio(s.data().bio) })
    getDoc(doc(db, 'siteContent', 'collection')).then(s => { if (s.exists()) setCollection(c => ({ ...c, ...s.data() })) })
  }, [])

  const save = async (section) => {
    setSaving(section)
    try {
      if (section === 'about') await setDoc(doc(db, 'siteContent', 'about'), { bio })
      if (section === 'collection') await setDoc(doc(db, 'siteContent', 'collection'), collection)
      setSaved(section)
      setTimeout(() => setSaved(null), 2500)
    } catch (e) { console.error(e) }
    setSaving(null)
  }

  return (
    <div className="admin-content-editor">
      <h1 className="admin-page-title">Site Content</h1>

      {/* ── About / Bio ── */}
      <div className="admin-content-section">
        <h2 className="admin-content-heading">About — Artist Bio</h2>
        <p className="admin-content-hint">Separate paragraphs with a blank line. HTML links are supported.</p>
        <textarea
          className="admin-content-textarea"
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={10}
        />
        <button
          className="admin-content-save-btn"
          onClick={() => save('about')}
          disabled={saving === 'about'}
        >
          {saving === 'about' ? 'Saving…' : saved === 'about' ? '✓ Saved' : 'Save Bio'}
        </button>
      </div>

      {/* ── Collection Page ── */}
      <div className="admin-content-section">
        <h2 className="admin-content-heading">Full Collection Page — Header</h2>
        <div className="admin-form-group">
          <label>Eyebrow text</label>
          <input type="text" value={collection.eyebrow} onChange={e => setCollection(c => ({ ...c, eyebrow: e.target.value }))} />
        </div>
        <div className="admin-form-group">
          <label>Heading</label>
          <input type="text" value={collection.heading} onChange={e => setCollection(c => ({ ...c, heading: e.target.value }))} />
        </div>
        <div className="admin-form-group">
          <label>Subheading</label>
          <textarea rows={3} value={collection.subheading} onChange={e => setCollection(c => ({ ...c, subheading: e.target.value }))} />
        </div>
        <button
          className="admin-content-save-btn"
          onClick={() => save('collection')}
          disabled={saving === 'collection'}
        >
          {saving === 'collection' ? 'Saving…' : saved === 'collection' ? '✓ Saved' : 'Save Collection Text'}
        </button>
      </div>
    </div>
  )
}
