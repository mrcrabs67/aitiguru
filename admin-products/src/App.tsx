import { Navigate, Route, Routes } from 'react-router-dom'

const LoginPage = () => {
    return <div>Login</div>
}

const  ProductsPage = () => {
    return <div>Products</div>
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}