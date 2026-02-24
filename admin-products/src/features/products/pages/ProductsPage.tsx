import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '../../../shared/lib/useDebounce' // поправь путь, если другой

type Product = {
    id: number
    title: string
    price: number
    rating: number
    brand?: string
    sku?: string
}

type ProductsResponse = {
    products: Product[]
    total: number
    skip: number
    limit: number
}

type SortOrder = 'asc' | 'desc'
type SortBy = 'title' | 'brand' | 'sku' | 'rating' | 'price'

async function fetchProducts(params: {
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

const getSortLabel = (active: boolean, order: SortOrder) => {
    if (!active) return ''
    return order === 'asc' ? ' ▲' : ' ▼'
}

export const ProductsPage = () => {
    const [page, setPage] = useState(1)
    const limit = 10
    const skip = useMemo(() => (page - 1) * limit, [page, limit])

    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 500)

    const [sortBy, setSortBy] = useState<SortBy | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    const toggleSort = (col: SortBy) => {
        setPage(1)
        if (sortBy === col) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(col)
            setSortOrder('asc')
        }
    }

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: [
            'products',
            { limit, skip, search: debouncedSearch, sortBy, sortOrder },
        ],
        queryFn: () =>
            fetchProducts({
                limit,
                skip,
                search: debouncedSearch || undefined,
                sortBy,
                sortOrder,
            }),
        staleTime: 30_000,
    })

    const totalPages = data ? Math.ceil(data.total / data.limit) : 0

    if (isLoading) {
        return (
            <div style={{ padding: 16 }}>
                <div>Loading products...</div>
                <div style={{ height: 6, background: '#eee', marginTop: 8 }}>
                    <div style={{ height: 6, width: '40%', background: '#999' }} />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ color: 'red' }}>Error: {(error as Error).message}</div>
            </div>
        )
    }

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    alignItems: 'center',
                }}
            >
                <h2 style={{ margin: 0 }}>Products</h2>
                {isFetching && <span style={{ fontSize: 12 }}>Updating...</span>}
            </div>

            <div style={{ marginBottom: 12 }}>
                <input
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => {
                        setPage(1)
                        setSearchInput(e.target.value)
                    }}
                />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ textAlign: 'left' }}>
                    <th
                        style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }}
                        onClick={() => toggleSort('title')}
                        title="Sort by name"
                    >
                        Name{getSortLabel(sortBy === 'title', sortOrder)}
                    </th>

                    <th
                        style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }}
                        onClick={() => toggleSort('brand')}
                        title="Sort by vendor"
                    >
                        Vendor{getSortLabel(sortBy === 'brand', sortOrder)}
                    </th>

                    <th
                        style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }}
                        onClick={() => toggleSort('sku')}
                        title="Sort by SKU"
                    >
                        SKU{getSortLabel(sortBy === 'sku', sortOrder)}
                    </th>

                    <th
                        style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }}
                        onClick={() => toggleSort('rating')}
                        title="Sort by rating"
                    >
                        Rating{getSortLabel(sortBy === 'rating', sortOrder)}
                    </th>

                    <th
                        style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }}
                        onClick={() => toggleSort('price')}
                        title="Sort by price"
                    >
                        Price{getSortLabel(sortBy === 'price', sortOrder)}
                    </th>
                </tr>
                </thead>

                <tbody>
                {data?.products.map((p) => (
                    <tr key={p.id}>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.title}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.brand ?? '-'}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.sku ?? '-'}</td>
                        <td
                            style={{
                                borderBottom: '1px solid #f0f0f0',
                                padding: 8,
                                color: p.rating < 3 ? 'red' : 'inherit',
                            }}
                        >
                            {p.rating}
                        </td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
                <button onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page <= 1}>
                    Prev
                </button>

                <span>
          Page {page} / {totalPages || 1}
        </span>

                <button
                    onClick={() => setPage((v) => (totalPages ? Math.min(totalPages, v + 1) : v + 1))}
                    disabled={totalPages ? page >= totalPages : false}
                >
                    Next
                </button>

                {(sortBy || debouncedSearch) && (
                    <button
                        onClick={() => {
                            setSearchInput('')
                            setSortBy(null)
                            setSortOrder('asc')
                            setPage(1)
                        }}
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    )
}