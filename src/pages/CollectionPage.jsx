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
    document.body.classList.add('collection-page')
    return () => document.body.classList.remove('collection-page')
  }, [])

  return (
    <>
      <Helmet>
        <title>Archives — Art by Tvesa</title>
        <meta name="description" content="Browse the full archive of paintings and artworks by Tvesa Medh. Acrylic, oil, and mixed media — filter by medium, style, or search by name." />
        <meta property="og:title" content="Archives — Art by Tvesa" />
        <meta property="og:description" content="Browse the full archive of paintings and artworks by Tvesa Medh." />
        <meta property="og:url" content="https://artbytvesa.com/collection" />
        <link rel="canonical" href="https://artbytvesa.com/collection" />
      </Helmet>
      <Navbar />
      <GridGallery />
      <Contact />
      <Footer />
    </>
  )
}