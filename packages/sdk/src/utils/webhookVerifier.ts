import { createHmac } from 'crypto'

export interface WebhookPayload {
  order_id: string
  status_code: string
  gross_amount: number | string
  signature_key: string
  [key: string]: any
}

export function verifyMidtransWebhook(payload: WebhookPayload, serverKey: string): boolean {
  if (!payload.order_id || !payload.status_code || !payload.gross_amount || !payload.signature_key) {
    return false
  }

  // Midtrans signature: SHA512(orderId + statusCode + grossAmount + serverKey)
  const dataToSign = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`
  const hash = createHmac('sha512', '')
    .update(dataToSign)
    .digest('hex')

  return hash === payload.signature_key
}

export function verifyXenditWebhook(payload: any, apiKey: string): boolean {
  if (!payload.id || !payload.callback_url || !payload.x_idempotency_key) {
    return false
  }

  // Xendit uses X-Callback-Token header which should be verified in HTTP headers
  // For now, simple validation of required fields
  return !!payload.id && !!payload.status
}

export function verifyStripeWebhook(payload: any, signature: string, endpointSecret: string): boolean {
  if (!signature || !endpointSecret) {
    return false
  }

  try {
    const hash = createHmac('sha256', endpointSecret)
      .update(JSON.stringify(payload))
      .digest('hex')

    return `t=timestamp,v1=${hash}` === signature || hash === signature.split(',')[1]?.split('=')[1]
  } catch (err) {
    return false
  }
}

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'refunded' | 'failed'

export const paymentStatusMap: Record<string, PaymentStatus> = {
  // Midtrans status codes
  '201': 'pending',
  '200': 'paid',
  '202': 'paid',
  '407': 'expired',
  '408': 'expired',
  '409': 'expired',
  '410': 'failed',
  '411': 'refunded',
  // Xendit status codes
  'COMPLETED': 'paid',
  'EXPIRED': 'expired',
  'FAILED': 'failed',
  // Stripe status
  'succeeded': 'paid',
  'failed': 'failed',
}

export function mapGatewayStatusToPaymentStatus(status: string, gateway: string): PaymentStatus {
  return paymentStatusMap[status] || 'pending'
}
