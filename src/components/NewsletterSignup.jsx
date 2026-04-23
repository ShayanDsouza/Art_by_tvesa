import { useState } from 'react'
import { subscribeToNewsletter } from '../lib/shopify'

export default function NewsletterSignup() {
  const [email, setEmail]       = useState('')
  const [status, setStatus]     = useState('idle') // idle | loading | success | already | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const result = await subscribeToNewsletter(email.trim())
      setStatus(result === 'already_subscribed' ? 'already' : 'success')
      setEmail('')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section className="newsletter-section">
      <h2 className="newsletter-title">Subscribe to our emails</h2>
      <p className="newsletter-sub">
        Be the first to know about new collections and exclusive offers.
      </p>

      {status === 'success' ? (
        <div className="newsletter-success">
          <p className="newsletter-success-title">Almost there!</p>
          <p className="newsletter-success-sub">We've sent you a confirmation email — click the link inside to complete your subscription.</p>
        </div>
      ) : status === 'already' ? (
        <div className="newsletter-success">
          <p className="newsletter-success-title">You're already on the list!</p>
          <p className="newsletter-success-sub">Stay tuned for new collections and exclusive offers.</p>
        </div>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="newsletter-input-wrap">
            <input
              type="email"
              className="newsletter-input"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="newsletter-btn"
              disabled={status === 'loading'}
              aria-label="Subscribe"
            >
              {status === 'loading' ? '…' : '→'}
            </button>
          </div>
          {status === 'error' && (
            <p className="newsletter-error">{errorMsg}</p>
          )}
        </form>
      )}
    </section>
  )
}
