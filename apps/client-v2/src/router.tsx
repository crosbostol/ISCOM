
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { OTListPage } from './features/ot/pages/OTListPage';
import { ConductorsPage } from './features/conductors/pages/ConductorsPage';
import { MovilesPage } from './features/moviles/pages/MovilesPage';
import { ItemsPage } from './features/items/pages/ItemsPage';
import { PaymentStatusPage } from './features/reportes/pages/PaymentStatusPage';
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
            {
                path: "/reportes/estado-pago",
                element: <PaymentStatusPage />,
            },
        ]
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />
    }
]);
