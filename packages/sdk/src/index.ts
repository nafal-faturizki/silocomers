export { ProductSchema, type Product } from './schemas/product'

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
