import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import ShopCart from '../components/ShopCart'
import ShopFooter from '../components/ShopFooter'

export default function FaqsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.body.classList.add('shop-page')
    return () => document.body.classList.remove('shop-page')
  }, [])

  return (
    <>
      <Helmet>
        <title>FAQs — Art by Tvesa</title>
        <meta name="description" content="Frequently asked questions about Art by Tvesa." />
      </Helmet>
      <Navbar />

      <main className="policy-main">
        <div className="policy-content">
          <h1 className="policy-title">FAQs</h1>
          <p className="policy-updated">Last updated: May 2026</p>

          <p>Content coming soon. Please check back shortly.</p>
        </div>
      </main>

      <ShopCart />
      <ShopFooter />
    </>
  )
}
