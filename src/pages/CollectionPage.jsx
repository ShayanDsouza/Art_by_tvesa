import { useEffect } from "react"
import Navbar from "../components/Navbar"
import GridGallery from "../components/GridGallery"
import Footer from "../components/Footer"

export default function CollectionPage() {
  useEffect(() => {
    document.body.classList.add('collection-page')
    return () => document.body.classList.remove('collection-page')
  }, [])

  return (
    <>
      <Navbar />
      <GridGallery />
      <Footer />
    </>
  )
}
