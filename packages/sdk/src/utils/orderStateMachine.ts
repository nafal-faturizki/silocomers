import { type Order } from '../schemas/order'

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'disputed'

export const OrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'refunded', 'disputed'],
  processing: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['confirmed', 'disputed'],
  confirmed: ['completed'],
  completed: [],
  cancelled: [],
  refunded: [],
  disputed: ['refunded', 'confirmed'],
}

export function canTransitionOrder(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  const allowed = OrderStatusTransitions[currentStatus]
  return allowed ? allowed.includes(nextStatus) : false
}

export function transitionOrderStatus(order: Order, newStatus: OrderStatus): Order {
  const currentStatus = (order.status || 'pending') as OrderStatus
  
  if (!canTransitionOrder(currentStatus, newStatus)) {
    throw new Error(
      `Cannot transition order status from "${currentStatus}" to "${newStatus}". ` +
      `Allowed transitions: ${OrderStatusTransitions[currentStatus]?.join(', ') || 'none'}`
    )
  }

  return {
    ...order,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Menunggu Pembayaran',
    paid: 'Pembayaran Dikonfirmasi',
    processing: 'Diproses Penjual',
    ready_to_ship: 'Siap Dikirim',
    shipped: 'Dalam Pengiriman',
    delivered: 'Terkirim',
    confirmed: 'Dikonfirmasi Pembeli',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    refunded: 'Dana Dikembalikan',
    disputed: 'Dalam Sengketa',
  }
  return labels[status] || status
}
