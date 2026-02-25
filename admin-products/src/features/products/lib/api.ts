import type { ProductsResponse, SortBy, SortOrder } from './types'

export async function fetchProducts(params: {
    limit: number
    skip: number
    search?: string
    sortBy?: SortBy | null
    sortOrder?: SortOrder
}): Promise<ProductsResponse> {
    const baseUrl = params.search
        ? 'https://dummyjson.com/products/search'
        : 'https://dummyjson.com/products'

    const url = new URL(baseUrl)
    url.searchParams.set('limit', String(params.limit))
    url.searchParams.set('skip', String(params.skip))

    if (params.search) {
        url.searchParams.set('q', params.search)
    }

    if (params.sortBy) {
        url.searchParams.set('sortBy', params.sortBy)
        url.searchParams.set('order', params.sortOrder ?? 'asc')
    }

    const res = await fetch(url.toString())
    if (!res.ok) {
        throw new Error('Failed to load products')
    }

    return res.json()
}
