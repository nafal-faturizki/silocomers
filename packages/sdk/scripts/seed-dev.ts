import fs from 'fs'
import path from 'path'
import { generateId } from '../src/utils/id'
import { exampleProduct } from '../src/index'
import { SellerSchema } from '../src/schemas/seller'

const outBase = path.resolve(__dirname, '../dev-data')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

ensureDir(outBase)
ensureDir(path.join(outBase, 'metadata'))
ensureDir(path.join(outBase, 'metadata', 'sellers'))
ensureDir(path.join(outBase, 'metadata', 'products'))

const sellerId = generateId()
const seller = {
  id: sellerId,
  name: 'Contoh Seller',
  email: 'seller@example.com',
  phone: '+628000000000',
  storageEndpoint: 'https://cdn.seller.example.com/',
  verified: true,
  trustLevel: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

SellerSchema.parse(seller)
fs.writeFileSync(path.join(outBase, 'metadata', 'sellers', `${sellerId}.json`), JSON.stringify(seller, null, 2))

const prod = exampleProduct()
prod.id = generateId()
prod.sellerId = sellerId
prod.createdAt = new Date().toISOString()
prod.updatedAt = prod.createdAt

fs.writeFileSync(path.join(outBase, 'metadata', 'products', `${prod.id}.json`), JSON.stringify(prod, null, 2))

// eslint-disable-next-line no-console
console.log('Seeded dev data to', outBase)
