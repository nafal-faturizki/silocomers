import { z } from 'zod'

export const SellerSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  storageEndpoint: z.string().url().optional(),
  verified: z.boolean().default(false),
  trustLevel: z.number().int().min(0).max(5).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Seller = z.infer<typeof SellerSchema>
