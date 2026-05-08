import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createCartWithAttributes, addToCartWithAttributes, removeFromCart, updateCartLine, createCartWithLines, addLinesToCart, retrieveCart } from '../lib/shopify'

const CartContext = createContext(null)
const CART_ID_KEY = 'shopify_cart_id'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Restore cart from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(CART_ID_KEY)
    if (!savedId) return
    retrieveCart(savedId)
      .then(restored => {
        if (restored && restored.lines.edges.length > 0) {
          setCart(restored)
        } else {
          localStorage.removeItem(CART_ID_KEY)
        }
      })
      .catch(() => localStorage.removeItem(CART_ID_KEY))
  }, [])

  // Persist cart ID whenever cart changes
  useEffect(() => {
    if (cart?.id) localStorage.setItem(CART_ID_KEY, cart.id)
  }, [cart?.id])

  const addItem = useCallback(async (variantId, quantity = 1, attributes = []) => {
    setLoading(true)
    try {
      let updated
      if (!cart) {
        updated = await createCartWithAttributes(variantId, quantity, attributes)
      } else {
        updated = await addToCartWithAttributes(cart.id, variantId, quantity, attributes)
      }
      setCart(updated)
      setCartOpen(true)
    } catch (e) {
      console.error('Add to cart failed:', e)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const removeItem = useCallback(async (lineId) => {
    if (!cart) return
    setLoading(true)
    try {
      const updated = await removeFromCart(cart.id, lineId)
      setCart(updated)
    } catch (e) {
      console.error('Remove from cart failed:', e)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const updateItem = useCallback(async (lineId, quantity) => {
    if (!cart) return
    setLoading(true)
    try {
      const updated = await updateCartLine(cart.id, lineId, quantity)
      setCart(updated)
    } catch (e) {
      console.error('Update cart failed:', e)
    } finally {
      setLoading(false)
    }
  }, [cart])

  /* Add multiple lines at once — used by bundle builder */
  const addItems = useCallback(async (lines) => {
    if (!lines.length) return
    setLoading(true)
    try {
      let updated
      if (!cart) {
        updated = await createCartWithLines(lines)
      } else {
        updated = await addLinesToCart(cart.id, lines)
      }
      setCart(updated)
      setCartOpen(true)
    } catch (e) {
      console.error('Add items failed:', e)
    } finally {
      setLoading(false)
    }
  }, [cart])

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const totalQuantity = cart?.totalQuantity ?? 0
  const lines = cart?.lines?.edges?.map(e => e.node) ?? []
  const totalAmount = cart?.cost?.totalAmount ?? null
  const checkoutUrl = cart?.checkoutUrl ?? null

  return (
    <CartContext.Provider value={{
      cart, lines, totalQuantity, totalAmount, checkoutUrl,
      cartOpen, loading,
      addItem, addItems, removeItem, updateItem,
      openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
