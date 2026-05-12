import { z } from 'zod'

export const ShippingAddressSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  name: z.string(),
  phone: z.string(),
  provinceId: z.string().optional(),
  provinceName: z.string(),
  cityId: z.string().optional(),
  cityName: z.string(),
  district: z.string(),
  postalCode: z.string(),
  address: z.string(),
  isDefault: z.boolean().default(false),
})

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>
