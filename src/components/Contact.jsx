import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    const handler = (e) => {
      setForm(prev => ({ ...prev, message: e.detail.message }))
      setTimeout(() => document.querySelector('#contact textarea')?.focus(), 100)
    }
    window.addEventListener('artInquiry', handler)
    return () => window.removeEventListener('artInquiry', handler)
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
      <span className="section-overline">Say Hello</span>
      <h2>Get in Touch</h2>
      <p className="contact-subtitle">
        Interested in a piece or want to collaborate? Drop a message!
      </p>

      {status === 'sent' && (
        <div className="contact-success">Message sent successfully! I'll get back to you soon.</div>
      )}
      {status === 'error' && (
        <div className="contact-error">Something went wrong. Please try again or email directly.</div>
      )}

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
        <textarea
          placeholder="Your Message"
          rows={5}
          value={form.message}
          onChange={e => setForm({...form, message: e.target.value})}
          required
        />
        <button type="submit" className="btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  )
}
