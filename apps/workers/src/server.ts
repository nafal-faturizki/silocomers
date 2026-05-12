import http from 'http'
import { parse } from 'url'
import { generateId, saveSeller, getSeller, saveProduct, getProduct, exampleProduct, saveRefreshToken, verifyAndRotateRefreshToken, revokeRefreshToken, slugify, softDeleteProduct, bulkImportProducts, transitionProductStatus, saveCart, getCart, deleteCart, saveOrder, getOrder, saveEscrow, getEscrow, getEscrowByOrderId, findEscrowsReadyForRelease, releaseEscrow, refundEscrow, disputeEscrow, resolveEscrowDispute, validateCartForCheckout, calculateCheckoutTotal, searchProducts, getTrendingProducts, getContentBasedRecommendations, getNewArrivalsRecommendations, aggregateEventsByType, calculateSellerMetrics, verifyMidtransWebhook, mapGatewayStatusToPaymentStatus, transitionOrderStatus, createEscrowFromPayment } from '../../../packages/sdk/src/index'
import { sendOtp, verifyOtp } from '../../../packages/sdk/src/utils/otp'
import { allow as rateAllow } from '../../../packages/sdk/src/utils/rateLimiter'
import { googleAuthUrl, githubAuthUrl, exchangeCodePlaceholder } from '../../../packages/sdk/src/utils/oauth'
import { sendSmsOtp } from '../../../packages/sdk/src/utils/sms'
import { generateCsrfToken, getCookieToken, COOKIE_NAME } from '../../../packages/sdk/src/utils/csrf'

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787

function jsonRes(res: http.ServerResponse, status: number, obj: any) {
  const body = JSON.stringify(obj)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(body)
}

async function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = parse(req.url || '', true)
  const method = (req.method || 'GET').toUpperCase()

  if (method === 'POST' && url.pathname === '/auth/register') {
    const ip = req.socket.remoteAddress || 'unknown'
    if (!rateAllow(`register:${ip}`)) return jsonRes(res, 429, { error: 'rate_limited' })
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const id = generateId()
    const user = { id, name: data.name || 'User', email: data.email }
    return jsonRes(res, 201, { id, user })
  }

  if (method === 'POST' && url.pathname === '/auth/login') {
    const ip = req.socket.remoteAddress || 'unknown'
    if (!rateAllow(`login:${ip}`)) return jsonRes(res, 429, { error: 'rate_limited' })
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    // placeholder: accept any credentials
    const id = generateId()
    // create refresh token and return
    const refreshToken = saveRefreshToken(id)
    return jsonRes(res, 200, { accessToken: `token-${id}`, refreshToken, user: { id, email: data.email } })
  }

  if (method === 'POST' && url.pathname === '/auth/send-otp') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.to) return jsonRes(res, 400, { error: 'missing to' })
    sendOtp(data.to)
    return jsonRes(res, 200, { ok: true })
  }

  if (method === 'POST' && url.pathname === '/auth/send-sms-otp') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.to) return jsonRes(res, 400, { error: 'missing to' })
    await sendSmsOtp(data.to)
    return jsonRes(res, 200, { ok: true })
  }

  if (method === 'POST' && url.pathname === '/auth/verify-otp') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.to || !data.code) return jsonRes(res, 400, { error: 'missing fields' })
    const ok = verifyOtp(data.to, data.code)
    return jsonRes(res, ok ? 200 : 401, { ok })
  }

  if (method === 'GET' && url.pathname === '/auth/me') {
    // placeholder: return anonymous
    return jsonRes(res, 200, { user: null })
  }

  if (method === 'GET' && url.pathname === '/csrf') {
    const token = generateCsrfToken()
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/`)
    return jsonRes(res, 200, { csrf: token })
  }

    // OAuth start endpoints (dev-only placeholders) — redirect to provider
    if (method === 'GET' && url.pathname === '/auth/oauth/google/start') {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || 'GOOGLE_CLIENT_ID'
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT || 'http://localhost:8787/auth/oauth/google/callback'
      return jsonRes(res, 302, { redirect: googleAuthUrl({ clientId, redirectUri }) })
    }

    if (method === 'GET' && url.pathname === '/auth/oauth/github/start') {
      const clientId = process.env.GITHUB_OAUTH_CLIENT_ID || 'GITHUB_CLIENT_ID'
      const redirectUri = process.env.GITHUB_OAUTH_REDIRECT || 'http://localhost:8787/auth/oauth/github/callback'
      return jsonRes(res, 302, { redirect: githubAuthUrl({ clientId, redirectUri }) })
    }

    // OAuth callback (dev placeholder) — exchange code and return a local user token
    if (method === 'GET' && url.pathname === '/auth/oauth/google/callback') {
      const code = url.query.code as string
      const result = await exchangeCodePlaceholder('google', code || 'no-code')
      const id = generateId()
      const refreshToken = saveRefreshToken(id)
      return jsonRes(res, 200, { accessToken: `token-${id}`, refreshToken, external: result })
    }

    if (method === 'GET' && url.pathname === '/auth/oauth/github/callback') {
      const code = url.query.code as string
      const result = await exchangeCodePlaceholder('github', code || 'no-code')
      const id = generateId()
      const refreshToken = saveRefreshToken(id)
      return jsonRes(res, 200, { accessToken: `token-${id}`, refreshToken, external: result })
    }

  if (method === 'POST' && url.pathname === '/auth/refresh') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const token = data.refreshToken
    if (!token) return jsonRes(res, 400, { error: 'missing refreshToken' })
    const result = verifyAndRotateRefreshToken(token)
    if (!result) return jsonRes(res, 401, { error: 'invalid refresh token' })
    const accessToken = `token-${generateId()}`
    return jsonRes(res, 200, { accessToken, refreshToken: result.newToken, user: { id: result.userId } })
  }

  if (method === 'POST' && url.pathname === '/auth/logout') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const headerToken = req.headers['x-csrf-token'] as string | undefined
    const cookieToken = getCookieToken(req.headers.cookie)
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return jsonRes(res, 403, { error: 'csrf_mismatch' })
    }
    const token = data.refreshToken
    if (token) revokeRefreshToken(token)
    return jsonRes(res, 200, { ok: true })
  }

  // Seller onboarding
  if (method === 'POST' && url.pathname === '/sellers/register') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const id = generateId()
    const seller = {
      id,
      name: data.name || 'Seller',
      email: data.email,
      phone: data.phone,
      storageEndpoint: data.storageEndpoint || undefined,
      verified: false,
      trustLevel: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await saveSeller(seller as any)
    return jsonRes(res, 201, { seller })
  }

  if (method === 'GET' && url.pathname && url.pathname.startsWith('/sellers/')) {
    const id = url.pathname.replace('/sellers/', '')
    const seller = await getSeller(id)
    if (!seller) return jsonRes(res, 404, { error: 'not found' })
    return jsonRes(res, 200, { seller })
  }

  // Product catalog
  if (method === 'POST' && url.pathname === '/products') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const prod = exampleProduct()
    prod.id = generateId()
    prod.sellerId = data.sellerId || prod.sellerId
    prod.name = data.name || prod.name
    prod.slug = (data.slug || slugify(prod.name))
    prod.price = data.price || prod.price
    prod.createdAt = new Date().toISOString()
    prod.updatedAt = prod.createdAt
    await saveProduct(prod as any)
    return jsonRes(res, 201, { product: prod })
  }

  if (method === 'DELETE' && url.pathname && url.pathname.startsWith('/products/')) {
    const id = url.pathname.replace('/products/', '')
    const deleted = await softDeleteProduct(id)
    if (!deleted) return jsonRes(res, 404, { error: 'not found' })
    return jsonRes(res, 200, { product: deleted })
  }

  if (method === 'POST' && url.pathname === '/products/bulk') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '[]')
    if (!Array.isArray(data)) return jsonRes(res, 400, { error: 'expected array' })
    const results = await bulkImportProducts(data)
    return jsonRes(res, 201, { files: results })
  }

  if (method === 'POST' && url.pathname && url.pathname.startsWith('/products/') && url.pathname.includes('/transition')) {
    const id = url.pathname.split('/products/')[1].split('/transition')[0]
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const to = data.to
    if (!to) return jsonRes(res, 400, { error: 'missing to' })
    const product = await getProduct(id)
    if (!product) return jsonRes(res, 404, { error: 'not found' })
    try {
      const updated = transitionProductStatus(product as any, to)
      await saveProduct(updated as any)
      return jsonRes(res, 200, { product: updated })
    } catch (e: any) {
      return jsonRes(res, 400, { error: e.message })
    }
  }

  if (method === 'GET' && url.pathname && url.pathname.startsWith('/products/')) {
    const id = url.pathname.replace('/products/', '')
    const product = await getProduct(id)
    if (!product) return jsonRes(res, 404, { error: 'not found' })
    return jsonRes(res, 200, { product })
  }

  // Cart endpoints
  if (method === 'POST' && url.pathname === '/cart') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const cart = {
      id: generateId(),
      buyerId: data.buyerId || null,
      items: [],
      appliedCoupon: undefined,
      updatedAt: new Date().toISOString(),
    }
    await saveCart(cart as any)
    return jsonRes(res, 201, { cart })
  }

  if (method === 'GET' && url.pathname && url.pathname.startsWith('/cart/')) {
    const id = url.pathname.replace('/cart/', '')
    const cart = await getCart(id)
    if (!cart) return jsonRes(res, 404, { error: 'cart not found' })
    return jsonRes(res, 200, { cart })
  }

  if (method === 'POST' && url.pathname === '/cart/items') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.cartId) return jsonRes(res, 400, { error: 'missing cartId' })
    const cart = await getCart(data.cartId)
    if (!cart) return jsonRes(res, 404, { error: 'cart not found' })
    
    const product = await getProduct(data.productId)
    if (!product) return jsonRes(res, 404, { error: 'product not found' })
    
    const item = {
      productId: data.productId,
      sellerId: product.sellerId,
      variantSku: data.variantSku || 'default',
      quantity: data.quantity || 1,
      snapshotPrice: product.price,
      snapshotName: product.name,
      snapshotImage: product.assets?.images?.[0] || '',
    }
    
    const existing = cart.items.find(i => i.productId === data.productId && i.variantSku === item.variantSku)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.items.push(item)
    }
    cart.updatedAt = new Date().toISOString()
    await saveCart(cart as any)
    return jsonRes(res, 200, { cart })
  }

  if (method === 'PUT' && url.pathname && url.pathname.startsWith('/cart/items/')) {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.cartId) return jsonRes(res, 400, { error: 'missing cartId' })
    
    const itemKey = url.pathname.replace('/cart/items/', '')
    const [productId, variantSku] = itemKey.split(':')
    
    const cart = await getCart(data.cartId)
    if (!cart) return jsonRes(res, 404, { error: 'cart not found' })
    
    const item = cart.items.find(i => i.productId === productId && i.variantSku === (variantSku || 'default'))
    if (!item) return jsonRes(res, 404, { error: 'item not found in cart' })
    
    item.quantity = data.quantity || 1
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i !== item)
    }
    cart.updatedAt = new Date().toISOString()
    await saveCart(cart as any)
    return jsonRes(res, 200, { cart })
  }

  if (method === 'DELETE' && url.pathname && url.pathname.startsWith('/cart/items/')) {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    if (!data.cartId) return jsonRes(res, 400, { error: 'missing cartId' })
    
    const itemKey = url.pathname.replace('/cart/items/', '')
    const [productId, variantSku] = itemKey.split(':')
    
    const cart = await getCart(data.cartId)
    if (!cart) return jsonRes(res, 404, { error: 'cart not found' })
    
    cart.items = cart.items.filter(i => !(i.productId === productId && i.variantSku === (variantSku || 'default')))
    cart.updatedAt = new Date().toISOString()
    await saveCart(cart as any)
    return jsonRes(res, 200, { cart })
  }

  if (method === 'DELETE' && url.pathname && url.pathname.startsWith('/cart/')) {
    const id = url.pathname.replace('/cart/', '')
    const success = await deleteCart(id)
    if (!success) return jsonRes(res, 404, { error: 'cart not found' })
    return jsonRes(res, 200, { ok: true })
  }

  // Checkout endpoint
  if (method === 'POST' && url.pathname === '/checkout') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.cartId || !data.buyerId) return jsonRes(res, 400, { error: 'missing cartId or buyerId' })
    
    const cart = await getCart(data.cartId)
    if (!cart) return jsonRes(res, 404, { error: 'cart not found' })
    if (cart.items.length === 0) return jsonRes(res, 400, { error: 'cart is empty' })
    
    // Build product map for validation
    const productMap = new Map()
    for (const item of cart.items) {
      const product = await getProduct(item.productId)
      if (product) {
        productMap.set(item.productId, product)
      }
    }
    
    // Validate cart
    const validation = validateCartForCheckout(cart as any, productMap)
    if (!validation.valid) {
      return jsonRes(res, 400, { error: 'validation_failed', details: validation.errors })
    }
    
    // Calculate checkout totals
    const checkoutResult = calculateCheckoutTotal(cart as any, productMap, data.shippingCost || 0, data.discountRate || 0)
    
    // Create order from cart
    const order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      buyerId: data.buyerId,
      sellerId: cart.items[0]?.sellerId || 'UNKNOWN',
      items: cart.items.map(item => ({
        productId: item.productId,
        sku: item.variantSku,
        quantity: item.quantity,
        price: item.snapshotPrice,
      })),
      totalAmount: checkoutResult.totalAmount,
      currency: 'IDR',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    await saveOrder(order as any)
    return jsonRes(res, 201, { order: checkoutResult })
  }

  if (method === 'GET' && url.pathname && url.pathname.startsWith('/orders/')) {
    const id = url.pathname.replace('/orders/', '')
    const order = await getOrder(id)
    if (!order) return jsonRes(res, 404, { error: 'order not found' })
    return jsonRes(res, 200, { order })
  }

  // Search endpoint
  if (method === 'GET' && url.pathname === '/search' && url.query.q) {
    const query = url.query.q as string
    try {
      const fs = require('fs/promises')
      const path = require('path')
      const productsDir = path.resolve(__dirname, '../../packages/sdk/dev-data/metadata/products')
      const files = await fs.readdir(productsDir)
      const products: any[] = []
      for (const file of files) {
        if (file.endsWith('.json')) {
          const raw = await fs.readFile(path.join(productsDir, file), 'utf-8')
          const prod = JSON.parse(raw)
          products.push({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            category: prod.category || [],
            tags: prod.tags || [],
            views: Math.floor(Math.random() * 1000),
            sales: Math.floor(Math.random() * 100),
            rating: 4.5,
            sellerTrustScore: 85,
            createdAt: prod.createdAt,
          })
        }
      }
      const results = searchProducts(products, query)
      return jsonRes(res, 200, { results, total: results.length })
    } catch (err) {
      return jsonRes(res, 200, { results: [], total: 0 })
    }
  }

  // Trending products endpoint
  if (method === 'GET' && url.pathname === '/trending') {
    try {
      const fs = require('fs/promises')
      const path = require('path')
      const productsDir = path.resolve(__dirname, '../../packages/sdk/dev-data/metadata/products')
      const files = await fs.readdir(productsDir)
      const products = []
      for (const file of files) {
        if (file.endsWith('.json')) {
          const raw = await fs.readFile(path.join(productsDir, file), 'utf-8')
          const prod = JSON.parse(raw)
          products.push({
            id: prod.id,
            name: prod.name,
            category: prod.category,
            tags: prod.tags,
            views: Math.floor(Math.random() * 1000),
            sales: Math.floor(Math.random() * 100),
            createdAt: prod.createdAt,
          })
        }
      }
      const results = getTrendingProducts(products as any, 10)
      return jsonRes(res, 200, { results, total: results.length })
    } catch (err) {
      return jsonRes(res, 200, { results: [], total: 0 })
    }
  }

  // Recommendations endpoint (content-based)
  if (method === 'POST' && url.pathname === '/recommendations') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    try {
      const fs = require('fs/promises')
      const path = require('path')
      const productsDir = path.resolve(__dirname, '../../packages/sdk/dev-data/metadata/products')
      const files = await fs.readdir(productsDir)
      const products = []
      for (const file of files) {
        if (file.endsWith('.json')) {
          const raw = await fs.readFile(path.join(productsDir, file), 'utf-8')
          const prod = JSON.parse(raw)
          products.push({
            id: prod.id,
            name: prod.name,
            category: prod.category,
            tags: prod.tags,
            views: Math.floor(Math.random() * 1000),
            sales: Math.floor(Math.random() * 100),
            createdAt: prod.createdAt,
          })
        }
      }
      
      let results = []
      if (data.type === 'trending') {
        results = getTrendingProducts(products as any, data.limit || 5)
      } else if (data.type === 'new-arrivals') {
        results = getNewArrivalsRecommendations(products as any, data.limit || 5)
      } else if (data.type === 'content-based' && data.categories) {
        const context = {
          buyerId: data.buyerId || 'guest',
          recentViews: data.recentViews || [],
          recentPurchases: data.recentPurchases || [],
          categories: data.categories,
        }
        results = getContentBasedRecommendations(context, products as any, data.limit || 5)
      }
      
      return jsonRes(res, 200, { results, total: results.length })
    } catch (err) {
      return jsonRes(res, 200, { results: [], total: 0 })
    }
  }

  // Analytics ingestion endpoint
  if (method === 'POST' && url.pathname === '/analytics/events') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.eventType || !data.userId || !data.sellerId) {
      return jsonRes(res, 400, { error: 'missing required fields: eventType, userId, sellerId' })
    }
    
    const event = {
      id: generateId(),
      userId: data.userId,
      sellerId: data.sellerId,
      eventType: data.eventType,
      metadata: data.metadata || {},
      timestamp: new Date().toISOString(),
    }
    
    try {
      const fs = require('fs/promises')
      const path = require('path')
      const eventsDir = path.resolve(__dirname, '../../packages/sdk/dev-data/metadata/events')
      await fs.mkdir(eventsDir, { recursive: true })
      const file = path.join(eventsDir, `${event.id}.json`)
      await fs.writeFile(file, JSON.stringify(event, null, 2), 'utf-8')
      return jsonRes(res, 201, { event })
    } catch (err: any) {
      return jsonRes(res, 500, { error: 'failed to save event', details: err.message })
    }
  }

  // Analytics aggregation endpoint
  if (method === 'GET' && url.pathname === '/analytics/seller' && url.query.sellerId) {
    const sellerId = url.query.sellerId as string
    
    try {
      const fs = require('fs/promises')
      const path = require('path')
      const eventsDir = path.resolve(__dirname, '../../packages/sdk/dev-data/metadata/events')
      
      let events: any[] = []
      try {
        const files = await fs.readdir(eventsDir)
        for (const file of files) {
          if (file.endsWith('.json')) {
            const raw = await fs.readFile(path.join(eventsDir, file), 'utf-8')
            const event = JSON.parse(raw)
            if (event.sellerId === sellerId) {
              events.push(event)
            }
          }
        }
      } catch (err) {
        // Events directory might not exist yet
      }
      
      const metrics = calculateSellerMetrics(events, sellerId)
      return jsonRes(res, 200, { metrics, eventCount: events.length })
    } catch (err: any) {
      return jsonRes(res, 500, { error: 'failed to calculate metrics', details: err.message })
    }
  }

  // Payment webhook handlers
  if (method === 'POST' && url.pathname === '/webhooks/payment/midtrans') {
    let body = ''
    for await (const chunk of req) body += chunk
    const payload = JSON.parse(body || '{}')
    
    // Verify webhook signature (dev: skip verification for now)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'dev-server-key'
    // const isValid = verifyMidtransWebhook(payload, serverKey)
    // if (!isValid) return jsonRes(res, 401, { error: 'invalid_signature' })
    
    const orderId = payload.order_id
    if (!orderId) return jsonRes(res, 400, { error: 'missing order_id' })
    
    const order = await getOrder(orderId)
    if (!order) return jsonRes(res, 404, { error: 'order not found' })
    
    // Map gateway status to payment status
    const paymentStatus = mapGatewayStatusToPaymentStatus(payload.status_code, 'midtrans')
    
    if (paymentStatus === 'paid') {
      // Update order status to paid
      const updated = transitionOrderStatus(order as any, 'paid')
      await saveOrder(updated)
      
      // Create escrow on payment success
      const escrow = createEscrowFromPayment(updated, {
        orderId: updated.id,
        status: 'success',
        gateway: 'midtrans',
        transactionId: payload.transaction_id || orderId,
        amount: parseInt(payload.gross_amount) || 0,
        paidAt: new Date().toISOString(),
      })
      
      await saveEscrow(escrow)
      return jsonRes(res, 200, { ok: true, orderId, status: paymentStatus, escrowId: escrow.id })
    } else if (paymentStatus === 'expired' || paymentStatus === 'failed') {
      // Update order status to cancelled
      try {
        const updated = transitionOrderStatus(order as any, 'cancelled')
        await saveOrder(updated)
      } catch (err) {
        // Order might already be in a state we can't transition from
      }
      return jsonRes(res, 200, { ok: true, orderId, status: paymentStatus })
    }
    
    return jsonRes(res, 200, { ok: true, orderId, status: paymentStatus })
  }

  if (method === 'POST' && url.pathname === '/webhooks/payment/xendit') {
    let body = ''
    for await (const chunk of req) body += chunk
    const payload = JSON.parse(body || '{}')
    
    const transactionId = payload.id
    if (!transactionId) return jsonRes(res, 400, { error: 'missing transaction id' })
    
    // Find order by transaction ID (would need to store transaction ID in order)
    // For now, use external_id if available
    const orderId = payload.external_id
    if (!orderId) return jsonRes(res, 400, { error: 'missing external_id' })
    
    const order = await getOrder(orderId)
    if (!order) return jsonRes(res, 404, { error: 'order not found' })
    
    const paymentStatus = mapGatewayStatusToPaymentStatus(payload.status, 'xendit')
    
    if (paymentStatus === 'paid') {
      const updated = transitionOrderStatus(order as any, 'paid')
      await saveOrder(updated)
      
      const escrow = createEscrowFromPayment(updated, {
        orderId: updated.id,
        status: 'success',
        gateway: 'xendit',
        transactionId,
        amount: payload.amount || 0,
        paidAt: new Date().toISOString(),
      })
      
      await saveEscrow(escrow)
      return jsonRes(res, 200, { ok: true, orderId, status: paymentStatus, escrowId: escrow.id })
    }
    
    return jsonRes(res, 200, { ok: true, orderId, status: paymentStatus })
  }

  // Escrow management endpoints
  if (method === 'GET' && url.pathname && url.pathname.startsWith('/escrow/')) {
    const id = url.pathname.replace('/escrow/', '')
    const escrow = await getEscrow(id)
    if (!escrow) return jsonRes(res, 404, { error: 'escrow not found' })
    return jsonRes(res, 200, { escrow })
  }

  if (method === 'GET' && url.pathname === '/escrow/by-order' && url.query.orderId) {
    const orderId = url.query.orderId as string
    const escrow = await getEscrowByOrderId(orderId)
    if (!escrow) return jsonRes(res, 404, { error: 'escrow not found' })
    return jsonRes(res, 200, { escrow })
  }

  if (method === 'POST' && url.pathname === '/escrow/release') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.escrowId) return jsonRes(res, 400, { error: 'missing escrowId' })
    
    const released = await releaseEscrow(data.escrowId)
    if (!released) return jsonRes(res, 404, { error: 'escrow not found' })
    return jsonRes(res, 200, { escrow: released })
  }

  if (method === 'POST' && url.pathname === '/escrow/refund') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.escrowId) return jsonRes(res, 400, { error: 'missing escrowId' })
    
    const refunded = await refundEscrow(data.escrowId)
    if (!refunded) return jsonRes(res, 404, { error: 'escrow not found' })
    return jsonRes(res, 200, { escrow: refunded })
  }

  if (method === 'POST' && url.pathname === '/escrow/dispute') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.escrowId) return jsonRes(res, 400, { error: 'missing escrowId' })
    
    const disputed = await disputeEscrow(data.escrowId)
    if (!disputed) return jsonRes(res, 404, { error: 'escrow not found' })
    return jsonRes(res, 200, { escrow: disputed })
  }

  if (method === 'POST' && url.pathname === '/escrow/resolve') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    
    if (!data.escrowId || !data.resolutionType) {
      return jsonRes(res, 400, { error: 'missing escrowId or resolutionType' })
    }
    
    if (!['release', 'refund'].includes(data.resolutionType)) {
      return jsonRes(res, 400, { error: 'invalid resolutionType (must be release or refund)' })
    }
    
    const resolved = await resolveEscrowDispute(data.escrowId, data.resolutionType)
    if (!resolved) return jsonRes(res, 404, { error: 'escrow not found or not in dispute status' })
    return jsonRes(res, 200, { escrow: resolved })
  }

  // Cron handler simulator for auto-release escrow
  if (method === 'POST' && url.pathname === '/cron/escrow-auto-release') {
    try {
      const ready = await findEscrowsReadyForRelease()
      
      for (const escrow of ready) {
        await releaseEscrow(escrow.id)
      }
      
      return jsonRes(res, 200, { released: ready.length, escrows: ready.map(e => e.id) })
    } catch (err: any) {
      return jsonRes(res, 500, { error: 'auto-release failed', details: err.message })
    }
  }

  jsonRes(res, 404, { error: 'route not found' })
}

const server = http.createServer((req, res) => {
  handler(req, res).catch(err => {
    // eslint-disable-next-line no-console
    console.error(err)
    jsonRes(res, 500, { error: 'internal' })
  })
})

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Workers-dev server listening on http://localhost:${PORT}`)
})
