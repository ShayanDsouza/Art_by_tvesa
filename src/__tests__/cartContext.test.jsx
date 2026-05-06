import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../contexts/CartContext'

// Mock the Shopify API module so no real network calls are made
vi.mock('../lib/shopify', () => ({
  createCartWithAttributes: vi.fn(),
  addToCartWithAttributes: vi.fn(),
  removeFromCart: vi.fn(),
  updateCartLine: vi.fn(),
}))

import { createCartWithAttributes, addToCartWithAttributes, removeFromCart, updateCartLine } from '../lib/shopify'

const MOCK_CART = {
  id: 'gid://shopify/Cart/abc123',
  checkoutUrl: 'https://store.myshopify.com/cart/abc',
  totalQuantity: 1,
  lines: {
    edges: [
      {
        node: {
          id: 'gid://shopify/CartLine/1',
          quantity: 1,
          merchandise: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default Title',
            price: { amount: '1500', currencyCode: 'INR' },
            product: {
              title: 'Test Print',
              images: { edges: [{ node: { url: 'https://cdn.shopify.com/test.jpg', altText: 'Test' } }] },
            },
          },
        },
      },
    ],
  },
  cost: {
    totalAmount: { amount: '1500', currencyCode: 'INR' },
  },
}

// Wrapper for renderHook
const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if useCart is used outside CartProvider', () => {
    // Suppress React's console.error for this expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within CartProvider')
    spy.mockRestore()
  })

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.lines).toEqual([])
    expect(result.current.totalQuantity).toBe(0)
    expect(result.current.checkoutUrl).toBeNull()
    expect(result.current.cartOpen).toBe(false)
  })

  it('calls createCart on first addItem and opens the drawer', async () => {
    createCartWithAttributes.mockResolvedValueOnce(MOCK_CART)

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/1')
    })

    expect(createCartWithAttributes).toHaveBeenCalledWith('gid://shopify/ProductVariant/1', 1, [])
    expect(result.current.cartOpen).toBe(true)
    expect(result.current.totalQuantity).toBe(1)
    expect(result.current.lines).toHaveLength(1)
  })

  it('calls addToCart (not createCart) on subsequent addItem', async () => {
    createCartWithAttributes.mockResolvedValueOnce(MOCK_CART)
    const updatedCart = { ...MOCK_CART, totalQuantity: 2 }
    addToCartWithAttributes.mockResolvedValueOnce(updatedCart)

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/1')
    })
    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/2')
    })

    expect(createCartWithAttributes).toHaveBeenCalledTimes(1)
    expect(addToCartWithAttributes).toHaveBeenCalledWith(MOCK_CART.id, 'gid://shopify/ProductVariant/2', 1, [])
  })

  it('passes custom line attributes through addItem', async () => {
    createCartWithAttributes.mockResolvedValueOnce(MOCK_CART)

    const { result } = renderHook(() => useCart(), { wrapper })

    const attributes = [
      { key: 'bundle_type', value: 'Postcard Set of 3' },
      { key: 'postcard_handles', value: 'dawn-raga,monsoon-window,amber-sky' },
    ]

    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/1', 1, attributes)
    })

    expect(createCartWithAttributes).toHaveBeenCalledWith('gid://shopify/ProductVariant/1', 1, attributes)
  })

  it('opens and closes the cart drawer', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.openCart())
    expect(result.current.cartOpen).toBe(true)

    act(() => result.current.closeCart())
    expect(result.current.cartOpen).toBe(false)
  })

  it('calls removeFromCart when removeItem is invoked', async () => {
    createCartWithAttributes.mockResolvedValueOnce(MOCK_CART)
    removeFromCart.mockResolvedValueOnce({ ...MOCK_CART, totalQuantity: 0, lines: { edges: [] } })

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/1')
    })
    await act(async () => {
      await result.current.removeItem('gid://shopify/CartLine/1')
    })

    expect(removeFromCart).toHaveBeenCalledWith(MOCK_CART.id, 'gid://shopify/CartLine/1')
    expect(result.current.lines).toHaveLength(0)
  })

  it('does not throw if removeItem is called with no cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    // Should be a no-op without throwing
    await act(async () => {
      await result.current.removeItem('gid://shopify/CartLine/1')
    })
    expect(removeFromCart).not.toHaveBeenCalled()
  })

  it('calls updateCartLine when updateItem is invoked with quantity > 0', async () => {
    const updatedCart = { ...MOCK_CART, totalQuantity: 3 }
    createCartWithAttributes.mockResolvedValueOnce(MOCK_CART)
    updateCartLine.mockResolvedValueOnce(updatedCart)

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addItem('gid://shopify/ProductVariant/1')
    })
    await act(async () => {
      await result.current.updateItem('gid://shopify/CartLine/1', 3)
    })

    expect(updateCartLine).toHaveBeenCalledWith(MOCK_CART.id, 'gid://shopify/CartLine/1', 3)
  })
})
