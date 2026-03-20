export default function Contact() {
  return (
    <section id="contact" className="contact">
      <h2>Get in Touch</h2>
      <p className="contact-subtitle">
        Interested in a piece or want to collaborate? Drop a message!
      </p>
      <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows={5} required />
        <button type="submit" className="btn">Send Message</button>
      </form>
      <div className="social-links">
        <a href="#" aria-label="Instagram">Instagram</a>
        <a href="#" aria-label="Email">Email</a>
      </div>
    </section>
  )
}
