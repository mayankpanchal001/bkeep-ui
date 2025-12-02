import axios from 'axios';
import { API_ENDPOINT } from '../config/env';

const axiosInstance = axios.create({
    // baseURL: import.meta.env.VITE_API_ENDPOINT,
    baseURL: API_ENDPOINT,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 responses
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Handle unauthorized access
//             showErrorToast('Your session has expired. Logging you out...');
//             localStorage.removeItem('accessToken');
//             localStorage.removeItem('user');

//             // Only redirect if we're not already on the login page
//             if (
//                 window.location.pathname !== '/login' &&
//                 window.location.pathname !== '/'
//             ) {
//                 window.location.href = '/login';
//             }
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
