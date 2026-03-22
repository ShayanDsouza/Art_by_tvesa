import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FcGoogle } from 'react-icons/fc'

export default function AdminLogin() {
  const { signInWithGoogle, user } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (user) {
    navigate('/admin', { replace: true })
    return null
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="admin-login-overline">Admin Panel</span>
        <h1>Art by Tvesa</h1>
        <p>Sign in to manage your portfolio</p>
        {error && <div className="admin-error">{error}</div>}
        <button className="admin-google-btn" onClick={handleLogin} disabled={loading}>
          <FcGoogle size={20} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
