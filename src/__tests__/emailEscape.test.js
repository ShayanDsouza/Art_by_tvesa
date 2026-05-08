import { describe, it, expect } from 'vitest'

// Replicate the esc() function from functions/index.js so we can test
// it in isolation without requiring firebase-admin / nodemailer.
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

describe('esc (HTML escaping for email notifications)', () => {
  it('escapes ampersands', () => {
    expect(esc('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('escapes less-than and greater-than', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes double quotes', () => {
    expect(esc('"quoted"')).toBe('&quot;quoted&quot;')
  })

  it('escapes single quotes', () => {
    expect(esc("it's")).toBe('it&#x27;s')
  })

  it('handles a full XSS payload', () => {
    const payload = '<img src=x onerror="alert(\'xss\')">'
    const result = esc(payload)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('"')
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })

  it('leaves plain text untouched', () => {
    expect(esc('Hello World')).toBe('Hello World')
  })

  it('handles null / undefined gracefully', () => {
    expect(esc(null)).toBe('')
    expect(esc(undefined)).toBe('')
  })

  it('handles non-string values', () => {
    expect(esc(42)).toBe('42')
    expect(esc(true)).toBe('true')
  })

  it('escapes multiple special chars in one string', () => {
    expect(esc('<a href="foo&bar">\'hi\'</a>')).toBe(
      '&lt;a href=&quot;foo&amp;bar&quot;&gt;&#x27;hi&#x27;&lt;/a&gt;'
    )
  })
})
