import { z } from 'zod'

export const OrderItemSchema = z.object({
  productId: z.string(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
})

export const OrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  status: z.enum(['pending','paid','shipped','completed','cancelled']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Order = z.infer<typeof OrderSchema>
