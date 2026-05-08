const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const nodemailer = require('nodemailer')

initializeApp()

const gmailUser = defineSecret('GMAIL_USER')
const gmailPass = defineSecret('GMAIL_APP_PASSWORD')

// Escape user-supplied strings before embedding in HTML
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

exports.notifyNewMessage = onDocumentCreated(
  {
    document: 'messages/{messageId}',
    secrets: [gmailUser, gmailPass],
    region: 'us-central1',
  },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser.value(),
        pass: gmailPass.value(),
      },
    })

    await transporter.sendMail({
      from: `"Art by Tvesa" <${gmailUser.value()}>`,
      to: 'artbytvesa@gmail.com',
      replyTo: data.email,
      subject: `New message from ${esc(data.name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#6b2d5e;margin-bottom:4px">New contact message</h2>
          <p style="color:#666;margin-top:0;font-size:0.9rem">Received via Art by Tvesa</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:80px">From</td>
              <td style="padding:8px 12px">${esc(data.name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td>
              <td style="padding:8px 12px"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td>
            </tr>
          </table>
          <div style="background:#fafafa;border-left:3px solid #6b2d5e;padding:12px 16px;white-space:pre-wrap">${esc(data.message)}</div>
          <p style="margin-top:20px">
            <a href="mailto:${esc(data.email)}?subject=Re: your message to Art by Tvesa"
               style="background:#6b2d5e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-size:0.9rem">
              Reply to ${esc(data.name)}
            </a>
          </p>
        </div>
      `,
    })
  }
)
