import { z } from 'zod'
import { CartSchema, type Cart } from '../schemas/cart'
import { ProductSchema, type Product } from '../schemas/product'

export interface CheckoutRequest {
  buyerId: string
  cartId: string
  shippingAddressId: string
  couponCode?: string
}

export interface CheckoutResult {
  orderId: string
  totalAmount: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  status: 'pending_payment'
  paymentUrl?: string
}

export function validateCartForCheckout(cart: Cart, products: Map<string, Product>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (cart.items.length === 0) {
    errors.push('Cart is empty')
    return { valid: false, errors }
  }

  for (const item of cart.items) {
    const product = products.get(item.productId)
    if (!product) {
      errors.push(`Product ${item.productId} not found`)
      continue
    }

    if (product.status !== 'active') {
      errors.push(`Product ${item.productId} is not available for purchase`)
    }

    if (product.stock && product.stock < item.quantity) {
      errors.push(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
    }

    if (product.price <= 0) {
      errors.push(`Invalid price for product ${product.name}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function calculateCheckoutTotal(
  cart: Cart,
  products: Map<string, Product>,
  shippingCost = 0,
  discountRate = 0
): CheckoutResult {
  let subtotal = 0

  for (const item of cart.items) {
    const product = products.get(item.productId)
    if (product) {
      subtotal += product.price * item.quantity
    }
  }

  const discountAmount = Math.round(subtotal * discountRate)
  const taxAmount = Math.round((subtotal - discountAmount) * 0.1)
  const totalAmount = subtotal - discountAmount + taxAmount + shippingCost

  return {
    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    totalAmount,
    shippingCost,
    taxAmount,
    discountAmount,
    status: 'pending_payment',
  }
}

export function lockProductStock(product: Product, quantity: number): Product {
  return {
    ...product,
    stock: (product.stock || 0) - quantity,
  }
}

export function releaseProductStock(product: Product, quantity: number): Product {
  return {
    ...product,
    stock: (product.stock || 0) + quantity,
  }
}
