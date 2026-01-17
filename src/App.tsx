import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/shared/ThemeProvider';
import routes from './routes/routes';
import { queryClient } from './services/queryClient';
import { useAuth } from './stores/auth/authSelectore';
import { Toaster } from './components/ui/sonner';

function App() {
    const { hydrateAuth } = useAuth();

    useEffect(() => {
        hydrateAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <RouterProvider router={routes} />
                    <Toaster
                        position="top-center"
                        toastOptions={{ duration: 4000 }}
                    />
                </ThemeProvider>
            </QueryClientProvider>
        </>
    );
}

export default App;
