import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Vite automatically loads .env.production when mode is 'production'
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 5173, // Development port
            host: true, // Listen on all addresses
            proxy: {
                '/api': {
                    // Use the same API endpoint for both local and production
                    target:
                        env.VITE_API_ENDPOINT ||
                        'http://150.241.247.80:4000/api/v1',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: (id) => {

                        if (id.includes('node_modules')) {
                            // React core - separate from other React libs
                            if (
                                id.includes('react/') &&
                                !id.includes('react-dom')
                            ) {
                                return 'react-core';
                            }
                            // React DOM - separate chunk
                            if (id.includes('react-dom')) {
                                return 'react-dom';
                            }
                            // React Router - separate chunk
                            if (id.includes('react-router')) {
                                return 'react-router';
                            }
                            // TanStack Query - separate chunk
                            if (id.includes('@tanstack/react-query')) {
                                return 'react-query';
                            }
                            // Large charting library - separate chunk
                            if (id.includes('recharts')) {
                                return 'recharts';
                            }
                            // Excel libraries - separate chunk (very large)
                            if (id.includes('xlsx')) {
                                return 'xlsx';
                            }
                            // WebAuthn libraries - separate chunk
                            if (id.includes('@simplewebauthn')) {
                                return 'webauthn';
                            }
                            // React Icons - separate chunk (can be large)
                            if (id.includes('react-icons')) {
                                return 'react-icons';
                            }
                            // Tailwind CSS - separate chunk
                            if (id.includes('tailwindcss')) {
                                return 'tailwindcss';
                            }
                            // UI libraries - grouped together
                            if (id.includes('react-hot-toast')) {
                                return 'ui-libs';
                            }
                            // State management - separate chunk
                            if (id.includes('zustand')) {
                                return 'zustand';
                            }
                            // HTTP client - separate chunk
                            if (id.includes('axios')) {
                                return 'axios';
                            }
                            // All other node_modules go into vendor chunk
                            return 'vendor';
                        }

                    },
                },
            },
            // Note: Some chunks (like recharts, xlsx) are inherently large libraries
            chunkSizeWarningLimit: 1000,
            // Disable source maps for smaller production builds
            sourcemap: false,
            // Use esbuild for faster, efficient minification
            minify: 'esbuild',
            // Optimize asset inlining threshold
            assetsInlineLimit: 4096, // 4kb
        },
    };
});
