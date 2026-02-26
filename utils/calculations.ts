/**
 * Calculate recommended price range
 * Recommended Min: -5% of base price
 * Recommended Max: +20% of base price
 */
export function calculateRecommendedRange(basePrice: number) {
  if (basePrice <= 0) {
    throw new Error('Base price must be positive')
  }

  const recommendedMin = Math.round(basePrice * 0.95 * 100) / 100 // -5%
  const recommendedMax = Math.round(basePrice * 1.20 * 100) / 100 // +20%

  return {
    recommendedMin,
    recommendedMax
  }
}

/**
 * Format currency (EUR)
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Round to nearest .00, .20, .40, .60, or .80
 */
export function roundToSpecialDecimals(value: number): number {
  const integerPart = Math.floor(value)
  const decimalPart = value - integerPart

  // Define the allowed decimal values
  const allowedDecimals = [0.00, 0.20, 0.40, 0.60, 0.80]

  // Find the closest allowed decimal
  let closestDecimal = allowedDecimals[0]
  let minDiff = Math.abs(decimalPart - allowedDecimals[0])

  for (const allowed of allowedDecimals) {
    const diff = Math.abs(decimalPart - allowed)
    if (diff < minDiff) {
      minDiff = diff
      closestDecimal = allowed
    }
  }

  return integerPart + closestDecimal
}
