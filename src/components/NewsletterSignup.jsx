export default function NewsletterSignup() {
  return (
    <section className="newsletter-section">
      <h2 className="newsletter-title">Subscribe to our emails</h2>
      <p className="newsletter-sub">
        Be the first to know about new collections and exclusive offers.
      </p>
      <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
        <div className="newsletter-input-wrap">
          <input
            type="email"
            className="newsletter-input"
            placeholder="Email"
          />
          <button type="submit" className="newsletter-btn" aria-label="Subscribe">
            →
          </button>
        </div>
      </form>
    </section>
  )
}
