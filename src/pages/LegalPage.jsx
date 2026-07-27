import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import DOMPurify from 'dompurify'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { LEGAL_CONFIG, DEFAULT_LEGAL } from '../lib/legalDefaults'

// Enforce noopener noreferrer on every target="_blank" link in the sanitized HTML.
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'ul', 'ol', 'li', 'a', 'b', 'i', 'em', 'strong', 'br',
                 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

export default function LegalPage({ docKey }) {
  const config = LEGAL_CONFIG[docKey] ?? { title: 'Policy', desc: '' }
  const [body, setBody] = useState(null)   // null = loading
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.add('policy-page')
    return () => document.body.classList.remove('policy-page')
  }, [])

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'legal'))
      .then(snap => {
        const stored = snap.exists() ? snap.data()[docKey] : null
        setBody(stored || DEFAULT_LEGAL[docKey] || '')
      })
      .catch(() => setBody(DEFAULT_LEGAL[docKey] || ''))
      .finally(() => setLoaded(true))
  }, [docKey])

  return (
    <>
      <Helmet>
        <title>{`${config.title} — Art by Tvesa`}</title>
        <meta name="description" content={config.desc || `${config.title} — Art by Tvesa.`} />
      </Helmet>
      <Navbar />

      <main className="policy-main">
        <div className="policy-content">
          <h1 className="policy-title">{config.title}</h1>

          {!loaded ? (
            <p className="policy-loading">Loading…</p>
          ) : (
            <div
              className="policy-body"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(body || '', SANITIZE_CONFIG),
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
