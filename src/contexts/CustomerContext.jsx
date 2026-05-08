import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCustomer, deleteCustomerToken } from '../lib/shopify'

const CustomerContext = createContext(null)

const TOKEN_KEY    = 'shopify_customer_token'
const EXPIRES_KEY  = 'shopify_customer_token_expires'

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null)   // { firstName, lastName, email }
  const [customerLoading, setCustomerLoading] = useState(true)

  // On mount: validate any stored token and fetch customer name
  useEffect(() => {
    const token   = localStorage.getItem(TOKEN_KEY)
    const expires = localStorage.getItem(EXPIRES_KEY)

    if (!token) { setCustomerLoading(false); return }

    // Clear locally if the token expiry we stored has already passed
    if (expires && new Date(expires) < new Date()) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EXPIRES_KEY)
      setCustomerLoading(false)
      return
    }

    getCustomer(token)
      .then(c => {
        if (c) {
          setCustomer(c)
        } else {
          // Shopify says token is invalid — purge it
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(EXPIRES_KEY)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EXPIRES_KEY)
      })
      .finally(() => setCustomerLoading(false))
  }, [])

  /** Call after a successful customerAccessTokenCreate */
  const signIn = useCallback((tokenObj, customerData) => {
    localStorage.setItem(TOKEN_KEY,   tokenObj.accessToken)
    localStorage.setItem(EXPIRES_KEY, tokenObj.expiresAt)
    setCustomer(customerData)
  }, [])

  const signOut = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRES_KEY)
    setCustomer(null)
    if (token) deleteCustomerToken(token)
  }, [])

  return (
    <CustomerContext.Provider value={{ customer, customerLoading, signIn, signOut }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider')
  return ctx
}
