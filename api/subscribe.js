// Vercel serverless function — POST /api/subscribe
// Adds an email to Shopify as a subscribed customer via the Admin API.
// Uses server-side env vars so the Admin token is never exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN
  const token  = process.env.SHOPIFY_ADMIN_TOKEN

  if (!domain || !token) {
    console.error('Missing VITE_SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN env vars')
    return res.status(500).json({ error: 'Server misconfiguration.' })
  }

  const adminBase = `https://${domain}/admin/api/2025-01`
  const headers   = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  }

  try {
    // ── Attempt to create a new customer with marketing consent ──
    const createRes = await fetch(`${adminBase}/customers.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: {
          email: email.trim().toLowerCase(),
          tags: 'newsletter',           // ← marks them as newsletter-only signup
          email_marketing_consent: {
            state: 'subscribed',
            opt_in_level: 'single_opt_in',
          },
        },
      }),
    })

    const createData = await createRes.json()

    // ── Customer already exists → update their marketing consent + add tag ──
    if (!createRes.ok && createData.errors?.email) {
      const searchRes = await fetch(
        `${adminBase}/customers/search.json?query=email:${encodeURIComponent(email.trim())}`,
        { headers }
      )
      const { customers } = await searchRes.json()

      if (!customers || customers.length === 0) {
        return res.status(400).json({ error: 'Could not find or create subscriber.' })
      }

      const existing = customers[0]
      const existingTags = existing.tags ? existing.tags.split(', ') : []
      const updatedTags = existingTags.includes('newsletter')
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

      // Already subscribed — still a success from the user's perspective
      return res.status(200).json({ success: true })
    }

    if (!createRes.ok) {
      const msg = Object.values(createData.errors || {}).flat()[0] || 'Failed to subscribe.'
      return res.status(400).json({ error: msg })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Subscribe handler error:', err)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}
