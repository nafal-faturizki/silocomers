import { z } from 'zod'

export const CartItemSchema = z.object({
  productId: z.string(),
  sellerId: z.string(),
  variantSku: z.string().optional(),
  quantity: z.number().int().min(1),
  snapshotPrice: z.number().int().min(0),
  snapshotName: z.string(),
  snapshotImage: z.string().url(),
})

export const CartSchema = z.object({
  id: z.string(),
  buyerId: z.string().nullable(),
  items: z.array(CartItemSchema),
  appliedCoupon: z.string().optional(),
  updatedAt: z.string().datetime(),
})

export type CartItem = z.infer<typeof CartItemSchema>
export type Cart = z.infer<typeof CartSchema>
