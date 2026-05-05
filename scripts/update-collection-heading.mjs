import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyD_0vzJjTPWueP-s-zXijEGhi782LzzLUs',
  authDomain:        'art-by-tvesa.firebaseapp.com',
  projectId:         'art-by-tvesa',
  storageBucket:     'art-by-tvesa.firebasestorage.app',
  messagingSenderId: '1083392228166',
  appId:             '1:1083392228166:web:d228bd95ba38a17dda0347',
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

await setDoc(
  doc(db, 'siteContent', 'collection'),
  { heading: 'Archives' },
  { merge: true }
)

console.log('✓ siteContent/collection heading updated to "Archives"')
process.exit(0)
