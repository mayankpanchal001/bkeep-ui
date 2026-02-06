import { useEffect, useState } from 'react';
import { useTheme } from '../stores/theme/themeSelectors';
import { type Theme, useThemeStore } from '../stores/theme/themeStore';

export function getResolvedTheme(
    theme: 'light' | 'dark' | 'system'
): 'light' | 'dark' {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function useResolvedTheme(): 'light' | 'dark' {
    const theme = useTheme();
    const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
        getResolvedTheme(theme)
    );

    useEffect(() => {
        setResolved(getResolvedTheme(theme));
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () =>
            setResolved(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    return resolved;
}

/**
 * Trigger a theme switch with a circular reveal animation from (x, y).
 * Call this from click handlers instead of setTheme directly.
 */
export function switchThemeAt(newTheme: Theme, x: number, y: number) {
    const resolved = getResolvedTheme(newTheme);
    const isDark = resolved === 'dark';
    const hadDark = document.documentElement.classList.contains('dark');
    if (isDark === hadDark) {
        useThemeStore.getState().setTheme(newTheme);
        return;
    }

    // Calculate the radius needed to cover the entire viewport from (x, y)
    const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    // Set CSS custom properties for the animation origin
    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);
    document.documentElement.style.setProperty(
        '--theme-r',
        `${maxRadius}px`
    );

    if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
            document.documentElement.classList.toggle('dark', isDark);
            useThemeStore.getState().setTheme(newTheme);
        });

        // Once snapshots are captured, run the circular clip-path animation
        transition.ready.then(() => {
            document.documentElement.animate(
                [
                    {
                        clipPath: `circle(0px at ${x}px ${y}px)`,
                    },
                    {
                        clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
                    },
                ],
                {
                    duration: 500,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });
    } else {
        document.documentElement.classList.toggle('dark', isDark);
        useThemeStore.getState().setTheme(newTheme);
    }
}

function applyThemeInstant(isDark: boolean) {
    const hadDark = document.documentElement.classList.contains('dark');
    if (isDark === hadDark) return;
    document.documentElement.classList.toggle('dark', isDark);
}

export function useThemeSync() {
    const theme = useTheme();

    // On mount, sync the class without animation
    useEffect(() => {
        applyThemeInstant(getResolvedTheme(theme) === 'dark');
    }, [theme]);

    // Listen for system preference changes when theme is 'system'
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () =>
            applyThemeInstant(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);
}

