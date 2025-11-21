import { create } from 'zustand';
import axiosInstance from '../../services/axiosClient';
import { AuthState, UserType } from '../../types';

export const AuthStore = create<AuthState>((set, get) => ({
    // 1. Initial State
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    // 2. Actions

    setAuth: (user: UserType, accessToken: string, refreshToken: string) => {
        // Persist to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            error: null,
        });
    },

    // --- Clear Auth (Internal Helper) ---
    clearAuth: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
        });
    },

    // --- Logout Action ---
    logout: async () => {
        set({ loading: true });
        try {
            // Optional: Call server to invalidate token
            // await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            get().clearAuth();
            set({ loading: false });
        }
    },

    // --- Hydrate (Restore session on refresh) ---
    hydrateAuth: () => {
        try {
            const userStr = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (userStr && accessToken && refreshToken) {
                set({
                    user: JSON.parse(userStr),
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                });
            }
        } catch (e) {
            console.error('Failed to hydrate auth', e);
            get().clearAuth();
        }
    },

    // --- Refresh Token ---
    refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) return false;

        try {
            const response = await axiosInstance.post('/auth/refresh-token', {
                refreshToken: currentRefreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } =
                response.data;

            // Update state and local storage
            const currentUser = get().user!; // User should exist if we are refreshing
            get().setAuth(currentUser, accessToken, newRefreshToken);

            return true;
        } catch (error) {
            console.error('Token refresh failed', error);
            get().clearAuth(); // If refresh fails, force logout
            return false;
        }
    },
}));
