import { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const AuthContext = createContext(null)

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email === ADMIN_EMAIL) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user.email !== ADMIN_EMAIL) {
        await firebaseSignOut(auth)
        throw new Error('Unauthorized. This account does not have admin access.')
      }
      return result.user
    } catch (error) {
      if (error.message.includes('Unauthorized')) throw error
      throw new Error('Sign in failed. Please try again.')
    }
  }

  const signOutUser = () => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
