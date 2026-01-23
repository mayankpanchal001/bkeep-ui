// Vite exposes env variables through import.meta.env
// Environment variables must be prefixed with VITE_ to be exposed to client-side code

// Determine API endpoint based on environment
const getApiEndpoint = () => {
    // If explicitly set, use it
    if (import.meta.env.VITE_API_ENDPOINT) {
        return import.meta.env.VITE_API_ENDPOINT;
    }

    // Default endpoint for both development and production
    return 'http://150.241.247.80:4000/api/v1';
};

export const API_ENDPOINT = getApiEndpoint();
export const ENVIRONMENT =
    import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development';
