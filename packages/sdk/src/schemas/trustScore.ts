import { z } from 'zod'

export const TrustScoreSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  score: z.number().min(0).max(100),
  badge: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  components: z.object({
    verificationScore: z.number().min(0).max(30),
    transactionScore: z.number().min(0).max(40),
    serviceScore: z.number().min(0).max(20),
    activityScore: z.number().min(0).max(10),
  }),
  updatedAt: z.string().datetime(),
  historyAt: z.string().datetime().optional(),
})

export type TrustScore = z.infer<typeof TrustScoreSchema>
