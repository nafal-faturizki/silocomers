import fs from 'fs/promises'
import path from 'path'
import { ProductSchema, type Product } from './schemas/product'

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
