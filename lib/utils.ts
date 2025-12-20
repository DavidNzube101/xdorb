import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to convert UI amount to raw token amount (base units)
export const parseUnits = (amount: string, decimals: number): number => {
  if (!amount || isNaN(parseFloat(amount))) return 0
  // Handle simple cases, might need BigInt for very high precision but for this UI purpose, this is often sufficient.
  // However, for correct blockchain math, we should ideally work with integers.
  // Let's use simple math for now as we pass 'number' to Jupiter API helper which converts to string.
  return Math.floor(parseFloat(amount) * (10 ** decimals))
}

// Function to convert raw token amount (base units) to UI amount
export const formatUnits = (amount: string | number | bigint, decimals: number): string => {
  let val: bigint
  try {
     val = BigInt(amount)
  } catch {
     val = BigInt(0)
  }

  if (val === BigInt(0)) return '0'

  const divisor = BigInt(10 ** decimals)
  const integer = val / divisor
  const fraction = val % divisor

  // Pad fraction with leading zeros if necessary
  let fractionString = fraction.toString()
  
  // If fraction is 0, just return integer
  if (fraction === BigInt(0)) return integer.toString()

  fractionString = fractionString.padStart(decimals, '0')

  // Remove trailing zeros
  fractionString = fractionString.replace(/0+$/, '')

  if (fractionString === '') {
    return integer.toString()
  }

  return `${integer.toString()}.${fractionString}`
}

// Helper for shortening Solana address
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}
