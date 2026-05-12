import { type Order } from '../schemas/order'
import { type Escrow } from '../schemas/escrow'
import { generateId } from './id'

export interface PaymentProcessedEvent {
  orderId: string
  status: 'success' | 'failed'
  gateway: string
  transactionId: string
  amount: number
  paidAt: string
  reason?: string
}

export function createEscrowFromPayment(order: Order, payment: PaymentProcessedEvent, platformFeePercent = 0.05): Escrow {
  const platformFee = Math.round(payment.amount * platformFeePercent)
  const sellerAmount = payment.amount - platformFee
  
  // Auto-release after 3 days
  const autoReleaseDate = new Date()
  autoReleaseDate.setDate(autoReleaseDate.getDate() + 3)
  
  return {
    id: generateId(),
    orderId: order.id,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    amount: payment.amount,
    platformFee,
    sellerAmount,
    status: 'held',
    paymentGateway: payment.gateway,
    gatewayTransactionId: payment.transactionId,
    heldAt: payment.paidAt,
    releasedAt: null,
    disputeOpenedAt: null,
    resolvedAt: null,
    autoReleaseAt: autoReleaseDate.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function calculatePlatformFee(amount: number, feePercent = 0.05): number {
  return Math.round(amount * feePercent)
}

export function calculateSellerAmount(amount: number, platformFee: number): number {
  return amount - platformFee
}

export interface PaymentRetryConfig {
  maxRetries: number
  backoffMs: number
  backoffMultiplier: number
}

export const DEFAULT_PAYMENT_RETRY_CONFIG: PaymentRetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
}

export function calculateBackoffDelay(attempt: number, config: PaymentRetryConfig): number {
  return config.backoffMs * Math.pow(config.backoffMultiplier, attempt - 1)
}

export interface PaymentStatusReason {
  status: string
  code: string
  message: string
  recoverable: boolean
}

export const paymentStatusReasons: Record<string, PaymentStatusReason> = {
  'INSUFFICIENT_FUNDS': {
    status: 'failed',
    code: 'INSUFFICIENT_FUNDS',
    message: 'Dana tidak mencukup',
    recoverable: true,
  },
  'CARD_DECLINED': {
    status: 'failed',
    code: 'CARD_DECLINED',
    message: 'Kartu ditolak',
    recoverable: true,
  },
  'INVALID_CARD': {
    status: 'failed',
    code: 'INVALID_CARD',
    message: 'Nomor kartu tidak valid',
    recoverable: false,
  },
  'TIMEOUT': {
    status: 'pending',
    code: 'TIMEOUT',
    message: 'Timeout, coba lagi',
    recoverable: true,
  },
  'GATEWAY_ERROR': {
    status: 'pending',
    code: 'GATEWAY_ERROR',
    message: 'Error gateway, coba lagi',
    recoverable: true,
  },
}
