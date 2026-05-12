import { z } from 'zod'

export const ShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  provider: z.string(),
  trackingNumber: z.string().optional(),
  status: z.enum(['label_created','in_transit','delivered','returned','exception']),
  estimatedDelivery: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Shipment = z.infer<typeof ShipmentSchema>
