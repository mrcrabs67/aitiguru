import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useDebounce } from '../../../shared/lib/useDebounce' // поправь путь при необходимости

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

type AddProductForm = {
    title: string
    price: string
    brand: string
    sku: string
}

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
    if (!res.ok) throw new Error('Failed to load products')
    return res.json()
}

function getSortLabel(active: boolean, order: SortOrder) {
    if (!active) return ''
    return order === 'asc' ? ' ▲' : ' ▼'
}

export function ProductsPage() {
    // pagination
    const [page, setPage] = useState(1)
    const limit = 10
    const skip = useMemo(() => (page - 1) * limit, [page, limit])

    // search (debounced)
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 500)

    // sort
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

    // local created products (no API save)
    const [createdProducts, setCreatedProducts] = useState<Product[]>([])

    // add modal
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [addForm, setAddForm] = useState<AddProductForm>({
        title: '',
        price: '',
        brand: '',
        sku: '',
    })
    const [addErrors, setAddErrors] = useState<Partial<Record<keyof AddProductForm, string>>>({})

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['products', { limit, skip, search: debouncedSearch, sortBy, sortOrder }],
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

    const visibleProducts = useMemo(() => {
        const apiProducts = data?.products ?? []

        // показываем локально добавленные только на первой странице
        if (page === 1) {
            return [...createdProducts, ...apiProducts]
        }

        return apiProducts
    }, [createdProducts, data, page])

    const totalPages = data ? Math.ceil(data.total / data.limit) : 0

    const validateAddForm = (): boolean => {
        const nextErrors: typeof addErrors = {}

        if (!addForm.title.trim()) nextErrors.title = 'Введите наименование'
        if (!addForm.brand.trim()) nextErrors.brand = 'Введите вендор'
        if (!addForm.sku.trim()) nextErrors.sku = 'Введите артикул'

        const priceNum = Number(addForm.price)
        if (!addForm.price.trim()) nextErrors.price = 'Введите цену'
        else if (Number.isNaN(priceNum) || priceNum <= 0) nextErrors.price = 'Цена должна быть > 0'

        setAddErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const submitAdd = () => {
        if (!validateAddForm()) return

        const newProduct: Product = {
            id: Date.now(),
            title: addForm.title.trim(),
            price: Number(addForm.price),
            rating: 0,
            brand: addForm.brand.trim(),
            sku: addForm.sku.trim(),
        }

        setCreatedProducts((prev) => [newProduct, ...prev])
        toast.success('Товар добавлен')
        setIsAddOpen(false)
        setAddForm({ title: '', price: '', brand: '', sku: '' })
        setAddErrors({})
    }

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
            {/* top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Products</h2>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isFetching && <span style={{ fontSize: 12 }}>Updating...</span>}
                    <button onClick={() => setIsAddOpen(true)}>Добавить</button>
                </div>
            </div>

            {/* search */}
            <div style={{ marginTop: 12 }}>
                <input
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => {
                        setPage(1)
                        setSearchInput(e.target.value)
                    }}
                />
            </div>

            {/* table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                <thead>
                <tr style={{ textAlign: 'left' }}>
                    <th style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }} onClick={() => toggleSort('title')}>
                        Name{getSortLabel(sortBy === 'title', sortOrder)}
                    </th>

                    <th style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }} onClick={() => toggleSort('brand')}>
                        Vendor{getSortLabel(sortBy === 'brand', sortOrder)}
                    </th>

                    <th style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }} onClick={() => toggleSort('sku')}>
                        SKU{getSortLabel(sortBy === 'sku', sortOrder)}
                    </th>

                    <th style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }} onClick={() => toggleSort('rating')}>
                        Rating{getSortLabel(sortBy === 'rating', sortOrder)}
                    </th>

                    <th style={{ borderBottom: '1px solid #ddd', padding: 8, cursor: 'pointer' }} onClick={() => toggleSort('price')}>
                        Price{getSortLabel(sortBy === 'price', sortOrder)}
                    </th>
                </tr>
                </thead>

                <tbody>
                {visibleProducts.map((p) => (
                    <tr key={p.id}>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.title}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.brand ?? '-'}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.sku ?? '-'}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, color: p.rating < 3 ? 'red' : 'inherit' }}>
                            {p.rating}
                        </td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* pagination */}
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

            {/* modal */}
            {isAddOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                    }}
                    onClick={() => setIsAddOpen(false)}
                >
                    <div
                        style={{ background: '#fff', width: 520, maxWidth: '100%', padding: 16, borderRadius: 8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>Добавить товар</h3>

                        <div style={{ display: 'grid', gap: 10 }}>
                            <div>
                                <input
                                    placeholder="Наименование"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                                />
                                {addErrors.title && <div style={{ color: 'red', fontSize: 12 }}>{addErrors.title}</div>}
                            </div>

                            <div>
                                <input
                                    placeholder="Цена"
                                    value={addForm.price}
                                    onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
                                />
                                {addErrors.price && <div style={{ color: 'red', fontSize: 12 }}>{addErrors.price}</div>}
                            </div>

                            <div>
                                <input
                                    placeholder="Вендор"
                                    value={addForm.brand}
                                    onChange={(e) => setAddForm((p) => ({ ...p, brand: e.target.value }))}
                                />
                                {addErrors.brand && <div style={{ color: 'red', fontSize: 12 }}>{addErrors.brand}</div>}
                            </div>

                            <div>
                                <input
                                    placeholder="Артикул"
                                    value={addForm.sku}
                                    onChange={(e) => setAddForm((p) => ({ ...p, sku: e.target.value }))}
                                />
                                {addErrors.sku && <div style={{ color: 'red', fontSize: 12 }}>{addErrors.sku}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button onClick={() => setIsAddOpen(false)}>Отмена</button>
                            <button onClick={submitAdd}>Добавить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}