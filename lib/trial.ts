import { Shop } from '@prisma/client'

export interface TrialStatus {
  isInTrial: boolean
  daysRemaining: number
  endedByFirstOrder: boolean
  trialEndsAt: Date | null
}

/**
 * Calculate trial status for a shop
 * Trial ends after:
 * 1. 7 days from registration, OR
 * 2. First accepted order
 * Whichever comes first
 */
export function getTrialStatus(shop: Shop): TrialStatus {
  // If trial already ended by first order
  if (shop.trialEndedByFirstOrder) {
    return {
      isInTrial: false,
      daysRemaining: 0,
      endedByFirstOrder: true,
      trialEndsAt: shop.trialEndsAt
    }
  }

  // Calculate 7-day trial period from registration
  const trialEndsAt = shop.trialEndsAt || new Date(shop.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()

  // Check if trial has expired
  if (now >= trialEndsAt) {
    return {
      isInTrial: false,
      daysRemaining: 0,
      endedByFirstOrder: false,
      trialEndsAt
    }
  }

  // Trial is still active
  const msRemaining = trialEndsAt.getTime() - now.getTime()
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000))

  return {
    isInTrial: true,
    daysRemaining,
    endedByFirstOrder: false,
    trialEndsAt
  }
}

/**
 * Initialize trial for a new shop (7 days from registration)
 */
export function initializeTrial(shop: Shop): Date {
  return new Date(shop.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
}
