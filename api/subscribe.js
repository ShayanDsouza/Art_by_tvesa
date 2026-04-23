// Vercel serverless function — POST /api/subscribe
// Uses the Shopify Storefront API (customerCreate mutation) to subscribe an email
// with acceptsMarketing: true. No Admin token needed — just the public Storefront token.
// Requires: unauthenticated_write_customers scope on the Headless channel.

import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN
  const token  = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN

  if (!domain || !token) {
    console.error('Missing Shopify env vars')
    return res.status(500).json({ error: 'Server misconfiguration.' })
  }

  // Generate a random password — the subscriber never needs to know or use it.
  // It just satisfies Shopify's customerCreate requirement.
  const password = randomUUID() + '-' + randomUUID()

  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { field message code }
      }
    }
  `

  try {
    const shopifyRes = await fetch(
      `https://${domain}/api/2025-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              email: email.trim().toLowerCase(),
              password,
              acceptsMarketing: true,
            },
          },
        }),
      }
    )

    const { data, errors } = await shopifyRes.json()

    if (errors?.length) {
      console.error('Shopify GraphQL errors:', errors)
      return res.status(500).json({ error: 'Failed to subscribe. Please try again.' })
    }

    const { customerUserErrors } = data.customerCreate

    if (customerUserErrors.length > 0) {
      // Email already registered → treat as success (they're already in the system)
      const alreadyTaken = customerUserErrors.some(e => e.code === 'TAKEN')
      if (alreadyTaken) {
        return res.status(200).json({ success: true })
      }
      return res.status(400).json({ error: customerUserErrors[0].message })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Subscribe handler error:', err)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}
