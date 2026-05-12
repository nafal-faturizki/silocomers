import fs from 'fs/promises'
import path from 'path'
import { ProductSchema, type Product } from './schemas/product'
import { CartSchema, type Cart } from './schemas/cart'
import { OrderSchema, type Order } from './schemas/order'
import { EscrowSchema, type Escrow } from './schemas/escrow'

const baseDir = path.resolve(__dirname, '../../dev-data/metadata')

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function saveProduct(product: Product) {
  const parsed = ProductSchema.parse(product)
  const dir = path.join(baseDir, 'products')
  await ensureDir(dir)
  const file = path.join(dir, `${parsed.id}.json`)
  await fs.writeFile(file, JSON.stringify(parsed, null, 2), 'utf-8')
  return file
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const file = path.join(baseDir, 'products', `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const obj = JSON.parse(raw)
    return ProductSchema.parse(obj)
  } catch (err) {
    return null
  }
}

export async function softDeleteProduct(id: string) {
  const product = await getProduct(id)
  if (!product) return null
  product.status = 'deleted'
  product.deletedAt = new Date().toISOString()
  await saveProduct(product)
  return product
}

export async function bulkImportProducts(products: Product[]) {
  const results: string[] = []
  for (const p of products) {
    const file = await saveProduct(p)
    results.push(file)
  }
  return results
}

import { SellerSchema, type Seller } from './schemas/seller'

export async function saveSeller(seller: Seller) {
  const parsed = SellerSchema.parse(seller)
  const dir = path.join(baseDir, 'sellers')
  await ensureDir(dir)
  const file = path.join(dir, `${parsed.id}.json`)
  await fs.writeFile(file, JSON.stringify(parsed, null, 2), 'utf-8')
  return file
}

export async function getSeller(id: string): Promise<Seller | null> {
  try {
    const file = path.join(baseDir, 'sellers', `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const obj = JSON.parse(raw)
    return SellerSchema.parse(obj)
  } catch (err) {
    return null
  }
}

// Cart storage
export async function saveCart(cart: Cart) {
  const parsed = CartSchema.parse(cart)
  const dir = path.join(baseDir, 'carts')
  await ensureDir(dir)
  const file = path.join(dir, `${parsed.id}.json`)
  await fs.writeFile(file, JSON.stringify(parsed, null, 2), 'utf-8')
  return file
}

export async function getCart(id: string): Promise<Cart | null> {
  try {
    const file = path.join(baseDir, 'carts', `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const obj = JSON.parse(raw)
    return CartSchema.parse(obj)
  } catch (err) {
    return null
  }
}

export async function deleteCart(id: string): Promise<boolean> {
  try {
    const file = path.join(baseDir, 'carts', `${id}.json`)
    await fs.unlink(file)
    return true
  } catch (err) {
    return false
  }
}

// Order storage
export async function saveOrder(order: Order) {
  const parsed = OrderSchema.parse(order)
  const dir = path.join(baseDir, 'orders')
  await ensureDir(dir)
  const file = path.join(dir, `${parsed.id}.json`)
  await fs.writeFile(file, JSON.stringify(parsed, null, 2), 'utf-8')
  return file
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const file = path.join(baseDir, 'orders', `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const obj = JSON.parse(raw)
    return OrderSchema.parse(obj)
  } catch (err) {
    return null
  }
}

// Escrow storage
export async function saveEscrow(escrow: Escrow) {
  const parsed = EscrowSchema.parse(escrow)
  const dir = path.join(baseDir, 'escrows')
  await ensureDir(dir)
  const file = path.join(dir, `${parsed.id}.json`)
  await fs.writeFile(file, JSON.stringify(parsed, null, 2), 'utf-8')
  return file
}

export async function getEscrow(id: string): Promise<Escrow | null> {
  try {
    const file = path.join(baseDir, 'escrows', `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const obj = JSON.parse(raw)
    return EscrowSchema.parse(obj)
  } catch (err) {
    return null
  }
}

export async function getEscrowByOrderId(orderId: string): Promise<Escrow | null> {
  try {
    const dir = path.join(baseDir, 'escrows')
    const files = await fs.readdir(dir)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const raw = await fs.readFile(path.join(dir, file), 'utf-8')
        const escrow = JSON.parse(raw)
        if (escrow.orderId === orderId) {
          return EscrowSchema.parse(escrow)
        }
      }
    }
    return null
  } catch (err) {
    return null
  }
}

export async function findEscrowsReadyForRelease(): Promise<Escrow[]> {
  try {
    const dir = path.join(baseDir, 'escrows')
    const files = await fs.readdir(dir)
    const now = new Date()
    const ready: Escrow[] = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const raw = await fs.readFile(path.join(dir, file), 'utf-8')
        const escrow = JSON.parse(raw)
        
        // Check if auto-release time has passed
        if (escrow.status === 'held' && escrow.autoReleaseAt) {
          const autoReleaseTime = new Date(escrow.autoReleaseAt)
          if (autoReleaseTime <= now) {
            ready.push(EscrowSchema.parse(escrow))
          }
        }
      }
    }
    return ready
  } catch (err) {
    return []
  }
}

export async function releaseEscrow(escrowId: string): Promise<Escrow | null> {
  const escrow = await getEscrow(escrowId)
  if (!escrow) return null
  
  escrow.status = 'released'
  escrow.releasedAt = new Date().toISOString()
  await saveEscrow(escrow)
  return escrow
}

export async function refundEscrow(escrowId: string): Promise<Escrow | null> {
  const escrow = await getEscrow(escrowId)
  if (!escrow) return null
  
  escrow.status = 'refunded'
  escrow.releasedAt = new Date().toISOString()
  await saveEscrow(escrow)
  return escrow
}

export async function disputeEscrow(escrowId: string): Promise<Escrow | null> {
  const escrow = await getEscrow(escrowId)
  if (!escrow) return null
  
  escrow.status = 'disputed'
  escrow.disputeOpenedAt = new Date().toISOString()
  await saveEscrow(escrow)
  return escrow
}

export async function resolveEscrowDispute(escrowId: string, resolutionType: 'release' | 'refund'): Promise<Escrow | null> {
  const escrow = await getEscrow(escrowId)
  if (!escrow || escrow.status !== 'disputed') return null
  
  if (resolutionType === 'release') {
    escrow.status = 'released'
  } else {
    escrow.status = 'refunded'
  }
  escrow.resolvedAt = new Date().toISOString()
  await saveEscrow(escrow)
  return escrow
}
