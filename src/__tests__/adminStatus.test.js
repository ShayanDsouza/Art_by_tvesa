import { describe, it, expect } from 'vitest'

// These helpers are defined inline in AdminArtworks.jsx.
// We duplicate the pure-function logic here to keep tests framework-free
// (no JSX/Firebase imports needed) and to pin the expected behaviour.

const STATUS_ORDER = ['available', 'sold', 'not_for_sale']

function getStatusLabel(status) {
  if (status === 'sold') return 'Sold'
  if (status === 'not_for_sale') return 'Not for Sale'
  return 'Available'
}

function getNextStatus(status) {
  const currentIndex = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[(currentIndex + 1 + STATUS_ORDER.length) % STATUS_ORDER.length]
}

function getNextStatusActionLabel(status) {
  return `Mark ${getStatusLabel(getNextStatus(status))}`
}

// ── getStatusLabel ────────────────────────────────────────────────────────────

describe('getStatusLabel', () => {
  it('returns "Available" for available status', () => {
    expect(getStatusLabel('available')).toBe('Available')
  })

  it('returns "Sold" for sold status', () => {
    expect(getStatusLabel('sold')).toBe('Sold')
  })

  it('returns "Not for Sale" for not_for_sale status', () => {
    expect(getStatusLabel('not_for_sale')).toBe('Not for Sale')
  })

  it('returns "Available" for unknown status (safe default)', () => {
    expect(getStatusLabel('')).toBe('Available')
    expect(getStatusLabel(undefined)).toBe('Available')
    expect(getStatusLabel('unknown')).toBe('Available')
  })
})

// ── getNextStatus ─────────────────────────────────────────────────────────────

describe('getNextStatus', () => {
  it('cycles available → sold → not_for_sale → available', () => {
    expect(getNextStatus('available')).toBe('sold')
    expect(getNextStatus('sold')).toBe('not_for_sale')
    expect(getNextStatus('not_for_sale')).toBe('available')
  })

  it('wraps correctly — not_for_sale goes back to available', () => {
    expect(getNextStatus('not_for_sale')).toBe('available')
  })

  it('handles unknown status by falling back to first in order', () => {
    // indexOf returns -1, so (-1 + 1) % 3 = 0 → 'available'
    expect(getNextStatus('unknown')).toBe('available')
  })
})

// ── getNextStatusActionLabel ──────────────────────────────────────────────────

describe('getNextStatusActionLabel', () => {
  it('returns "Mark Sold" when current status is available', () => {
    expect(getNextStatusActionLabel('available')).toBe('Mark Sold')
  })

  it('returns "Mark Not for Sale" when current status is sold', () => {
    expect(getNextStatusActionLabel('sold')).toBe('Mark Not for Sale')
  })

  it('returns "Mark Available" when current status is not_for_sale', () => {
    expect(getNextStatusActionLabel('not_for_sale')).toBe('Mark Available')
  })
})
