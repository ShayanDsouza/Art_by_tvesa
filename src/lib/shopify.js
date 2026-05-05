const STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN

// Shopify-hosted customer account pages (no custom auth needed)
export const SHOPIFY_ACCOUNT_URL    = `https://${STORE_DOMAIN}/account`
export const SHOPIFY_LOGIN_URL      = `https://${STORE_DOMAIN}/account/login`
export const SHOPIFY_ORDERS_URL     = `https://${STORE_DOMAIN}/account/orders`
export const SHOPIFY_PROFILE_URL    = `https://${STORE_DOMAIN}/account/profile`
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
export async function subscribeToNewsletter(email) {
  const data = await shopifyFetch(`
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email acceptsMarketing }
        customerUserErrors { field message code }
      }
    }
  `, {
    input: {
      email: email.trim().toLowerCase(),
      password: crypto.randomUUID(),
      acceptsMarketing: true,
    },
  })

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

/* ─── Helpers ───────────────────────────────────────────── */
export function formatPrice(amount, currencyCode = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}
