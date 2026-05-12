import { z } from 'zod'

export const AnalyticsEventSchema = z.object({
  id: z.string(),
  sellerId: z.string().optional(),
  buyerId: z.string().optional(),
  timestamp: z.string().datetime(),
  eventType: z.enum(['product_view', 'product_click', 'add_to_cart', 'purchase', 'wishlist_add', 'search', 'live_join']),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>
