
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { OTListPage } from './features/ot/pages/OTListPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <OTListPage />,
            },
            {
                path: "/ots",
                element: <OTListPage />,
            },
        ]
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />
    }
]);
