import { AnalyticsEventSchema, type AnalyticsEvent } from '../schemas/analyticsEvent'

export interface EventAggregation {
  eventType: string
  count: number
  uniqueUsers: number
  timestamp: number
}

export interface SellerMetrics {
  totalEvents: number
  productViews: number
  cartAdds: number
  checkouts: number
  conversionRate: number
  averageOrderValue: number
}

export function aggregateEventsByType(events: AnalyticsEvent[]): EventAggregation[] {
  const grouped = events.reduce(
    (acc, event) => {
      if (!acc[event.eventType]) {
        acc[event.eventType] = {
          eventType: event.eventType,
          count: 0,
          uniqueUsers: new Set<string>(),
          timestamp: Date.now(),
        }
      }
      acc[event.eventType].count++
      acc[event.eventType].uniqueUsers.add(event.userId)
      return acc
    },
    {} as Record<string, any>
  )

  return Object.values(grouped).map(item => ({
    eventType: item.eventType,
    count: item.count,
    uniqueUsers: item.uniqueUsers.size,
    timestamp: item.timestamp,
  }))
}

export function calculateSellerMetrics(events: AnalyticsEvent[], sellerId: string): SellerMetrics {
  const sellerEvents = events.filter(e => e.sellerId === sellerId)

  const totalEvents = sellerEvents.length
  const productViews = sellerEvents.filter(e => e.eventType === 'product_view').length
  const cartAdds = sellerEvents.filter(e => e.eventType === 'cart_add').length
  const checkouts = sellerEvents.filter(e => e.eventType === 'checkout').length

  const conversionRate = totalEvents > 0 ? checkouts / productViews : 0
  const averageOrderValue = checkouts > 0 ? sellerEvents.filter(e => e.eventType === 'checkout').reduce((sum, e) => sum + (e.metadata?.orderValue || 0), 0) / checkouts : 0

  return {
    totalEvents,
    productViews,
    cartAdds,
    checkouts,
    conversionRate,
    averageOrderValue,
  }
}

export function getTopProductsByViews(events: AnalyticsEvent[], limit = 10): { productId: string; views: number }[] {
  const grouped = events
    .filter(e => e.eventType === 'product_view')
    .reduce(
      (acc, event) => {
        const productId = event.metadata?.productId as string
        if (productId) {
          acc[productId] = (acc[productId] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

  return Object.entries(grouped)
    .map(([productId, views]) => ({ productId, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}
