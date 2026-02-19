import { Navigate, Route, Routes } from 'react-router-dom'
import {LoginPage} from "../features/auth/pages/LoginPage.tsx";
import {ProductsPage} from "../features/products/pages/ProductsPage.tsx";
import {ProtectedRoute} from "../features/auth/ProtectedRoute.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/products"
                element={
                    <ProtectedRoute>
                        <ProductsPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}