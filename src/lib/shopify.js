const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

// Customer-facing Shopify pages must always land on the actual myshopify domain,
// never the React app's domain, regardless of which domain is used for API calls.
const SHOPIFY_PUBLIC_DOMAIN = import.meta.env.VITE_SHOPIFY_PUBLIC_DOMAIN || STORE_DOMAIN

export const SHOPIFY_ACCOUNT_URL    = `https://${SHOPIFY_PUBLIC_DOMAIN}/account`
export const SHOPIFY_LOGIN_URL      = `https://${SHOPIFY_PUBLIC_DOMAIN}/account/login`
export const SHOPIFY_ORDERS_URL     = `https://${SHOPIFY_PUBLIC_DOMAIN}/account/orders`
export const SHOPIFY_PROFILE_URL    = `https://${SHOPIFY_PUBLIC_DOMAIN}/account/profile`
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
          attributes {
            key
            value
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              quantityAvailable
              price { amount currencyCode }
              product {
                title
                handle
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
        products(first: 250) {
          edges {
            node {
              id
              title
              availableForSale
              images(first: 2) {
                edges { node { url altText } }
              }
              handle
              variants(first: 1) {
                edges {
                  node {
                    id
                    availableForSale
                    quantityAvailable
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
    handle: node.handle,
    title: node.title,
    available: node.availableForSale,
    image: node.images.edges[0]?.node ?? null,
    hoverImage: node.images.edges[1]?.node ?? null,
    variant: node.variants.edges[0]?.node ?? null,
  }))
}

export async function getProduct(handle) {
  const data = await shopifyFetch(`
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        vendor
        availableForSale
        images(first: 10) {
          edges { node { url altText } }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price { amount currencyCode }
            }
          }
        }
      }
    }
  `, { handle })
  return data.product ?? null
}

/* ─── Cart ──────────────────────────────────────────────── */
export async function retrieveCart(cartId) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    query CartRetrieve($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
  `, { cartId })
  return data.cart ?? null
}

export async function createCart(variantId, quantity = 1) {
  return createCartWithAttributes(variantId, quantity)
}

export async function createCartWithAttributes(variantId, quantity = 1, attributes = []) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { lines: [{ merchandiseId: variantId, quantity, attributes }] })

  const { cart, userErrors } = data.cartCreate
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function addToCart(cartId, variantId, quantity = 1) {
  return addToCartWithAttributes(cartId, variantId, quantity)
}

export async function addToCartWithAttributes(cartId, variantId, quantity = 1, attributes = []) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines: [{ merchandiseId: variantId, quantity, attributes }] })

  const { cart, userErrors } = data.cartLinesAdd
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

/* Add multiple lines to a new or existing cart (used by bundle builder) */
export async function createCartWithLines(lines) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { lines: lines.map(l => ({ merchandiseId: l.variantId, quantity: l.quantity, attributes: l.attributes || [] })) })
  const { cart, userErrors } = data.cartCreate
  if (userErrors.length) throw new Error(userErrors[0].message)
  return cart
}

export async function addLinesToCart(cartId, lines) {
  const data = await shopifyFetch(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines: lines.map(l => ({ merchandiseId: l.variantId, quantity: l.quantity, attributes: l.attributes || [] })) })
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

/* ─── Customer auth ─────────────────────────────────────── */
export async function createCustomerToken(email, password) {
  const data = await shopifyFetch(`
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message code }
      }
    }
  `, { input: { email, password } })
  const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate
  if (customerUserErrors.length) throw new Error(customerUserErrors[0].message)
  return customerAccessToken // { accessToken, expiresAt }
}

export async function getCustomer(accessToken) {
  const data = await shopifyFetch(`
    query GetCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        firstName
        lastName
        email
      }
    }
  `, { token: accessToken })
  return data.customer // null if token invalid/expired
}

export async function deleteCustomerToken(accessToken) {
  await shopifyFetch(`
    mutation customerAccessTokenDelete($token: String!) {
      customerAccessTokenDelete(customerAccessToken: $token) {
        deletedAccessToken
      }
    }
  `, { token: accessToken }).catch(() => {})
}

/* ─── Newsletter ────────────────────────────────────────── */
export async function subscribeToNewsletter(email, name = '') {
  const parts = name.trim().split(' ')
  const firstName = parts[0] || undefined
  const lastName = parts.slice(1).join(' ') || undefined

  const input = {
    email: email.trim().toLowerCase(),
    password: crypto.randomUUID(),
    acceptsMarketing: true,
  }
  if (firstName) input.firstName = firstName
  if (lastName) input.lastName = lastName

  const data = await shopifyFetch(`
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email acceptsMarketing }
        customerUserErrors { field message code }
      }
    }
  `, { input })

  const { customer, customerUserErrors } = data.customerCreate

  if (customer) return 'subscribed'

  if (customerUserErrors.length > 0) {
    const alreadyExists =
      customerUserErrors.some(e => e.code === 'TAKEN') ||
      customerUserErrors.some(e => e.message?.toLowerCase().includes('sent an email'))
    if (alreadyExists) return 'already_subscribed'
    throw new Error(customerUserErrors[0].message)
  }

  return true
}

/* ─── Shop policies ─────────────────────────────────────── */
const VALID_POLICY_KEYS = new Set(['privacyPolicy', 'termsOfService', 'refundPolicy', 'shippingPolicy', 'termsOfSale'])

// policyKey: 'privacyPolicy' | 'termsOfService' | 'refundPolicy' | 'shippingPolicy'
export async function getShopPolicy(policyKey) {
  if (!VALID_POLICY_KEYS.has(policyKey)) throw new Error(`Invalid policy key: ${policyKey}`)
  const data = await shopifyFetch(`
    query GetShopPolicy {
      shop {
        ${policyKey} { title body }
      }
    }
  `)
  return data.shop?.[policyKey] ?? null
}

// Fetch any Shopify page by handle (Online Store → Pages)
export async function getShopPage(handle) {
  const data = await shopifyFetch(`
    query GetShopPage($handle: String!) {
      page(handle: $handle) { title body }
    }
  `, { handle })
  return data.page ?? null
}

/* ─── Helpers ───────────────────────────────────────────── */
export function formatPrice(amount, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}
