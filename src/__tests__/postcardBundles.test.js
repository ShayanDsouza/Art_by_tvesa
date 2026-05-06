import { describe, expect, it } from 'vitest'
import {
  buildPostcardBundleAttributes,
  getPostcardBundleSize,
  isPostcardBundleProduct,
} from '../lib/postcardBundles'

describe('postcard bundle helpers', () => {
  it('detects bundle size from title or handle', () => {
    expect(getPostcardBundleSize('Set of 3')).toBe(3)
    expect(getPostcardBundleSize('Set of any 3')).toBe(3)
    expect(getPostcardBundleSize({ handle: 'postcard-set-of-6' })).toBe(6)
    expect(getPostcardBundleSize({ handle: 'postcard-set-of-any-6' })).toBe(6)
    expect(getPostcardBundleSize({ title: 'Postcard Set of 11' })).toBe(11)
    expect(getPostcardBundleSize({ title: 'Postcard Set of any 11' })).toBe(11)
    expect(getPostcardBundleSize('Single postcard')).toBeNull()
  })

  it('identifies postcard bundle products', () => {
    expect(isPostcardBundleProduct({ title: 'Set of 3 postcards' })).toBe(true)
    expect(isPostcardBundleProduct({ title: 'Set of any 6 postcards' })).toBe(true)
    expect(isPostcardBundleProduct({ handle: 'sunlit-studio-postcard' })).toBe(false)
  })

  it('builds line item attributes from selected postcards', () => {
    const attributes = buildPostcardBundleAttributes([
      { title: 'Dawn Raga', handle: 'dawn-raga' },
      { title: 'Amber Sky', handle: 'amber-sky' },
      { title: 'Monsoon Window', handle: 'monsoon-window' },
    ], 3)

    expect(attributes).toEqual([
      { key: 'bundle_type', value: 'Postcard Set of 3' },
      { key: 'bundle_size', value: '3' },
      { key: 'postcard_selection', value: 'Dawn Raga | Amber Sky | Monsoon Window' },
      { key: 'postcard_handles', value: 'dawn-raga,amber-sky,monsoon-window' },
    ])
  })
})
