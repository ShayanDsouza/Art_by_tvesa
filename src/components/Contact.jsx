import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { FaInstagram, FaPinterest } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'
import { db } from '../config/firebase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    let timeoutId

    const handler = (e) => {
      const message = e?.detail && typeof e.detail === 'object' ? e.detail.message : undefined
      if (typeof message !== 'string') return
      setForm(prev => ({ ...prev, message }))
      timeoutId = window.setTimeout(() => {
        document.querySelector('#contact textarea')?.focus()
      }, 100)
    }

    window.addEventListener('artInquiry', handler)

    return () => {
      window.removeEventListener('artInquiry', handler)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        read: false,
        createdAt: serverTimestamp(),
      })
      setForm({ name: '', email: '', message: '' })
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      console.error('Error sending message:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">

        {/* ── Left: heading + socials ── */}
        <div className="contact-left">
          <span className="contact-overline">Say Hello</span>
          <h2 className="contact-heading">Get in Touch</h2>
          <p className="contact-subtitle">
            Interested in a piece, a commission, or just want to chat about art? I'd love to hear from you.
          </p>
          <div className="contact-socials">
            <a href="https://www.instagram.com/artbytvesa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://in.pinterest.com/artbytvesa/my-art/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><FaPinterest /></a>
            <a href="mailto:artbytvesa@gmail.com" aria-label="Email"><HiOutlineMail /></a>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="contact-right">
          {status === 'sent' && (
            <div className="contact-success">Message sent! I'll get back to you soon.</div>
          )}
          {status === 'error' && (
            <div className="contact-error">Something went wrong. Please try again.</div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Your Message"
              rows={6}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              required
            />
            <button type="submit" className="contact-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}
