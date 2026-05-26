import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('VITE_SHOPIFY_STORE_DOMAIN', 'test.myshopify.com')
vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'test-token')

const {
  getCollectionProducts,
  getProduct,
  retrieveCart,
  createCartWithAttributes,
  addToCartWithAttributes,
  createCartWithLines,
  addLinesToCart,
  removeFromCart,
  updateCartLine,
  createCustomerToken,
  getCustomer,
  deleteCustomerToken,
} = await import('../lib/shopify.js')

describe('shopify core API helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('maps collection products into UI shape', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          collection: {
            products: {
              edges: [{
                node: {
                  id: 'p1',
                  title: 'A',
                  availableForSale: true,
                  handle: 'a',
                  images: { edges: [{ node: { url: 'u1', altText: 'a1' } }, { node: { url: 'u2', altText: 'a2' } }] },
                  variants: { edges: [{ node: { id: 'v1', quantityAvailable: 1, availableForSale: true, price: { amount: '10', currencyCode: 'INR' } } }] },
                },
              }],
            },
          },
        },
      }),
    })

    const products = await getCollectionProducts('postcards')
    expect(products).toEqual([{
      id: 'p1',
      title: 'A',
      handle: 'a',
      available: true,
      image: { url: 'u1', altText: 'a1' },
      hoverImage: { url: 'u2', altText: 'a2' },
      variant: { id: 'v1', quantityAvailable: 1, availableForSale: true, price: { amount: '10', currencyCode: 'INR' } },
    }])
  })

  it('returns empty array when collection does not exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { collection: null } }),
    })
    await expect(getCollectionProducts('missing')).resolves.toEqual([])
  })

  it('returns product by handle or null', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { product: { id: 'p1', title: 'Paint', variants: { edges: [] }, images: { edges: [] } } } }),
    })
    await expect(getProduct('paint')).resolves.toMatchObject({ id: 'p1', title: 'Paint' })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { product: null } }),
    })
    await expect(getProduct('none')).resolves.toBeNull()
  })

  it('retrieves cart and handles null cart response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cart: { id: 'c1', lines: { edges: [] } } } }),
    })
    await expect(retrieveCart('c1')).resolves.toMatchObject({ id: 'c1' })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cart: null } }),
    })
    await expect(retrieveCart('missing')).resolves.toBeNull()
  })

  it('creates and adds cart lines with attributes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: { cart: { id: 'c1' }, userErrors: [] },
        },
      }),
    })
    await expect(createCartWithAttributes('v1', 2, [{ key: 'a', value: 'b' }])).resolves.toEqual({ id: 'c1' })
    const createBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(createBody.variables.lines[0]).toEqual({ merchandiseId: 'v1', quantity: 2, attributes: [{ key: 'a', value: 'b' }] })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          cartLinesAdd: { cart: { id: 'c1', totalQuantity: 3 }, userErrors: [] },
        },
      }),
    })
    await expect(addToCartWithAttributes('c1', 'v2', 1, [{ key: 'x', value: 'y' }])).resolves.toMatchObject({ totalQuantity: 3 })
  })

  it('throws when cart mutations return user errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: { cart: null, userErrors: [{ message: 'Invalid line' }] },
        },
      }),
    })
    await expect(createCartWithAttributes('v1')).rejects.toThrow('Invalid line')
  })

  it('creates and appends multiple lines with default attribute fallback', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cartCreate: { cart: { id: 'c1' }, userErrors: [] } } }),
    })
    const lines = [{ variantId: 'v1', quantity: 1 }, { variantId: 'v2', quantity: 2, attributes: [{ key: 'k', value: 'v' }] }]
    await createCartWithLines(lines)
    const createBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(createBody.variables.lines).toEqual([
      { merchandiseId: 'v1', quantity: 1, attributes: [] },
      { merchandiseId: 'v2', quantity: 2, attributes: [{ key: 'k', value: 'v' }] },
    ])

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cartLinesAdd: { cart: { id: 'c1', totalQuantity: 3 }, userErrors: [] } } }),
    })
    await expect(addLinesToCart('c1', lines)).resolves.toMatchObject({ totalQuantity: 3 })
  })

  it('removes line and updateCartLine removes when quantity < 1', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cartLinesRemove: { cart: { id: 'c1', totalQuantity: 0 }, userErrors: [] } } }),
    })
    await expect(removeFromCart('c1', 'l1')).resolves.toMatchObject({ totalQuantity: 0 })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { cartLinesRemove: { cart: { id: 'c1', totalQuantity: 0 }, userErrors: [] } } }),
    })
    await updateCartLine('c1', 'l1', 0)
    const updateBody = JSON.parse(fetch.mock.calls[1][1].body)
    expect(updateBody.query).toContain('cartLinesRemove')
  })

  it('creates customer token and reads customer profile', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerAccessTokenCreate: {
            customerAccessToken: { accessToken: 'tok', expiresAt: '2099-01-01T00:00:00Z' },
            customerUserErrors: [],
          },
        },
      }),
    })
    await expect(createCustomerToken('a@b.com', 'pass')).resolves.toMatchObject({ accessToken: 'tok' })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { customer: { firstName: 'A', lastName: 'B', email: 'a@b.com' } },
      }),
    })
    await expect(getCustomer('tok')).resolves.toMatchObject({ email: 'a@b.com' })
  })

  it('throws on customer token user errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerAccessTokenCreate: {
            customerAccessToken: null,
            customerUserErrors: [{ message: 'Invalid credentials' }],
          },
        },
      }),
    })

    await expect(createCustomerToken('a@b.com', 'bad')).rejects.toThrow('Invalid credentials')
  })

  it('swallows customer token delete errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network down'))
    await expect(deleteCustomerToken('tok')).resolves.toBeUndefined()
  })
})
