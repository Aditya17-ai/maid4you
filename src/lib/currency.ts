/**
 * Format amount in INR currency
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format amount in INR with custom symbol
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`
  } else {
    return `₹${amount.toFixed(0)}`
  }
}

/**
 * Convert amount to paise (smallest unit in INR)
 */
export function toPaise(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert paise to rupees
 */
export function fromPaise(paise: number): number {
  return paise / 100
}

/**
 * Validate INR amount
 */
export function isValidINRAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000000 // Max 1 crore
}

/**
 * Round amount to nearest rupee
 */
export function roundToNearestRupee(amount: number): number {
  return Math.round(amount)
}

/**
 * Calculate service tax for India (18% GST)
 */
export function calculateGST(amount: number, rate: number = 18): number {
  return (amount * rate) / 100
}

/**
 * Get total amount including GST
 */
export function getTotalWithGST(amount: number, gstRate: number = 18): number {
  const gst = calculateGST(amount, gstRate)
  return amount + gst
}

/**
 * Parse INR string to number
 */
export function parseINR(inrString: string): number {
  // Remove currency symbols and parse
  const cleanString = inrString.replace(/[₹,\s]/g, '')
  const amount = parseFloat(cleanString)
  return isNaN(amount) ? 0 : amount
}
