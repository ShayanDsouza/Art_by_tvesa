import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import DOMPurify from 'dompurify'
import { db, storage } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

const BIO_PURIFY_CONFIG = {
  ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const IMAGE_TYPES_BY_EXTENSION = {
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const DEFAULT_BIO = `Hi, I'm Tvesa, thanks for being here! I'm an aspiring Criminologist and part-time artist that works primarily with acrylic and oil paints. I also enjoy the occasional tattoo-style ink work, watercolour and digital messing around.

Each piece here is close to my heart, and is intended to evoke a feeling you can't quite pinpoint. I hope you leave with a little more whimsy than you came here with, and if you'd like to take anything with you, feel free to reach out!

If you are curious about my academic work, check out my <a href="https://www.linkedin.com/in/tvesa-medh/" target="_blank" rel="noopener noreferrer" class="about-inline-link">LinkedIn</a> and/or my publication(s).`

export default function AdminContent() {
  const { user } = useAuth()
  const [bio, setBio] = useState(DEFAULT_BIO)
  const [artistImageUrl, setArtistImageUrl] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageProgress, setImageProgress] = useState(0)
  const [imageSaved, setImageSaved] = useState(false)
  const [imageError, setImageError] = useState('')
  const [collection, setCollection] = useState({
    eyebrow: 'The Gallery of Trying',
    heading: 'Gallery',
    subheading: 'A curated selection of original works — exploring colour, form & emotion.',
  })
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about')).then(s => {
      if (s.exists()) {
        if (s.data().bio) setBio(s.data().bio)
        if (s.data().artistImageUrl) setArtistImageUrl(s.data().artistImageUrl)
      }
    })
    getDoc(doc(db, 'siteContent', 'collection')).then(s => {
      if (s.exists()) setCollection(c => ({ ...c, ...s.data() }))
    })
  }, [])

  const handleImagePick = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const contentType = file.type || IMAGE_TYPES_BY_EXTENSION[extension] || ''

    if (!contentType.startsWith('image/')) {
      setImageError('Please choose a valid image file.')
      e.target.value = ''
      return
    }

    if (file.size >= MAX_IMAGE_SIZE) {
      setImageError('Please choose an image under 10 MB.')
      e.target.value = ''
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageSaved(false)
    setImageError('')
  }

  const handleImageUpload = async () => {
    if (!imageFile) return
    const token = await user?.getIdTokenResult(true)
    if (!token?.claims?.admin) {
      setImageError('Your account is signed in, but Firebase has not granted it the admin upload claim yet. Run the admin claims script, then sign out and back in.')
      return
    }

    setImageUploading(true)
    setImageProgress(0)
    setImageError('')

    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const contentType = imageFile.type || IMAGE_TYPES_BY_EXTENSION[extension] || 'image/jpeg'
    const storageRef = ref(storage, `about/artist-photo-${Date.now()}.${extension}`)
    const task = uploadBytesResumable(storageRef, imageFile, { contentType })

    task.on('state_changed',
      snap => setImageProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      err => {
        console.error('Error uploading artist photo:', err)
        setImageError('Upload failed. Please check the file type, size, and admin permissions.')
        setImageUploading(false)
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          await setDoc(doc(db, 'siteContent', 'about'), { artistImageUrl: url }, { merge: true })
          setArtistImageUrl(url)
          setImageFile(null)
          setImagePreview(null)
          setImageUploading(false)
          setImageSaved(true)
          setTimeout(() => setImageSaved(false), 2500)
        } catch (err) {
          console.error('Error saving artist photo:', err)
          setImageError('The image uploaded, but saving it failed. Please check admin permissions.')
          setImageUploading(false)
        }
      }
    )
  }

  const save = async (section) => {
    setSaving(section)
    try {
      if (section === 'about') await setDoc(doc(db, 'siteContent', 'about'), { bio }, { merge: true })
      if (section === 'collection') await setDoc(doc(db, 'siteContent', 'collection'), collection)
      setSaved(section)
      setTimeout(() => setSaved(null), 2500)
    } catch (e) { console.error(e) }
    setSaving(null)
  }

  return (
    <div className="admin-content-editor">
      <h1 className="admin-page-title">Site Content</h1>

      {/* ── Artist Photo ── */}
      <div className="admin-content-section">
        <h2 className="admin-content-heading">About — Artist Photo</h2>
        <div className="admin-artist-photo-row">
          {(imagePreview || artistImageUrl) && (
            <img
              src={imagePreview || artistImageUrl}
              alt="Artist"
              className="admin-artist-photo-preview"
            />
          )}
          <div className="admin-artist-photo-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImagePick}
            />
            <button
              className="admin-content-save-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
            >
              Choose Photo
            </button>
            {imageFile && !imageUploading && (
              <button className="admin-content-save-btn" onClick={handleImageUpload}>
                Upload &amp; Save
              </button>
            )}
            {imageUploading && (
              <div className="admin-artist-photo-progress">
                <div className="admin-artist-photo-bar" style={{ width: `${imageProgress}%` }} />
                <span>{imageProgress}%</span>
              </div>
            )}
            {imageError && <span className="admin-content-error-label">{imageError}</span>}
            {imageSaved && <span className="admin-content-saved-label">✓ Saved</span>}
          </div>
        </div>
      </div>

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

        {/* Live preview — mirrors how the public site renders the bio */}
        {bio.trim() && (
          <div className="admin-bio-preview">
            <p className="admin-bio-preview-label">Preview</p>
            <div className="admin-bio-preview-body">
              {bio.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(para, BIO_PURIFY_CONFIG)
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Collection Page ── */}
      <div className="admin-content-section">
        <h2 className="admin-content-heading">Gallery Page — Header</h2>
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
