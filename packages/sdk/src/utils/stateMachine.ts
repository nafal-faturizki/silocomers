import { Product } from '../schemas/product'

export const allowedTransitions: Record<string, string[]> = {
  draft: ['pending', 'deleted'],
  pending: ['active', 'suspended', 'deleted'],
  active: ['suspended', 'deleted'],
  suspended: ['active', 'deleted'],
  deleted: [],
}

export function canTransition(from: string, to: string) {
  const allowed = allowedTransitions[from]
  return Array.isArray(allowed) && allowed.includes(to)
}

export function transitionProductStatus(product: Product, to: string): Product {
  if (!canTransition(product.status, to)) {
    throw new Error(`invalid transition from ${product.status} to ${to}`)
  }
  product.status = to as any
  product.updatedAt = new Date().toISOString()
  if (to === 'deleted') product.deletedAt = new Date().toISOString()
  return product
}
