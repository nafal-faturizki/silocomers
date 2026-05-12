import { z } from 'zod'

export const EscrowSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  amount: z.number().int().min(0),
  platformFee: z.number().int().min(0),
  sellerAmount: z.number().int().min(0),
  status: z.enum(['pending_payment', 'held', 'released', 'refunded', 'disputed', 'resolved_release', 'resolved_refund']),
  paymentGateway: z.string(),
  gatewayTransactionId: z.string(),
  heldAt: z.string().datetime().nullable(),
  releasedAt: z.string().datetime().nullable(),
  disputeOpenedAt: z.string().datetime().nullable(),
  resolvedAt: z.string().datetime().nullable(),
  autoReleaseAt: z.string().datetime(),
})

export type Escrow = z.infer<typeof EscrowSchema>
