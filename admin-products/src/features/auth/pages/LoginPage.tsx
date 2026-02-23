import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { setAuthToken } from '../authStorage'

type LoginFormValues = {
    username: string
    password: string
    remember: boolean
}

export function LoginPage() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>()

    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true)
            setApiError(null)

            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            })

            console.log('status', response.status)
            if (!response.ok) {
                throw new Error('Invalid username or password')
            }

            const result = await response.json()
            console.log('login result', result)

            // сохраняем токен
            setAuthToken(result.accessToken, data.remember)

            // редиректим
            navigate('/products', { replace: true })

        } catch (error) {
            setApiError((error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(
                (data) => {
                    console.log('valid submit', data)
                    onSubmit(data)
                },
                (formErrors) => {
                    console.log('invalid submit', formErrors)
                }
            )}
        >
            <input
                placeholder="Username"
                {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p>{errors.username.message}</p>}

            <input
                type="password"
                placeholder="Password"
                {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p>{errors.password.message}</p>}

            <label>
                <input type="checkbox" {...register('remember')} />
                Remember me
            </label>

            {apiError && <p style={{ color: 'red' }}>{apiError}</p>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
            </button>
        </form>
    )
}