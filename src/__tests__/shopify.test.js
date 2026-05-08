import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── formatPrice ───────────────────────────────────────────────────────────────

// Import after mocking env so VITE_* vars resolve to safe test values
vi.stubEnv('VITE_SHOPIFY_STORE_DOMAIN', 'test.myshopify.com')
vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'test-token')

const { formatPrice, subscribeToNewsletter } = await import('../lib/shopify.js')

describe('formatPrice', () => {
  it('formats INR correctly', () => {
    const result = formatPrice('1500', 'INR')
    expect(result).toMatch(/1,500|1500/) // locale may vary
    expect(result).toMatch(/₹|INR/)
  })

  it('formats USD correctly', () => {
    const result = formatPrice('29.99', 'USD')
    expect(result).toMatch(/\$|USD/)
    expect(result).toMatch(/29|30/)
  })

  it('rounds to zero decimal places', () => {
    const result = formatPrice('1500.75', 'INR')
    // maximumFractionDigits: 0 means no decimals
    expect(result).not.toMatch(/\.75/)
  })

  it('handles zero', () => {
    const result = formatPrice('0', 'INR')
    expect(result).toBeTruthy()
  })

  it('handles large amounts', () => {
    const result = formatPrice('100000', 'INR')
    expect(result).toBeTruthy()
  })
})

// ── subscribeToNewsletter ─────────────────────────────────────────────────────

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns "subscribed" when customer is created successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerCreate: {
            customer: { id: 'gid://shopify/Customer/1', email: 'test@example.com', acceptsMarketing: true },
            customerUserErrors: [],
          },
        },
      }),
    })

    const result = await subscribeToNewsletter('test@example.com')
    expect(result).toBe('subscribed')
  })

  it('returns "already_subscribed" when email is TAKEN', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerCreate: {
            customer: null,
            customerUserErrors: [{ code: 'TAKEN', message: 'Email has already been taken', field: 'email' }],
          },
        },
      }),
    })

    const result = await subscribeToNewsletter('existing@example.com')
    expect(result).toBe('already_subscribed')
  })

  it('returns "already_subscribed" when response includes "sent an email" message', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerCreate: {
            customer: null,
            customerUserErrors: [{ code: 'UNIDENTIFIED_CUSTOMER', message: 'We have sent an email to the customer' }],
          },
        },
      }),
    })

    const result = await subscribeToNewsletter('existing@example.com')
    expect(result).toBe('already_subscribed')
  })

  it('throws on unexpected user errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerCreate: {
            customer: null,
            customerUserErrors: [{ code: 'INVALID', message: 'Email is invalid' }],
          },
        },
      }),
    })

    await expect(subscribeToNewsletter('bad-email')).rejects.toThrow('Email is invalid')
  })

  it('throws on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429 })
    await expect(subscribeToNewsletter('test@example.com')).rejects.toThrow('Shopify API error: 429')
  })

  it('throws on GraphQL-level errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: null,
        errors: [{ message: 'Access denied for customerCreate field.' }],
      }),
    })

    await expect(subscribeToNewsletter('test@example.com')).rejects.toThrow('Access denied')
  })

  it('normalises email to lowercase before sending', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          customerCreate: {
            customer: { id: 'gid://shopify/Customer/2', email: 'test@example.com', acceptsMarketing: true },
            customerUserErrors: [],
          },
        },
      }),
    })

    await subscribeToNewsletter('TEST@Example.COM')

    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.variables.input.email).toBe('test@example.com')
  })
})
