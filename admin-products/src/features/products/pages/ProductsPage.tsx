import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from "../../../shared/lib/useDebounce.ts";

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

async function fetchProducts(params: { limit: number; skip: number; search?: string }): Promise<ProductsResponse> {
    const baseUrl = params.search
        ? 'https://dummyjson.com/products/search'
        : 'https://dummyjson.com/products'

    const url = new URL(baseUrl)

    url.searchParams.set('limit', String(params.limit))
    url.searchParams.set('skip', String(params.skip))

    if (params.search) {
        url.searchParams.set('q', params.search)
    }

    const res = await fetch(url.toString())

    if (!res.ok) {
        throw new Error('Failed to load products')
    }

    return res.json()
}

export function ProductsPage() {
    const [page, setPage] = useState(1)
    const limit = 10
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 500)

    const skip = useMemo(() => (page - 1) * limit, [page, limit])

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['products', { limit, skip, search: debouncedSearch }],
        queryFn: () =>
            fetchProducts({ limit, skip, search: debouncedSearch }),
        staleTime: 30_000,
    })

    const totalPages = data ? Math.ceil(data.total / data.limit) : 0

    if (isLoading) {
        return (
            <div style={{ padding: 16 }}>
                <div>Loading products...</div>
                {/* простой прогресс-бар-заглушка */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
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
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Name</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Vendor</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>SKU</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Rating</th>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>Price</th>
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
            </div>
        </div>
    )
}