export interface RecommendationContext {
  buyerId: string
  recentViews: string[] // product IDs
  recentPurchases: string[]
  categories: string[]
}

export interface RecommendableProduct {
  id: string
  name: string
  category: string[]
  tags: string[]
  views: number
  sales: number
  createdAt: string
}

export function getTrendingProducts(products: RecommendableProduct[], limit = 10): RecommendableProduct[] {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  return products
    .filter(p => new Date(p.createdAt).getTime() > oneDayAgo)
    .sort((a, b) => (b.views + b.sales) - (a.views + a.sales))
    .slice(0, limit)
}

export function getContentBasedRecommendations(
  context: RecommendationContext,
  products: RecommendableProduct[],
  limit = 5
): RecommendableProduct[] {
  const recentViewIds = new Set(context.recentViews)
  const recentViewTags = context.categories

  const candidates = products
    .filter(p => !recentViewIds.has(p.id))
    .filter(p => p.category.some(c => recentViewTags.includes(c)))
    .sort((a, b) => (b.views + b.sales) - (a.views + a.sales))

  return candidates.slice(0, limit)
}

export function getNewArrivalsRecommendations(products: RecommendableProduct[], limit = 5): RecommendableProduct[] {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  return products
    .filter(p => new Date(p.createdAt).getTime() > oneDayAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}
