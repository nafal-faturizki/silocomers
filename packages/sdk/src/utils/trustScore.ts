import { TrustScore } from '../schemas/trustScore'

export function calculateTrustScore(sellerStats: {
  emailVerified?: boolean
  phoneVerified?: boolean
  socialVerified?: boolean
  fulfillmentRate?: number
  onTimeRate?: number
  avgRating?: number
  monthsActive?: number
}): TrustScore {
  const verification = (sellerStats.emailVerified ? 5 : 0) +
    (sellerStats.phoneVerified ? 5 : 0) +
    (sellerStats.socialVerified ? 10 : 0)

  const transaction = (sellerStats.fulfillmentRate || 0) * 0.3 +
    (sellerStats.onTimeRate || 0) * 0.2

  const service = Math.min(20, (sellerStats.avgRating || 0) * 4)

  const activity = Math.min(10, (sellerStats.monthsActive || 0) * 0.5)

  const verificationScore = Math.min(30, verification)
  const transactionScore = Math.min(40, transaction)
  const serviceScore = Math.min(20, service)
  const activityScore = Math.min(10, activity)

  const score = verificationScore + transactionScore + serviceScore + activityScore

  let badge: 'bronze' | 'silver' | 'gold' | 'platinum' | undefined
  if (score >= 80) badge = 'platinum'
  else if (score >= 60) badge = 'gold'
  else if (score >= 40) badge = 'silver'
  else if (score >= 20) badge = 'bronze'

  return {
    id: `trust-${Date.now()}`,
    sellerId: 'unknown',
    score: Math.round(score),
    badge,
    components: {
      verificationScore,
      transactionScore,
      serviceScore,
      activityScore,
    },
    updatedAt: new Date().toISOString(),
  }
}
