import { useMemo, useState } from 'react'
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

function IconWave() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 12c3.2 0 3.2-6 6.4-6s3.2 12 6.4 12S20 12 22 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
}

function LoginLogo() {
    const [hasError, setHasError] = useState(false)

    if (!hasError) {
        return (
            <img
                src="/assets/login/logo-circle.png"
                alt="Логотип"
                className={styles.topIconImage}
                onError={() => setHasError(true)}
            />
        )
    }

    return <IconWave />
}

function IconUser() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function IconLock() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 11V8a5 5 0 0 1 10 0v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6 11h12v10H6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function IconClear() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M18 6 6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
}

function IconEye({ off }: { off?: boolean }) {
    return off ? (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M3 3l18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10.6 10.6A2.5 2.5 0 0 0 12 15.5a2.5 2.5 0 0 0 1.4-.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6.7 6.7C4.3 8.2 2.7 10.7 2 12c1.6 2.7 5.6 7 10 7 1.8 0 3.4-.5 4.7-1.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M9.9 5.1A9.7 9.7 0 0 1 12 5c4.4 0 8.4 4.3 10 7-0.6 1-1.7 2.6-3.2 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M2 12c1.6-2.7 5.6-7 10-7s8.4 4.3 10 7c-1.6 2.7-5.6 7-10 7S3.6 14.7 2 12Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    )
}

export function LoginPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: { username: '', password: '', remember: false },
        mode: 'onSubmit',
    })

    const username = watch('username')
    const password = watch('password')

    const canClearUsername = useMemo(() => (username?.length ?? 0) > 0, [username])

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true)
            setApiError(null)

            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: data.username, password: data.password }),
            })

            if (!response.ok) throw new Error('Неверный логин или пароль')

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
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.cardInner}>
                    <div className={styles.topIcon}>
                        <LoginLogo />
                    </div>

                    <h1 className={styles.title}>Добро пожаловать!</h1>
                    <div className={styles.subtitle}>Пожалуйста, авторизируйтесь</div>

                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className={styles.field}>
                            <label className={styles.label}>Логин</label>

                            <div className={styles.inputWrap}>
                                <div className={styles.leftIcon}>
                                    <IconUser />
                                </div>

                                <input
                                    className={styles.input}
                                    placeholder=" "
                                    autoComplete="username"
                                    {...register('username', { required: 'Обязательное поле' })}
                                />

                                <button
                                    type="button"
                                    className={`${styles.rightBtn} ${!canClearUsername ? styles.hidden : ''}`}
                                    onClick={() => setValue('username', '')}
                                    aria-label="Очистить логин"
                                >
                                    <IconClear />
                                </button>
                            </div>

                            {errors.username && <div className={styles.error}>{errors.username.message}</div>}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Пароль</label>

                            <div className={styles.inputWrap}>
                                <div className={styles.leftIcon}>
                                    <IconLock />
                                </div>

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    placeholder=" "
                                    autoComplete="current-password"
                                    {...register('password', { required: 'Обязательное поле' })}
                                />

                                <button
                                    type="button"
                                    className={`${styles.rightBtn} ${password?.length ? '' : styles.hidden}`}
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label="Показать/скрыть пароль"
                                >
                                    <IconEye off={!showPassword} />
                                </button>
                            </div>

                            {errors.password && <div className={styles.error}>{errors.password.message}</div>}
                        </div>

                        <label className={styles.remember}>
                            <input type="checkbox" className={styles.checkbox} {...register('remember')} />
                            <span>Запомнить данные</span>
                        </label>

                        {apiError && <div className={styles.apiError}>{apiError}</div>}

                        <button type="submit" className={styles.submit} disabled={isLoading}>
                            {isLoading ? 'Входим…' : 'Войти'}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>или</span>
                    </div>

                    <div className={styles.bottom}>
                        <span>Нет аккаунта? </span>
                        <a className={styles.link} href="#">
                            Создать
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
