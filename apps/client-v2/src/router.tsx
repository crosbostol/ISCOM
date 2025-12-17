
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { OTListPage } from './features/ot/pages/OTListPage';
import { ConductorsPage } from './features/mantenedores/conductores';
import { MovilesPage } from './features/mantenedores/moviles';
import { ItemsPage } from './features/mantenedores/items';
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
            {
                path: "/mantenedores/conductores",
                element: <ConductorsPage />,
            },
            {
                path: "/mantenedores/moviles",
                element: <MovilesPage />,
            },
            {
                path: "/mantenedores/items",
                element: <ItemsPage />,
            },
        ]
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />
    }
]);
