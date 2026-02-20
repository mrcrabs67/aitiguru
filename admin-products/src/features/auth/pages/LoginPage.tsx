import { useForm } from 'react-hook-form'

type LoginFormValues = {
    username: string
    password: string
    remember: boolean
}

export function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>()

    const onSubmit = (data: LoginFormValues) => {
        console.log(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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

            <button type="submit">Login</button>
        </form>
    )
}