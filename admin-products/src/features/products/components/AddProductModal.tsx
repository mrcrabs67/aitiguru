import type { AddProductForm } from '../lib/types'
import styles from '../pages/ProductsPage.module.scss'

type AddProductModalProps = {
    addForm: AddProductForm
    addErrors: Partial<Record<keyof AddProductForm, string>>
    onClose: () => void
    onSubmit: () => void
    onChange: <K extends keyof AddProductForm>(key: K, value: AddProductForm[K]) => void
}

export function AddProductModal({ addForm, addErrors, onClose, onSubmit, onChange }: AddProductModalProps) {
    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Добавить товар</h3>

                <div className={styles.formGrid}>
                    <div>
                        <input
                            className={styles.modalInput}
                            placeholder="Наименование"
                            value={addForm.title}
                            onChange={(e) => onChange('title', e.target.value)}
                        />
                        {addErrors.title && <div className={styles.errorText}>{addErrors.title}</div>}
                    </div>

                    <div>
                        <input
                            className={styles.modalInput}
                            placeholder="Цена"
                            value={addForm.price}
                            onChange={(e) => onChange('price', e.target.value)}
                        />
                        {addErrors.price && <div className={styles.errorText}>{addErrors.price}</div>}
                    </div>

                    <div>
                        <input
                            className={styles.modalInput}
                            placeholder="Вендор"
                            value={addForm.brand}
                            onChange={(e) => onChange('brand', e.target.value)}
                        />
                        {addErrors.brand && <div className={styles.errorText}>{addErrors.brand}</div>}
                    </div>

                    <div>
                        <input
                            className={styles.modalInput}
                            placeholder="Артикул"
                            value={addForm.sku}
                            onChange={(e) => onChange('sku', e.target.value)}
                        />
                        {addErrors.sku && <div className={styles.errorText}>{addErrors.sku}</div>}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.modalBtnGhost} onClick={onClose}>
                        Отмена
                    </button>
                    <button className={styles.modalBtnPrimary} onClick={onSubmit}>
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    )
}
