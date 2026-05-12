import { PaymentTransaction } from '../schemas/payment'

export interface PaymentGateway {
  name: string
  createTransaction(orderId: string, amount: number): Promise<PaymentTransaction>
  verifyWebhook(payload: any, signature: string): boolean
  refund(transactionId: string, amount: number): Promise<boolean>
}

export class MidtransAdapter implements PaymentGateway {
  name = 'midtrans'
  serverKey: string

  constructor(serverKey: string) {
    this.serverKey = serverKey
  }

  async createTransaction(orderId: string, amount: number): Promise<PaymentTransaction> {
    return {
      id: `${this.name}-${orderId}`,
      orderId,
      gateway: 'midtrans',
      gatewayTransactionId: orderId,
      amount,
      currency: 'IDR',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // Midtrans signature: SHA512(orderId + statusCode + grossAmount + serverKey)
    // Placeholder: in prod, compute hash and compare
    return true
  }

  async refund(transactionId: string, amount: number): Promise<boolean> {
    // Placeholder: call Midtrans refund API
    return true
  }
}

export function getPaymentGateway(name: string, apiKey: string): PaymentGateway {
  switch (name) {
    case 'midtrans':
      return new MidtransAdapter(apiKey)
    default:
      return new MidtransAdapter(apiKey)
  }
}
