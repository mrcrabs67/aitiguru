import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styles from './ProductsPage.module.scss'
import { useDebounce } from '../../../shared/lib/useDebounce' // поправь путь при необходимости

type Product = {
    id: number
    title: string
    price: number
    rating: number
    brand?: string
    sku?: string
    category?: string
    thumbnail?: string
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

function IconSearch() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M21 21l-4.2-4.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
}

function IconRefresh() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M21 12a9 9 0 1 1-2.6-6.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M21 4v6h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function IconPlus() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
}

function IconDots() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="12" r="1.8" fill="currentColor" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
            <circle cx="18" cy="12" r="1.8" fill="currentColor" />
        </svg>
    )
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

    if (params.search) url.searchParams.set('q', params.search)

    if (params.sortBy) {
        url.searchParams.set('sortBy', params.sortBy)
        url.searchParams.set('order', params.sortOrder ?? 'asc')
    }

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to load products')
    return res.json()
}

function formatPriceRUB(value: number) {
    // имитация формата как в макете: пробелы между тысячами и запятая
    // 48652 -> "48 652,00"
    const fixed = value.toFixed(2).replace('.', ',')
    const [intPart, frac] = fixed.split(',')
    const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${spaced},${frac}`
}

export function ProductsPage() {
    // pagination
    const [page, setPage] = useState(1)
    const limit = 10
    const skip = useMemo(() => (page - 1) * limit, [page, limit])

    // search
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

    // local created products
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

    const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
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

    // ВАЖНО: добавленные показываем только на первой странице (как ты хотел)
    const visibleProducts = useMemo(() => {
        const apiProducts = data?.products ?? []
        return page === 1 ? [...createdProducts, ...apiProducts] : apiProducts
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
            category: '—',
        }

        setCreatedProducts((prev) => [newProduct, ...prev])
        toast.success('Товар добавлен')
        setIsAddOpen(false)
        setAddForm({ title: '', price: '', brand: '', sku: '' })
        setAddErrors({})
    }

    // для макета показываем 1..5 страниц кнопками (как на скрине)
    const pageButtons = useMemo(() => {
        const max = Math.min(totalPages || 1, 5)
        return Array.from({ length: max }, (_, i) => i + 1)
    }, [totalPages])

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.topBar}>
                    <div className={styles.topBarInner}>
                        <h1 className={styles.topTitle}>Товары</h1>
                        <div className={styles.search}>
            <span className={styles.searchIcon}>
              <IconSearch />
            </span>
                            <input value="" readOnly placeholder="Найти" />
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.contentInner}>
                        <div className={styles.card}>Загрузка…</div>
                    </div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <div className={styles.card} style={{ color: 'red' }}>
                        {(error as Error).message}
                    </div>
                </div>
            </div>
        )
    }

    const shownFrom = data ? data.skip + 1 : 0
    const shownTo = data ? Math.min(data.skip + data.limit, data.total) : 0

    return (
        <div className={styles.page}>
            {/* top header */}
            <div className={styles.topBar}>
                <div className={styles.topBarInner}>
                    <h1 className={styles.topTitle}>Товары</h1>

                    <div className={styles.search}>
          <span className={styles.searchIcon}>
            <IconSearch />
          </span>
                        <input
                            placeholder="Найти"
                            value={searchInput}
                            onChange={(e) => {
                                setPage(1)
                                setSearchInput(e.target.value)
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* content */}
            <div className={styles.content}>
                <div className={styles.contentInner}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Все позиции</h2>

                            <div className={styles.actions}>
                                <button className={styles.iconBtn} onClick={() => refetch()} aria-label="Обновить">
                                    <IconRefresh />
                                </button>

                                <button className={styles.addBtn} onClick={() => setIsAddOpen(true)}>
                <span className={styles.addBtnIcon}>
                  <IconPlus />
                </span>
                                    Добавить
                                </button>
                            </div>
                        </div>

                        <table className={styles.table}>
                            <colgroup>
                                <col className={styles.colCheckbox} />
                                <col className={styles.colName} />
                                <col className={styles.colVendor} />
                                <col className={styles.colSku} />
                                <col className={styles.colRating} />
                                <col className={styles.colPrice} />
                                <col className={styles.colActions} />
                            </colgroup>
                            <thead>
                            <tr>
                                <th className={`${styles.th} ${styles.checkboxCell}`}>
                                    <input className={styles.checkbox} type="checkbox" />
                                </th>

                                <th className={`${styles.th} ${styles.thClickable}`} onClick={() => toggleSort('title')}>
                                    Наименование
                                </th>
                                <th className={`${styles.th} ${styles.thClickable}`} onClick={() => toggleSort('brand')}>
                                    Вендор
                                </th>
                                <th className={`${styles.th} ${styles.thClickable}`} onClick={() => toggleSort('sku')}>
                                    Артикул
                                </th>
                                <th className={`${styles.th} ${styles.thClickable}`} onClick={() => toggleSort('rating')}>
                                    Оценка
                                </th>
                                <th className={`${styles.th} ${styles.thClickable}`} onClick={() => toggleSort('price')}>
                                    Цена, ₽
                                </th>
                                <th className={styles.th} />
                            </tr>
                            </thead>

                            <tbody>
                            {visibleProducts.map((p, idx) => (
                                <tr key={p.id}>
                                    <td className={`${styles.td} ${styles.checkboxCell}`}>
                                        <input className={styles.checkbox} type="checkbox" defaultChecked={idx === 2} />
                                    </td>

                                    <td className={styles.td}>
                                        <div className={styles.productCell}>
                                            <div className={styles.thumb}>
                                                {p.thumbnail ? <img src={p.thumbnail} alt="" /> : null}
                                            </div>
                                            <div className={styles.prodText}>
                                                <div className={styles.prodTitle}>{p.title}</div>
                                                <div className={styles.prodSub}>{p.category ?? '—'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={styles.td}>
                                        <span className={styles.vendor}>{p.brand ?? '-'}</span>
                                    </td>

                                    <td className={styles.td}>{p.sku ?? '-'}</td>

                                    <td className={`${styles.td} ${p.rating < 3 ? styles.ratingBad : ''}`}>
                                        {(p.rating ?? 0).toFixed(1)}/5
                                    </td>

                                    <td className={`${styles.td} ${styles.price}`}>{formatPriceRUB(p.price ?? 0)}</td>

                                    <td className={`${styles.td} ${styles.rowActions}`}>
                                        <button className={styles.pillPlus} aria-label="Добавить">
                                            <IconPlus />
                                        </button>
                                        <button className={styles.kebab} aria-label="Меню">
                                            <IconDots />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className={styles.footerRow}>
                            <div>
                                Показано {shownFrom}-{shownTo} из {data?.total ?? 0}
                                {isFetching ? ' • обновление…' : ''}
                            </div>

                            <div className={styles.pagination}>
                                <button
                                    className={styles.navBtn}
                                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                                    aria-label="Назад"
                                >
                                    ‹
                                </button>

                                {pageButtons.map((p) => (
                                    <button
                                        key={p}
                                        className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    className={styles.navBtn}
                                    onClick={() => setPage((v) => (totalPages ? Math.min(totalPages, v + 1) : v + 1))}
                                    aria-label="Вперёд"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL (пока функционал; стили модалки — следующим шагом под Figma) */}
            {isAddOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsAddOpen(false)}
                >
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Добавить товар</h3>

                        <div className={styles.modalFields}>
                            <div>
                                <input
                                    className={styles.modalInput}
                                    placeholder="Наименование"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                                />
                                {addErrors.title && <div className={styles.modalError}>{addErrors.title}</div>}
                            </div>

                            <div>
                                <input
                                    className={styles.modalInput}
                                    placeholder="Цена"
                                    value={addForm.price}
                                    onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
                                />
                                {addErrors.price && <div className={styles.modalError}>{addErrors.price}</div>}
                            </div>

                            <div>
                                <input
                                    className={styles.modalInput}
                                    placeholder="Вендор"
                                    value={addForm.brand}
                                    onChange={(e) => setAddForm((p) => ({ ...p, brand: e.target.value }))}
                                />
                                {addErrors.brand && <div className={styles.modalError}>{addErrors.brand}</div>}
                            </div>

                            <div>
                                <input
                                    className={styles.modalInput}
                                    placeholder="Артикул"
                                    value={addForm.sku}
                                    onChange={(e) => setAddForm((p) => ({ ...p, sku: e.target.value }))}
                                />
                                {addErrors.sku && <div className={styles.modalError}>{addErrors.sku}</div>}
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.modalCancelBtn} onClick={() => setIsAddOpen(false)}>
                                Отмена
                            </button>
                            <button className={styles.modalAddBtn} onClick={submitAdd}>
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}