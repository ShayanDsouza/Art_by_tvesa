import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import Navbar from "../components/Navbar"
import GridGallery from "../components/GridGallery"
import Contact from "../components/Contact"
import Footer from "../components/Footer"

export default function CollectionPage() {
  useEffect(() => {
    // Always start at the top of the page, instantly (no smooth scroll)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Re-apply stored dark preference while on this page
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark')
    }
    document.body.classList.add('collection-page')
    return () => {
      document.body.classList.remove('collection-page')
      // Remove dark class when leaving archives — dark mode is archives-only
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Archives — Art by Tvesa</title>
        <meta name="description" content="Browse the full archive of paintings and artworks by Tvesa Medh. Acrylic, oil, and mixed media — filter by medium, style, or search by name." />
        <meta property="og:title" content="Archives — Art by Tvesa" />
        <meta property="og:description" content="Browse the full archive of paintings and artworks by Tvesa Medh." />
        <meta property="og:url" content="https://artbytvesa.com/archives" />
        <link rel="canonical" href="https://artbytvesa.com/archives" />
      </Helmet>
      <Navbar />
      <GridGallery />
      <Contact />
      <Footer />
    </>
  )
}