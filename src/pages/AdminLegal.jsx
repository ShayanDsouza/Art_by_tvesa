import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import DOMPurify from 'dompurify'
import { db } from '../config/firebase'
import { LEGAL_CONFIG, LEGAL_KEYS, DEFAULT_LEGAL } from '../lib/legalDefaults'

const PREVIEW_CONFIG = {
  ALLOWED_TAGS: ['p', 'ul', 'ol', 'li', 'a', 'b', 'i', 'em', 'strong', 'br',
                 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

export default function AdminLegal() {
  const [content, setContent] = useState({
    privacy: DEFAULT_LEGAL.privacy,
    terms: DEFAULT_LEGAL.terms,
    refunds: DEFAULT_LEGAL.refunds,
  })
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'legal')).then(s => {
      if (s.exists()) {
        const data = s.data()
        setContent(c => ({
          privacy: data.privacy ?? c.privacy,
          terms: data.terms ?? c.terms,
          refunds: data.refunds ?? c.refunds,
        }))
      }
    }).catch(() => {})
  }, [])

  const save = async (key) => {
    setSaving(key)
    try {
      await setDoc(doc(db, 'siteContent', 'legal'), { [key]: content[key] }, { merge: true })
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch (e) { console.error(e) }
    setSaving(null)
  }

  return (
    <div className="admin-content-editor">
      <h1 className="admin-page-title">Legal Pages</h1>
      <p className="admin-content-hint">
        Edit the Privacy, Terms, and Refunds pages. Basic HTML is supported
        (headings, paragraphs, lists, links). Changes go live immediately after saving.
      </p>

      {LEGAL_KEYS.map(key => (
        <div className="admin-content-section" key={key}>
          <h2 className="admin-content-heading">{LEGAL_CONFIG[key].title}</h2>
          <textarea
            className="admin-content-textarea"
            value={content[key]}
            onChange={e => setContent(c => ({ ...c, [key]: e.target.value }))}
            rows={14}
          />
          <button
            className="admin-content-save-btn"
            onClick={() => save(key)}
            disabled={saving === key}
          >
            {saving === key ? 'Saving…' : saved === key ? '✓ Saved' : `Save ${LEGAL_CONFIG[key].title}`}
          </button>

          <div className="admin-bio-preview">
            <p className="admin-bio-preview-label">Preview</p>
            <div
              className="admin-bio-preview-body policy-body"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content[key] || '', PREVIEW_CONFIG) }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
