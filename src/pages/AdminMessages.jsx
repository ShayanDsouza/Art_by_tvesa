import { useState, useEffect } from 'react'
import { collection, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { HiOutlineTrash, HiOutlineMail, HiOutlineMailOpen, HiOutlineReply } from 'react-icons/hi'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [])

  const toggleRead = async (msg) => {
    await updateDoc(doc(db, 'messages', msg.id), { read: !msg.read })
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'messages', id))
    setDeleteConfirm(null)
    if (selectedMessage?.id === id) setSelectedMessage(null)
  }

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return ''
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Messages</h1>
          <p>{messages.length} message{messages.length !== 1 ? 's' : ''}{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</p>
        </div>
      </div>

      <div className="admin-messages-layout">
        <div className="admin-messages-list">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`admin-message-item ${!msg.read ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedMessage(msg)
                if (!msg.read) toggleRead(msg)
              }}
            >
              <div className="admin-message-dot">{!msg.read && <span></span>}</div>
              <div className="admin-message-preview">
                <div className="admin-message-top">
                  <strong>{msg.name}</strong>
                  <span className="admin-message-date">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="admin-message-email">{msg.email}</p>
                <p className="admin-message-snippet">{msg.message?.slice(0, 80)}...</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="admin-empty">
              <p>No messages yet.</p>
            </div>
          )}
        </div>

        {selectedMessage && (
          <div className="admin-message-detail">
            <div className="admin-message-detail-header">
              <div>
                <h2>{selectedMessage.name}</h2>
                <a href={`mailto:${selectedMessage.email}`} className="admin-message-email-link">{selectedMessage.email}</a>
                <span className="admin-message-timestamp">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div className="admin-message-detail-actions">
                <a href={`mailto:${selectedMessage.email}?subject=Re: your message`} className="admin-icon-btn" title="Reply via email">
                  <HiOutlineReply />
                </a>
                <button onClick={() => toggleRead(selectedMessage)} className="admin-icon-btn" title={selectedMessage.read ? 'Mark unread' : 'Mark read'}>
                  {selectedMessage.read ? <HiOutlineMail /> : <HiOutlineMailOpen />}
                </button>
                <button onClick={() => setDeleteConfirm(selectedMessage.id)} className="admin-icon-btn admin-delete-btn" title="Delete">
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
            <div className="admin-message-body">
              <p>{selectedMessage.message}</p>
            </div>
            {deleteConfirm === selectedMessage.id && (
              <div className="admin-delete-confirm">
                <p>Delete this message?</p>
                <div className="admin-delete-actions">
                  <button onClick={() => setDeleteConfirm(null)} className="btn btn-outline">Cancel</button>
                  <button onClick={() => handleDelete(selectedMessage.id)} className="btn admin-btn-danger">Delete</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
