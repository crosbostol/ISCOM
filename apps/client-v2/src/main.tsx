import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { OTListPage } from './features/ot/pages/OTListPage'
import { AppThemeProvider } from './theme/AppTheme'
import './index.css'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <OTListPage />,
  },
  {
    path: "/ots",
    element: <OTListPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
