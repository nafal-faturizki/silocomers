import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price: z.number().int().min(100),
  compareAtPrice: z.number().int().min(0).optional(),
  category: z.array(z.string()).min(1).max(3),
  tags: z.array(z.string()).max(20).optional(),
  variants: z.array(z.object({ sku: z.string().optional(), attributes: z.record(z.string()), stock: z.number().int().min(0), price: z.number().int().min(0) })).optional(),
  assets: z.object({
    images: z.array(z.string().url()).min(1).max(10),
    video: z.string().url().optional(),
    thumbnail: z.string().url().optional(),
  }),
  weight_gram: z.number().int().min(1),
  status: z.enum(['draft', 'active', 'suspended', 'deleted']),
  deletedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>
