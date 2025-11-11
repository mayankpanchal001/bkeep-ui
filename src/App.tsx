import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router';
import routes from './routes/routes';
import { queryClient } from './services/queryClient';

function App() {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={routes} />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                    }}
                />
            </QueryClientProvider>
        </>
    );
}

export default App;
