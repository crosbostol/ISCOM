import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AppThemeProvider } from './theme/AppTheme'
import './index.css'

const queryClient = new QueryClient()

import { router } from './router'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
