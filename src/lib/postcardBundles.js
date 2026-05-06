const BUNDLE_SIZES = [3, 6, 11]

function getBundleSource(input) {
  if (typeof input === 'string') return input
  if (!input) return ''
  return `${input.handle ?? ''} ${input.title ?? ''}`.trim()
}

export function getPostcardBundleSize(input) {
  const source = getBundleSource(input).toLowerCase()
  const match = source.match(/set(?:\s+|-)?of(?:(?:\s+|-)?any)?(?:\s+|-)?(3|6|11)\b/)
  return match ? Number(match[1]) : null
}

export function isPostcardBundleProduct(input) {
  return BUNDLE_SIZES.includes(getPostcardBundleSize(input))
}

export function sortPostcardProducts(products = []) {
  const bundleOrder = new Map(BUNDLE_SIZES.map((size, index) => [size, index]))

  return [...products].sort((a, b) => {
    const aSize = getPostcardBundleSize(a)
    const bSize = getPostcardBundleSize(b)

    if (aSize && bSize) return bundleOrder.get(aSize) - bundleOrder.get(bSize)
    if (aSize) return -1
    if (bSize) return 1
    return 0
  })
}

export function buildPostcardBundleAttributes(selectedProducts, bundleSize) {
  const titles = selectedProducts.map(product => product.title).filter(Boolean)
  const handles = selectedProducts.map(product => product.handle).filter(Boolean)

  return [
    { key: 'bundle_type', value: `Postcard Set of ${bundleSize}` },
    { key: 'bundle_size', value: String(bundleSize) },
    { key: 'postcard_selection', value: titles.join(' | ') },
    { key: 'postcard_handles', value: handles.join(',') },
  ]
}

/* Builds cart attributes from a counts object: { [handle]: quantity }
   Repeats a design's title/handle once per unit selected. */
export function buildPostcardBundleAttributesFromCounts(counts, allOptions, bundleSize) {
  const titles = []
  const handles = []
  for (const [handle, count] of Object.entries(counts)) {
    if (!count) continue
    const product = allOptions.find(p => p.handle === handle)
    if (!product) continue
    for (let i = 0; i < count; i++) {
      titles.push(product.title)
      handles.push(product.handle)
    }
  }
  return [
    { key: 'bundle_type', value: `Postcard Set of ${bundleSize}` },
    { key: 'bundle_size', value: String(bundleSize) },
    { key: 'postcard_selection', value: titles.join(' | ') },
    { key: 'postcard_handles', value: handles.join(',') },
  ]
}
