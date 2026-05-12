import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import DOMPurify from 'dompurify'
import Navbar from '../components/Navbar'
import ShopCart from '../components/ShopCart'
import ShopFooter from '../components/ShopFooter'
import { getShopPolicy, getShopPage } from '../lib/shopify'

// Enforce noopener noreferrer on every target="_blank" link inside Shopify HTML.
// This runs once at module load; DOMPurify hooks are global and persistent.
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

// Maps route → Shopify Storefront API field name + fallback title + meta description
const POLICY_CONFIG = {
  privacyPolicy:  { title: 'Privacy Policy',    desc: 'How Art by Tvesa collects, uses, and protects your personal information when you shop with us.' },
  termsOfService: { title: 'Terms of Service',  desc: 'Terms and conditions governing your use of the Art by Tvesa shop, including orders, payments, and intellectual property.' },
  refundPolicy:   { title: 'Refunds & Returns', desc: 'Art by Tvesa refund and returns policy — all sales final except for damaged, defective, or incorrect items.' },
  shippingPolicy: { title: 'Shipping Policy',   desc: 'Shipping and delivery information for Art by Tvesa orders, including international shipping and estimated timelines.' },
}

export default function PolicyPage({ policyKey, pageHandle }) {
  const [policy, setPolicy]   = useState(null)
  const [status, setStatus]   = useState('loading') // 'loading' | 'ok' | 'error'

  const config = POLICY_CONFIG[policyKey] ?? { title: pageHandle ? 'FAQs' : 'Policy' }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.add('shop-page')
    return () => document.body.classList.remove('shop-page')
  }, [])

  useEffect(() => {
    setStatus('loading')
    setPolicy(null)
    const fetch = pageHandle
      ? getShopPage(pageHandle)
      : getShopPolicy(policyKey)
    fetch
      .then(p => { setPolicy(p); setStatus('ok') })
      .catch(() => setStatus('error'))
  }, [policyKey, pageHandle])

  const title = policy?.title || config.title

  return (
    <>
      <Helmet>
        <title>{title} — Art by Tvesa</title>
        <meta name="description" content={config.desc || `${title} — Art by Tvesa.`} />
      </Helmet>
      <Navbar />

      <main className="policy-main">
        <div className="policy-content">
          <h1 className="policy-title">{title}</h1>

          {status === 'loading' && (
            <p className="policy-loading">Loading…</p>
          )}

          {status === 'error' && (
            <p className="policy-loading">Could not load policy. Please try again later.</p>
          )}

          {status === 'ok' && (
            policy?.body ? (
              <div
                className="policy-body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(policy.body, {
                    ALLOWED_TAGS: ['p','ul','ol','li','a','b','i','em','strong','br',
                                   'h1','h2','h3','h4','h5','h6','blockquote','span','div'],
                    ALLOWED_ATTR: ['href','target','rel','class'],
                  })
                }}
              />
            ) : (
              <p>Content coming soon. Please check back shortly.</p>
            )
          )}
        </div>
      </main>

      <ShopCart />
      <ShopFooter />
    </>
  )
}
