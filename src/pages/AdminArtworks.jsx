import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../config/firebase'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const EMPTY_FORM = { title: '', description: '', medium: '', category: '', height: 'normal', status: 'available', imageUrl: '' }

// Compress and convert image file to base64 data URL
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Scale down if wider than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SortableAdminItem({ artwork, onEdit, onDelete, onToggleStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gallery-item gallery-item-${artwork.height || 'normal'} admin-gallery-item`}
      {...attributes}
      {...listeners}
    >
      {artwork.imageUrl ? (
        <img src={artwork.imageUrl} alt={artwork.title} className="gallery-image" />
      ) : (
        <div className="gallery-placeholder">{artwork.title}</div>
      )}
      {artwork.status === 'sold' && <span className="gallery-sold-badge">Sold</span>}
      <div className="gallery-overlay admin-overlay">
        <span className="gallery-overlay-category">{artwork.category}</span>
        <h3>{artwork.title}</h3>
        <div className="admin-overlay-actions">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onToggleStatus(artwork) }}
            className="admin-overlay-btn"
          >
            {artwork.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEdit(artwork) }}
            className="admin-overlay-btn"
          >
            <HiOutlinePencil /> Edit
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(artwork.id) }}
            className="admin-overlay-btn admin-overlay-btn-danger"
          >
            <HiOutlineTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const isReorderingRef = useRef(false)
  const fileInputRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    const q = query(collection(db, 'artworks'), orderBy('order', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isReorderingRef.current) {
        isReorderingRef.current = false
        return
      }
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
      setArtworks(docs)
    })
    return unsubscribe
  }, [])

  // One-time migration: assign order to artworks that don't have it
  useEffect(() => {
    if (artworks.length > 0 && artworks.some(a => a.order === undefined || a.order === null)) {
      const migrateOrder = async () => {
        const batch = writeBatch(db)
        artworks.forEach((artwork, index) => {
          if (artwork.order === undefined || artwork.order === null) {
            batch.update(doc(db, 'artworks', artwork.id), { order: index })
          }
        })
        await batch.commit()
      }
      migrateOrder()
    }
  }, [artworks])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setCompressing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setCompressing(true)
    try {
      const dataUrl = await compressImage(file, 1200, 0.8)
      setForm(prev => ({ ...prev, imageUrl: dataUrl }))
    } catch (err) {
      console.error('Error compressing image:', err)
      alert('Failed to process image. Please try again.')
    } finally {
      setCompressing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const artworkData = {
        title: form.title,
        description: form.description,
        medium: form.medium,
        category: form.category,
        height: form.height,
        status: form.status,
        imageUrl: form.imageUrl,
      }

      if (editingId) {
        await updateDoc(doc(db, 'artworks', editingId), artworkData)
      } else {
        // Add new artwork at the end
        await addDoc(collection(db, 'artworks'), {
          ...artworkData,
          order: artworks.length,
          createdAt: serverTimestamp(),
        })
      }

      resetForm()
    } catch (err) {
      console.error('Error saving artwork:', err)
      alert('Failed to save artwork. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artwork) => {
    setForm(artwork)
    setEditingId(artwork.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'artworks', id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting artwork:', err)
      alert('Failed to delete artwork.')
    }
  }

  const toggleStatus = async (artwork) => {
    const newStatus = artwork.status === 'sold' ? 'available' : 'sold'
    await updateDoc(doc(db, 'artworks', artwork.id), { status: newStatus })
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = artworks.findIndex(a => a.id === active.id)
    const newIndex = artworks.findIndex(a => a.id === over.id)
    const reordered = arrayMove(artworks, oldIndex, newIndex)

    // Optimistic update
    isReorderingRef.current = true
    setArtworks(reordered)

    // Persist to Firestore
    const batch = writeBatch(db)
    reordered.forEach((artwork, index) => {
      batch.update(doc(db, 'artworks', artwork.id), { order: index })
    })
    await batch.commit()
  }

  const artworkIds = artworks.map(a => a.id)

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Artworks</h1>
          <p>{artworks.length} piece{artworks.length !== 1 ? 's' : ''} in gallery</p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={artworkIds} strategy={rectSortingStrategy}>
          <div className="admin-masonry">
            {/* Add New tile */}
            <div
              className="gallery-item gallery-item-normal admin-add-tile"
              onClick={() => { resetForm(); setShowForm(true) }}
            >
              <div className="admin-add-tile-content">
                <HiOutlinePlus />
                <span>Add New Artwork</span>
              </div>
            </div>

            {/* Sortable artwork tiles */}
            {artworks.map(artwork => (
              <SortableAdminItem
                key={artwork.id}
                artwork={artwork}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                onToggleStatus={toggleStatus}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) resetForm() }}>
          <div className="modal admin-form-modal">
            <button className="modal-close" onClick={resetForm}>&times;</button>
            <div className="admin-form-modal-content">
              <h2>{editingId ? 'Edit Artwork' : 'Add New Artwork'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Title</label>
                    <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                      <option value="">Select...</option>
                      <option value="Painting">Painting</option>
                      <option value="Sketch">Sketch</option>
                      <option value="Digital">Digital</option>
                      <option value="Mixed Media">Mixed Media</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Medium</label>
                    <input type="text" value={form.medium} onChange={e => setForm({...form, medium: e.target.value})} placeholder="e.g. Canvas, Tote Bag, Paper" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Layout Height</label>
                    <select value={form.height} onChange={e => setForm({...form, height: e.target.value})}>
                      <option value="normal">Normal</option>
                      <option value="tall">Tall</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required />
                </div>
                <div className="admin-form-group">
                  <label>Image</label>
                  <div className="admin-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    {compressing ? (
                      <div className="admin-upload-placeholder">
                        <span>Compressing image...</span>
                      </div>
                    ) : form.imageUrl ? (
                      <img src={form.imageUrl} alt="Preview" className="admin-upload-preview" />
                    ) : (
                      <div className="admin-upload-placeholder">
                        <HiOutlinePhotograph />
                        <span>Click to upload image</span>
                        <span className="admin-upload-hint">JPG, PNG — will be compressed automatically</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn" disabled={loading || compressing || !form.imageUrl}>
                    {loading ? 'Saving...' : (editingId ? 'Update Artwork' : 'Add Artwork')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
          <div className="modal admin-delete-modal">
            <h3>Delete Artwork</h3>
            <p>Are you sure you want to delete this artwork? This cannot be undone.</p>
            <div className="admin-form-actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn admin-btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
