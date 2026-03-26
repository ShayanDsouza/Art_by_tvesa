// src/hooks/useFetchArtworks.js
// ---------------------------------------------------------
// A reusable hook that fetches all artworks from Firestore.
// Returns: { artworks, loading, error }
// Each artwork document should have:
//   - id (auto)
//   - title (string)
//   - category (string)  e.g. "portraits", "sketches"
//   - imageUrl (string)  Firebase Storage download URL
//   - order (number)     for sorting
//   - featured (bool)    whether it appears on homepage
//   - tags (array)       optional tag strings
// ---------------------------------------------------------

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";

export function useFetchArtworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const q = query(collection(db, "artworks"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArtworks(data);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  return { artworks, loading, error };
}