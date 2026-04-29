import { createContext, useContext, useState, useCallback } from 'react'
import { createCart, addToCart, removeFromCart, updateCartLine } from '../lib/shopify'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const addItem = useCallback(async (variantId, quantity = 1) => {
    setLoading(true)
    try {
      let updated
      if (!cart) {
        updated = await createCart(variantId, quantity)
      } else {
        updated = await addToCart(cart.id, variantId, quantity)
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
      addItem, removeItem, updateItem,
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
