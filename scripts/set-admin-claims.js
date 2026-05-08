/**
 * set-admin-claims.js
 * Run this ONCE per admin user to grant the Firebase `admin: true` custom claim.
 *
 * Prerequisites:
 *   1. Download your Firebase service account key:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *      Save it as `scripts/service-account.json`  (this file is gitignored)
 *
 *   2. Install the Admin SDK (one-time):
 *      npm install firebase-admin --save-dev
 *
 * Usage:
 *   node scripts/set-admin-claims.js <email@example.com>
 *
 * Example:
 *   node scripts/set-admin-claims.js dsouza.shayan@gmail.com
 *   node scripts/set-admin-claims.js aravpradosh06427@gmail.com
 *
 * After running, the user must sign out and sign back in for the claim to take effect.
 */

const admin = require('firebase-admin')
const serviceAccount = require('./service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/set-admin-claims.js <email>')
  process.exit(1)
}

admin.auth().getUserByEmail(email)
  .then(user => admin.auth().setCustomUserClaims(user.uid, { admin: true }))
  .then(() => {
    console.log(`✓ admin: true claim set for ${email}`)
    console.log('  The user must sign out and sign back in for the claim to activate.')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
