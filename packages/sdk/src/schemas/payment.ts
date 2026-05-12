import { z } from 'zod'

export const PaymentTransactionSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  gateway: z.enum(['midtrans', 'xendit', 'stripe']),
  gatewayTransactionId: z.string(),
  amount: z.number().int().min(0),
  currency: z.string().length(3).default('IDR'),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  method: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
})

export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>
