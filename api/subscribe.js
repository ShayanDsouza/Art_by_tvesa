// Vercel serverless function — POST /api/subscribe
// Uses OAuth Client Credentials to get a short-lived Admin token,
// then creates a Shopify customer with email marketing consent.

async function getAdminToken(domain, clientId, clientSecret) {
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Could not authenticate with Shopify.')
  return data.access_token
}

module.exports = async function handler(req, res) {
  // Always set JSON content-type so the client can parse the response
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  const domain       = process.env.VITE_SHOPIFY_STORE_DOMAIN
  const clientId     = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

  if (!domain || !clientId || !clientSecret) {
    console.error('Missing env vars:', { domain: !!domain, clientId: !!clientId, clientSecret: !!clientSecret })
    return res.status(500).json({ error: 'Server misconfiguration — env vars missing.' })
  }

  const adminBase = `https://${domain}/admin/api/2025-01`

  try {
    // Step 1: Get a fresh Admin API token
    const accessToken = await getAdminToken(domain, clientId, clientSecret)

    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    }

    // Step 2: Create the customer with marketing consent
    const createRes = await fetch(`${adminBase}/customers.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: {
          email: email.trim().toLowerCase(),
          tags: 'newsletter',
          email_marketing_consent: {
            state: 'subscribed',
            opt_in_level: 'single_opt_in',
          },
        },
      }),
    })

    const createData = await createRes.json()

    // Step 3: Email already exists — update their consent instead
    if (!createRes.ok && createData.errors && createData.errors.email) {
      const searchRes = await fetch(
        `${adminBase}/customers/search.json?query=email:${encodeURIComponent(email.trim())}`,
        { headers }
      )
      const searchData = await searchRes.json()
      const customers  = searchData.customers || []

      if (customers.length === 0) {
        return res.status(400).json({ error: 'Could not find or create subscriber.' })
      }

      const existing     = customers[0]
      const existingTags = existing.tags ? existing.tags.split(', ') : []
      const updatedTags  = existingTags.includes('newsletter')
        ? existing.tags
        : [...existingTags, 'newsletter'].filter(Boolean).join(', ')

      await fetch(`${adminBase}/customers/${existing.id}.json`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          customer: {
            id: existing.id,
            tags: updatedTags,
            email_marketing_consent: {
              state: 'subscribed',
              opt_in_level: 'single_opt_in',
            },
          },
        }),
      })

      return res.status(200).json({ success: true })
    }

    if (!createRes.ok) {
      const msg = Object.values(createData.errors || {}).flat()[0] || 'Failed to subscribe.'
      return res.status(400).json({ error: String(msg) })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Subscribe handler error:', err)
    return res.status(500).json({ error: err.message || 'Server error. Please try again.' })
  }
}
