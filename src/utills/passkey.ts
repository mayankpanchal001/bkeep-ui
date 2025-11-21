/**
 * Utility functions for managing passkey user data
 */

export type StoredPasskeyUser = {
    email: string;
    lastAccessed: string;
    device: string;
};

/**
 * Store passkey user information in localStorage
 */
export function storePasskeyUser(email: string): void {
    const user: StoredPasskeyUser = {
        email,
        lastAccessed: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
        device: navigator.userAgent,
    };
    localStorage.setItem('passkeyUser', JSON.stringify(user));
}

/**
 * Retrieve stored passkey user from localStorage
 */
export function getStoredPasskeyUser(): StoredPasskeyUser | null {
    try {
        const stored = localStorage.getItem('passkeyUser');
        if (stored) {
            return JSON.parse(stored) as StoredPasskeyUser;
        }
    } catch (e) {
        console.error('Failed to parse stored passkey user', e);
    }
    return null;
}

/**
 * Remove stored passkey user from localStorage
 */
export function removePasskeyUser(): void {
    localStorage.removeItem('passkeyUser');
}

/**
 * Update last accessed timestamp for stored passkey user
 */
export function updatePasskeyUserLastAccessed(): void {
    const user = getStoredPasskeyUser();
    if (user) {
        storePasskeyUser(user.email);
    }
}
