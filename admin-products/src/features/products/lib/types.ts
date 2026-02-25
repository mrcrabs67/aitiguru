export type Product = {
    id: number
    title: string
    price: number
    rating: number
    brand?: string
    sku?: string
    category?: string
    thumbnail?: string
}

export type ProductsResponse = {
    products: Product[]
    total: number
    skip: number
    limit: number
}

export type SortOrder = 'asc' | 'desc'
export type SortBy = 'title' | 'brand' | 'sku' | 'rating' | 'price'

export type AddProductForm = {
    title: string
    price: string
    brand: string
    sku: string
}
