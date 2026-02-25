import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { AddProductModal } from '../components/AddProductModal'
import { IconDots, IconPlus, IconRefresh, IconSearch } from '../components/ProductIcons'
import { fetchProducts } from '../lib/api'
import { formatPriceRUB } from '../lib/formatters'
import type { AddProductForm, Product, SortBy, SortOrder } from '../lib/types'
import styles from './ProductsPage.module.scss'
import { useDebounce } from '../../../shared/lib/useDebounce'

export function ProductsPage() {
    const [page, setPage] = useState(1)
    const limit = 10
    const skip = useMemo(() => (page - 1) * limit, [page, limit])

    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 500)

    const [sortBy, setSortBy] = useState<SortBy | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    const [createdProducts, setCreatedProducts] = useState<Product[]>([])

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

    const visibleProducts = useMemo(() => {
        const apiProducts = data?.products ?? []
        return page === 1 ? [...createdProducts, ...apiProducts] : apiProducts
    }, [createdProducts, data, page])

    const totalPages = data ? Math.ceil(data.total / data.limit) : 0

    const toggleSort = (col: SortBy) => {
        setPage(1)
        if (sortBy === col) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            return
        }

        setSortBy(col)
        setSortOrder('asc')
    }

    const validateAddForm = (): boolean => {
        const nextErrors: typeof addErrors = {}

        if (!addForm.title.trim()) {
            nextErrors.title = 'Введите наименование'
        }
        if (!addForm.brand.trim()) {
            nextErrors.brand = 'Введите вендор'
        }
        if (!addForm.sku.trim()) {
            nextErrors.sku = 'Введите артикул'
        }

        const priceNum = Number(addForm.price)
        if (!addForm.price.trim()) {
            nextErrors.price = 'Введите цену'
        } else if (Number.isNaN(priceNum) || priceNum <= 0) {
            nextErrors.price = 'Цена должна быть > 0'
        }

        setAddErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const submitAdd = () => {
        if (!validateAddForm()) {
            return
        }

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

    const handleFormChange = <K extends keyof AddProductForm>(key: K, value: AddProductForm[K]) => {
        setAddForm((prev) => ({ ...prev, [key]: value }))
    }

    const pageButtons = useMemo(() => {
        const max = Math.min(totalPages || 1, 5)
        return Array.from({ length: max }, (_, i) => i + 1)
    }, [totalPages])

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.topBar}>
                    <h1 className={styles.topTitle}>Товары</h1>
                    <div className={styles.search}>
                        <span className={styles.searchIcon}>
                            <IconSearch />
                        </span>
                        <input value="" readOnly placeholder="Найти" />
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.card}>Загрузка…</div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <div className={styles.card}>
                        <p className={styles.errorText}>{(error as Error).message}</p>
                    </div>
                </div>
            </div>
        )
    }

    const shownFrom = data ? data.skip + 1 : 0
    const shownTo = data ? Math.min(data.skip + data.limit, data.total) : 0

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
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

            <div className={styles.content}>
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

            {isAddOpen && (
                <AddProductModal
                    addForm={addForm}
                    addErrors={addErrors}
                    onClose={() => setIsAddOpen(false)}
                    onSubmit={submitAdd}
                    onChange={handleFormChange}
                />
            )}
        </div>
    )
}
