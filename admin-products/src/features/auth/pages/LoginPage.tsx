import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { setAuthToken } from '../authStorage'
import styles from './LoginPage.module.scss'

type LoginFormValues = {
    username: string
    password: string
    remember: boolean
}

type LoginResponse = {
    accessToken: string
}

export function LoginPage() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>()

    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true)
            setApiError(null)

            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password,
                }),
            })

            if (!response.ok) {
                throw new Error('Неверный логин или пароль')
            }

            const result = (await response.json()) as LoginResponse
            setAuthToken(result.accessToken, data.remember)
            navigate('/products', { replace: true })
        } catch (e) {
            setApiError((e as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.logoCircle}>
                    <div className={styles.logo} />
                </div>

                <h1 className={styles.title}>Добро пожаловать!</h1>
                <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.field}>
                        <label>Логин</label>
                        <input
                            className={styles.input}
                            placeholder="Введите логин"
                            {...register('username', { required: 'Обязательное поле' })}
                        />
                        {errors.username && <span className={styles.error}>{errors.username.message}</span>}
                    </div>

                    <div className={styles.field}>
                        <label>Пароль</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Введите пароль"
                            {...register('password', { required: 'Обязательное поле' })}
                        />
                        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                    </div>

                    <label className={styles.checkbox}>
                        <input type="checkbox" {...register('remember')} />
                        <span>Запомнить данные</span>
                    </label>

                    {apiError && <div className={styles.error}>{apiError}</div>}

                    <button type="submit" disabled={isLoading} className={styles.button}>
                        {isLoading ? 'Входим...' : 'Войти'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>или</span>
                </div>

                <div className={styles.footer}>
                    Нет аккаунта? <a href="#">Создать</a>
                </div>
            </div>
        </div>
    )
}