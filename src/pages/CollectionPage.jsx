import { useEffect } from "react"
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
      <Navbar />
      <GridGallery />
      <Contact />
      <Footer />
    </>
  )
}