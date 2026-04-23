const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = '2025-01'

const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`

async function shopifyFetch(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)
  return data
}

/* ─── Cart fragment ─────────────────────────────────────── */
const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product {
                title
                images(first: 1) {
                  edges { node { url altText } }
                }
              }
            }
          }
        }
      }
    }
    cost {
      totalAmount { amount currencyCode }
    }
  }
`

/* ─── Products ──────────────────────────────────────────── */
export async function getCollectionProducts(handle) {
  const data = await shopifyFetch(`
    query GetCollection($handle: String!) {
      collection(handle: $handle) {
        title
        products(first: 50) {
          edges {
            node {
              id
              title
              availableForSale
              images(first: 2) {
                edges { node { url altText } }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    availableForSale
                    price { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, { handle })

  if (!data.collection) return []
  return data.collection.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    available: node.availableForSale,
    image: node.images.edges[0]?.node ?? null,
    hoverImage: node.images.edges[1]?.node ?? null,
    variant: node.variants.edges[0]?.node ?? null,
  }))
}

/* ─── Cart ──────────────────────────────────────────────── */
export async function createCart(variantId, quantity = 1) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { lines: [{ merchandiseId: variantId, quantity }] })

  const { cart, userErrors } = data.cartCreate
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function addToCart(cartId, variantId, quantity = 1) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines: [{ merchandiseId: variantId, quantity }] })

  const { cart, userErrors } = data.cartLinesAdd
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function removeFromCart(cartId, lineId) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lineIds: [lineId] })

  const { cart, userErrors } = data.cartLinesRemove
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function updateCartLine(cartId, lineId, quantity) {
  if (quantity < 1) return removeFromCart(cartId, lineId)
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines: [{ id: lineId, quantity }] })

  const { cart, userErrors } = data.cartLinesUpdate
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function getCart(cartId) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
  `, { cartId })
  return data.cart
}

/* ─── Newsletter ────────────────────────────────────────── */
export async function subscribeToNewsletter(email) {
  const data = await shopifyFetch(`
    mutation {
      customerSubscribeToEmailMarketing(input: {
        email: "${email.trim().toLowerCase()}"
        marketingConsent: {
          marketingOptInLevel: SINGLE_OPT_IN
          marketingState: SUBSCRIBED
        }
      }) {
        emailMarketingConsent {
          marketingState
          marketingOptInLevel
        }
        userErrors { field message }
      }
    }
  `)

  const { emailMarketingConsent, userErrors } = data.customerSubscribeToEmailMarketing

  if (userErrors?.length > 0) {
    const alreadyExists = userErrors.some(e =>
      e.message?.toLowerCase().includes('already') ||
      e.message?.toLowerCase().includes('subscribed')
    )
    if (alreadyExists) return 'already_subscribed'
    throw new Error(userErrors[0].message)
  }

  if (emailMarketingConsent?.marketingState === 'SUBSCRIBED') return 'subscribed'

  return true
}

/* ─── Helpers ───────────────────────────────────────────── */
export function formatPrice(amount, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}
