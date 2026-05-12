export { ProductSchema, type Product } from './schemas/product'
export { slugify } from './utils/slug'
export { softDeleteProduct, bulkImportProducts } from './storage'
export { transitionProductStatus, canTransition } from './utils/stateMachine'

export const exampleProduct = (): Product => ({
  id: '01TEST',
  sellerId: '01SELLER',
  name: 'Contoh Produk',
  price: 10000,
  slug: 'contoh-produk',
  category: ['uncategorized'],
  tags: [],
  assets: { images: ['https://example.com/img.jpg'] },
  weight_gram: 100,
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export { saveProduct, getProduct } from './storage'
export { saveSeller, getSeller } from './storage'
export { saveCart, getCart, deleteCart } from './storage'
export { saveOrder, getOrder } from './storage'
export { saveEscrow, getEscrow, getEscrowByOrderId, findEscrowsReadyForRelease, releaseEscrow, refundEscrow, disputeEscrow, resolveEscrowDispute } from './storage'
export { generateId } from './utils/id'
export { saveRefreshToken, verifyAndRotateRefreshToken, revokeRefreshToken } from './utils/tokens'

// Fase 2-3 Schemas
export { CartSchema, CartItemSchema, type Cart, type CartItem } from './schemas/cart'
export { PaymentTransactionSchema, type PaymentTransaction } from './schemas/payment'
export { EscrowSchema, EscrowStatusEnum, type Escrow } from './schemas/escrow'
export { ShippingAddressSchema, type ShippingAddress } from './schemas/shippingAddress'
export { TrustScoreSchema, type TrustScore } from './schemas/trustScore'
export { AnalyticsEventSchema, EventTypeEnum, type AnalyticsEvent } from './schemas/analyticsEvent'

// Fase 2-3 Utilities
export { calculateTrustScore } from './utils/trustScore'
export { scoreSearchMatch, searchProducts, type SearchProduct } from './utils/search'
export { getTrendingProducts, getContentBasedRecommendations, getNewArrivalsRecommendations, type RecommendationContext, type RecommendableProduct } from './utils/recommendation'
export { aggregateEventsByType, calculateSellerMetrics, getTopProductsByViews, type EventAggregation, type SellerMetrics } from './utils/analytics'
export { validateCartForCheckout, calculateCheckoutTotal, lockProductStock, releaseProductStock, type CheckoutRequest, type CheckoutResult } from './utils/checkout'
export { PaymentGateway, MidtransAdapter, type PaymentGatewayConfig } from './utils/paymentGateway'
export { verifyMidtransWebhook, verifyXenditWebhook, verifyStripeWebhook, mapGatewayStatusToPaymentStatus, type WebhookPayload, type PaymentStatus } from './utils/webhookVerifier'
export { transitionOrderStatus, canTransitionOrder, getOrderStatusLabel, type OrderStatus } from './utils/orderStateMachine'
export { createEscrowFromPayment, calculatePlatformFee, calculateSellerAmount, calculateBackoffDelay, type PaymentProcessedEvent, type PaymentRetryConfig, type PaymentStatusReason } from './utils/payment'

// Additional Utilities
export { sendOtp, verifyOtp } from './utils/otp'
export { allow } from './utils/rateLimiter'
export { generateCsrfToken, getCookieToken, CSRF_COOKIE_NAME } from './utils/csrf'
export { canTransition as canTransitionProduct } from './utils/stateMachine'
export { googleAuthUrl, githubAuthUrl, exchangeCodePlaceholder } from './utils/oauth'
export { sendSmsOtp } from './utils/sms'

// Additional Schemas
export { SellerSchema, SellerVerificationLevelEnum, type Seller } from './schemas/seller'
export { BuyerSchema, type Buyer } from './schemas/buyer'
export { OrderSchema, OrderItemSchema, OrderStatusEnum, type Order, type OrderItem } from './schemas/order'
export { ShipmentSchema, ShipmentStatusEnum, type Shipment } from './schemas/shipment'
