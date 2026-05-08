import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'artbytvesa-region'

/** Country / region → display currency (prices in DB are always INR) */
/** ISO 3166-1 alpha-2 for https://flagcdn.com (EU uses `eu`) */
export const REGIONS = [
  { id: 'IN', name: 'India', currency: 'INR', flagCode: 'in' },
  { id: 'US', name: 'United States', currency: 'USD', flagCode: 'us' },
  { id: 'GB', name: 'United Kingdom', currency: 'GBP', flagCode: 'gb' },
  { id: 'EU', name: 'Eurozone', currency: 'EUR', flagCode: 'eu' },
  { id: 'CA', name: 'Canada', currency: 'CAD', flagCode: 'ca' },
  { id: 'AU', name: 'Australia', currency: 'AUD', flagCode: 'au' },
  { id: 'JP', name: 'Japan', currency: 'JPY', flagCode: 'jp' },
  { id: 'SG', name: 'Singapore', currency: 'SGD', flagCode: 'sg' },
  { id: 'AE', name: 'United Arab Emirates', currency: 'AED', flagCode: 'ae' },
]

export function regionFlagImgSrc(flagCode, width = 40) {
  return `https://flagcdn.com/w${width}/${flagCode}.png`
}

/** 1 INR = X target currency (used until API loads or if pair missing) */
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  CAD: 0.016,
  AUD: 0.018,
  JPY: 1.85,
  SGD: 0.016,
  AED: 0.044,
}

const CurrencyContext = createContext(null)

/** Extract numeric INR amount from admin-entered string (digits, optional decimals, optional commas) */
export function parseInrAmount(raw) {
  if (raw == null || raw === '') return null
  const match = String(raw).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const n = parseFloat(match[1])
  return Number.isFinite(n) ? n : null
}

function formatAmount(amount, currency) {
  const maxFrac = currency === 'JPY' || currency === 'KRW' ? 0 : 2
  const minFrac = currency === 'JPY' || currency === 'KRW' ? 0 : 0
  const locale =
    currency === 'INR' ? 'en-IN' :
    currency === 'EUR' ? 'de-DE' :
    currency === 'GBP' ? 'en-GB' :
    currency === 'AED' ? 'en-AE' :
    currency === 'SGD' ? 'en-SG' :
    'en-US'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: maxFrac,
      minimumFractionDigits: minFrac,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(maxFrac)}`
  }
}

export function CurrencyProvider({ children }) {
  const [regionId, setRegionId] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s && REGIONS.some((r) => r.id === s)) return s
      return 'IN'
    } catch {
      return 'IN'
    }
  })
  const [rates, setRates] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('https://api.exchangerate.host/latest?base=INR')
        const data = await res.json()
        if (cancelled) return
        if (data?.rates && typeof data.rates === 'object') {
          const upper = {}
          Object.entries(data.rates).forEach(([k, v]) => {
            if (typeof v === 'number' && Number.isFinite(v)) upper[k.toUpperCase()] = v
          })
          setRates({ INR: 1, ...upper })
        }
      } catch {
        if (!cancelled) setRates(null)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, regionId)
    } catch { /* ignore */ }
  }, [regionId])

  const region = useMemo(
    () => REGIONS.find((r) => r.id === regionId) || REGIONS[0],
    [regionId],
  )

  const getRate = useCallback(
    (currency) => {
      if (currency === 'INR') return 1
      const fromApi = rates?.[currency]
      if (fromApi != null && Number.isFinite(fromApi)) return fromApi
      return FALLBACK_RATES[currency] ?? FALLBACK_RATES.USD
    },
    [rates],
  )

  const formatPrice = useCallback(
    (priceString) => {
      if (priceString == null || priceString === '') return ''
      const inr = parseInrAmount(priceString)
      if (inr == null) return String(priceString)
      const cur = region.currency
      if (cur === 'INR') return formatAmount(inr, 'INR')
      const converted = inr * getRate(cur)
      return formatAmount(converted, cur)
    },
    [region, getRate],
  )

  const value = useMemo(
    () => ({
      regionId,
      setRegionId,
      region,
      regions: REGIONS,
      formatPrice,
      parseInrAmount,
      ratesReady: rates !== null,
    }),
    [regionId, region, formatPrice, rates],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
