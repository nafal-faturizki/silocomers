export interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number
  category: string[]
  tags: string[]
  views: number
  sales: number
  rating: number
  sellerTrustScore: number
  createdAt: string
}

export function scoreSearchMatch(product: SearchProduct, query: string): number {
  const lowerQuery = query.toLowerCase()
  const nameMatch = product.name.toLowerCase().includes(lowerQuery) ? 0.35 : 0
  const tagMatch = product.tags.some(t => t.toLowerCase().includes(lowerQuery)) ? 0.15 : 0
  const categoryMatch = product.category.some(c => c.toLowerCase().includes(lowerQuery)) ? 0.05 : 0

  const popularity = Math.min(0.2, (product.views + product.sales) / 10000)
  const trustScore = (product.sellerTrustScore / 100) * 0.15
  const recency = ((Date.now() - new Date(product.createdAt).getTime()) / (90 * 24 * 60 * 60 * 1000)) * 0.1

  return nameMatch + tagMatch + categoryMatch + popularity + trustScore + recency
}

export function searchProducts(products: SearchProduct[], query: string, limit = 20): SearchProduct[] {
  if (!query.trim()) return products.slice(0, limit)

  const scored = products
    .map(p => ({ product: p, score: scoreSearchMatch(p, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map(item => item.product)
}
