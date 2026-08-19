import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { CartProvider } from '../features/cart/context/CartContext';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  className: 'dark:bg-slate-800 dark:text-white',
                  style: {
                    borderRadius: '10px',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  },
                }} 
              />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
