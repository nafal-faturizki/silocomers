import { z } from 'zod'

export const BuyerSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Buyer = z.infer<typeof BuyerSchema>
