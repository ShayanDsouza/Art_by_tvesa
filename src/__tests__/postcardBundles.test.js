import { describe, expect, it } from 'vitest'
import {
  buildPostcardBundleAttributes,
  buildPostcardBundleAttributesFromCounts,
  getPostcardBundleSize,
  isPostcardBundleProduct,
  sortPostcardProducts,
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

  it('sorts bundle products ahead of non-bundles in configured bundle-size order', () => {
    const products = [
      { title: 'Single postcard', handle: 'single-card' },
      { title: 'Postcard Set of 11', handle: 'postcard-set-of-11' },
      { title: 'Postcard Set of 3', handle: 'postcard-set-of-3' },
      { title: 'Postcard Set of 6', handle: 'postcard-set-of-6' },
    ]

    const sorted = sortPostcardProducts(products)

    expect(sorted.map(p => p.title)).toEqual([
      'Postcard Set of 3',
      'Postcard Set of 6',
      'Postcard Set of 11',
      'Single postcard',
    ])
  })

  it('builds repeated selection attributes from counts', () => {
    const counts = {
      'dawn-raga': 2,
      'amber-sky': 1,
      unknown: 3,
      'monsoon-window': 0,
    }
    const options = [
      { title: 'Dawn Raga', handle: 'dawn-raga' },
      { title: 'Amber Sky', handle: 'amber-sky' },
      { title: 'Monsoon Window', handle: 'monsoon-window' },
    ]

    const attributes = buildPostcardBundleAttributesFromCounts(counts, options, 3)

    expect(attributes).toEqual([
      { key: 'bundle_type', value: 'Postcard Set of 3' },
      { key: 'bundle_size', value: '3' },
      { key: 'postcard_selection', value: 'Dawn Raga | Dawn Raga | Amber Sky' },
      { key: 'postcard_handles', value: 'dawn-raga,dawn-raga,amber-sky' },
    ])
  })
})
