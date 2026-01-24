import { Palette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useThemePaletteStore } from '../../stores/theme/themePaletteStore';
import { useTheme } from '../../stores/theme/themeSelectors';
import { getCurrentThemeMode } from '../../utils/applyThemePalette';
import { cn } from '../../utils/cn';

/**
 * Ultra-modern full-screen SVG theme transition animation
 * Features morphing shapes, particle effects, and smooth transitions
 */
export const ThemeTransitionAnimation = () => {
    const { selectedPaletteId, getPalette } = useThemePaletteStore();
    const theme = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const previousPaletteId = useRef<string | null>(null);
    const previousTheme = useRef<string | null>(null);
    const previousIsDark = useRef<boolean | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const palette = getPalette();
        if (!palette) return;

        const isDark = getCurrentThemeMode();

        // Skip animation on initial mount
        if (previousPaletteId.current === null) {
            previousPaletteId.current = selectedPaletteId;
            previousTheme.current = theme;
            previousIsDark.current = isDark;
            return;
        }

        // Animate if palette, theme mode, or light/dark changed
        const paletteChanged = previousPaletteId.current !== selectedPaletteId;
        const themeModeChanged = previousTheme.current !== theme;
        const isDarkChanged = previousIsDark.current !== isDark;

        if (paletteChanged || themeModeChanged || isDarkChanged) {
            setIsAnimating(true);
            setAnimationKey((prev) => prev + 1);
            previousPaletteId.current = selectedPaletteId;
            previousTheme.current = theme;
            previousIsDark.current = isDark;

            // Animation duration
            const duration = 1500;

            // Hide animation after transition completes
            setTimeout(() => {
                setIsAnimating(false);
            }, duration);
        }
    }, [selectedPaletteId, theme, getPalette]);

    if (!isAnimating) return null;

    const palette = getPalette();
    const isDark = getCurrentThemeMode();
    const themeColors = palette
        ? isDark
            ? palette.dark
            : palette.light
        : null;

    // Generate particle positions
    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
    }));

    return (
        <div
            key={animationKey}
            className={cn(
                'fixed inset-0 z-[9999] pointer-events-none overflow-hidden',
                'animate-theme-transition-overlay'
            )}
        >
            {/* Animated backdrop with blur */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-theme-backdrop" />

            {/* Main SVG canvas with full-screen animations */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1920 1080"
            >
                <defs>
                    {/* Primary animated gradient */}
                    <linearGradient
                        id={`theme-grad-1-${animationKey}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0.6"
                        >
                            <animate
                                attributeName="stop-opacity"
                                values="0.3;0.8;0.3"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop
                            offset="50%"
                            stopColor={themeColors?.accent || '#000000'}
                            stopOpacity="0.4"
                        >
                            <animate
                                attributeName="stop-opacity"
                                values="0.2;0.6;0.2"
                                dur="2.5s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop
                            offset="100%"
                            stopColor={themeColors?.secondary || '#000000'}
                            stopOpacity="0.3"
                        >
                            <animate
                                attributeName="stop-opacity"
                                values="0.1;0.5;0.1"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        </stop>
                    </linearGradient>

                    {/* Secondary animated gradient */}
                    <linearGradient
                        id={`theme-grad-2-${animationKey}`}
                        x1="100%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0%"
                            stopColor={themeColors?.accent || '#000000'}
                            stopOpacity="0.5"
                        />
                        <stop
                            offset="100%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0.3"
                        />
                    </linearGradient>

                    {/* Radial gradient for glow effects */}
                    <radialGradient
                        id={`theme-radial-${animationKey}`}
                        cx="50%"
                        cy="50%"
                        r="50%"
                    >
                        <stop
                            offset="0%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0.8"
                        />
                        <stop
                            offset="100%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0"
                        />
                    </radialGradient>

                    {/* Mesh gradient for modern look */}
                    <linearGradient
                        id={`theme-mesh-${animationKey}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop
                            offset="0%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0.4"
                        />
                        <stop
                            offset="33%"
                            stopColor={themeColors?.accent || '#000000'}
                            stopOpacity="0.3"
                        />
                        <stop
                            offset="66%"
                            stopColor={themeColors?.secondary || '#000000'}
                            stopOpacity="0.2"
                        />
                        <stop
                            offset="100%"
                            stopColor={themeColors?.primary || '#000000'}
                            stopOpacity="0.4"
                        />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter
                        id={`theme-glow-${animationKey}`}
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Blur filter for depth */}
                    <filter id={`theme-blur-${animationKey}`}>
                        <feGaussianBlur stdDeviation="4" />
                    </filter>

                    {/* Animated pattern */}
                    <pattern
                        id={`theme-pattern-${animationKey}`}
                        x="0"
                        y="0"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="40"
                            cy="40"
                            r="2"
                            fill={themeColors?.primary || 'currentColor'}
                            opacity="0.4"
                        >
                            <animate
                                attributeName="r"
                                values="2;6;2"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.4;0.8;0.4"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </pattern>
                </defs>

                {/* Animated background mesh */}
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#theme-mesh-${animationKey})`}
                    opacity="0.3"
                    className="animate-theme-mesh"
                />

                {/* Large morphing circles */}
                <g className="animate-theme-morph-group">
                    <circle
                        cx="200"
                        cy="200"
                        r="300"
                        fill={`url(#theme-grad-1-${animationKey})`}
                        filter={`url(#theme-glow-${animationKey})`}
                        opacity="0.6"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0,0; 100,-50; 0,0"
                            dur="6s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="r"
                            values="300;400;300"
                            dur="6s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    <circle
                        cx="1720"
                        cy="880"
                        r="350"
                        fill={`url(#theme-grad-2-${animationKey})`}
                        filter={`url(#theme-glow-${animationKey})`}
                        opacity="0.5"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0,0; -100,50; 0,0"
                            dur="7s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="r"
                            values="350;450;350"
                            dur="7s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    <circle
                        cx="960"
                        cy="540"
                        r="250"
                        fill={`url(#theme-radial-${animationKey})`}
                        filter={`url(#theme-blur-${animationKey})`}
                        opacity="0.4"
                    >
                        <animate
                            attributeName="r"
                            values="250;350;250"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="0.4;0.7;0.4"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>

                {/* Morphing blob shapes */}
                <g className="animate-theme-blob-group">
                    <path
                        d="M 200 400 Q 400 200 600 400 T 1000 400"
                        fill={`url(#theme-grad-1-${animationKey})`}
                        opacity="0.4"
                        filter={`url(#theme-glow-${animationKey})`}
                    >
                        <animate
                            attributeName="d"
                            values="M 200 400 Q 400 200 600 400 T 1000 400;M 200 400 Q 400 300 600 400 T 1000 400;M 200 400 Q 400 200 600 400 T 1000 400"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </path>

                    <path
                        d="M 920 680 Q 1120 480 1320 680 T 1720 680"
                        fill={`url(#theme-grad-2-${animationKey})`}
                        opacity="0.3"
                        filter={`url(#theme-glow-${animationKey})`}
                    >
                        <animate
                            attributeName="d"
                            values="M 920 680 Q 1120 480 1320 680 T 1720 680;M 920 680 Q 1120 580 1320 680 T 1720 680;M 920 680 Q 1120 480 1320 680 T 1720 680"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                    </path>
                </g>

                {/* Animated wave paths */}
                <g className="animate-theme-waves">
                    <path
                        d="M0,300 Q480,200 960,300 T1920,300"
                        fill="none"
                        stroke={`url(#theme-grad-1-${animationKey})`}
                        strokeWidth="4"
                        opacity="0.5"
                    >
                        <animate
                            attributeName="d"
                            values="M0,300 Q480,200 960,300 T1920,300;M0,300 Q480,250 960,300 T1920,300;M0,300 Q480,200 960,300 T1920,300"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-1920;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    <path
                        d="M0,780 Q480,680 960,780 T1920,780"
                        fill="none"
                        stroke={`url(#theme-grad-2-${animationKey})`}
                        strokeWidth="4"
                        opacity="0.4"
                    >
                        <animate
                            attributeName="d"
                            values="M0,780 Q480,680 960,780 T1920,780;M0,780 Q480,730 960,780 T1920,780;M0,780 Q480,680 960,780 T1920,780"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;1920;0"
                            dur="10s"
                            repeatCount="indefinite"
                        />
                    </path>
                </g>

                {/* Floating particles */}
                <g className="animate-theme-particles">
                    {particles.map((particle) => (
                        <circle
                            key={particle.id}
                            cx={`${particle.x}%`}
                            cy={`${particle.y}%`}
                            r={particle.size}
                            fill={themeColors?.primary || 'currentColor'}
                            opacity="0.6"
                        >
                            <animate
                                attributeName="opacity"
                                values="0;0.8;0"
                                dur={`${particle.duration}s`}
                                repeatCount="indefinite"
                                begin={`${particle.delay}s`}
                            />
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                values={`0,0; ${(Math.random() - 0.5) * 200},${(Math.random() - 0.5) * 200}; 0,0`}
                                dur={`${particle.duration}s`}
                                repeatCount="indefinite"
                                begin={`${particle.delay}s`}
                            />
                            <animate
                                attributeName="r"
                                values={`${particle.size};${particle.size * 2};${particle.size}`}
                                dur={`${particle.duration}s`}
                                repeatCount="indefinite"
                                begin={`${particle.delay}s`}
                            />
                        </circle>
                    ))}
                </g>

                {/* Animated geometric shapes */}
                <g className="animate-theme-geometric">
                    <polygon
                        points="300,200 500,100 700,200 600,400 400,400"
                        fill={`url(#theme-grad-1-${animationKey})`}
                        opacity="0.3"
                        filter={`url(#theme-glow-${animationKey})`}
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 500 250;360 500 250"
                            dur="10s"
                            repeatCount="indefinite"
                        />
                    </polygon>

                    <polygon
                        points="1220,880 1420,780 1620,880 1520,1080 1320,1080"
                        fill={`url(#theme-grad-2-${animationKey})`}
                        opacity="0.25"
                        filter={`url(#theme-glow-${animationKey})`}
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 1420 930;-360 1420 930"
                            dur="12s"
                            repeatCount="indefinite"
                        />
                    </polygon>
                </g>

                {/* Animated grid pattern */}
                <g className="animate-theme-grid" opacity="0.2">
                    {Array.from({ length: 20 }, (_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={(i * 1080) / 20}
                            x2="1920"
                            y2={(i * 1080) / 20}
                            stroke={themeColors?.primary || 'currentColor'}
                            strokeWidth="1"
                        >
                            <animate
                                attributeName="opacity"
                                values="0;0.3;0"
                                dur="2s"
                                repeatCount="indefinite"
                                begin={`${(i * 0.1) % 2}s`}
                            />
                        </line>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={(i * 1920) / 30}
                            y1="0"
                            x2={(i * 1920) / 30}
                            y2="1080"
                            stroke={themeColors?.accent || 'currentColor'}
                            strokeWidth="1"
                        >
                            <animate
                                attributeName="opacity"
                                values="0;0.3;0"
                                dur="2.5s"
                                repeatCount="indefinite"
                                begin={`${(i * 0.1) % 2.5}s`}
                            />
                        </line>
                    ))}
                </g>
            </svg>

            {/* Center content with glassmorphism */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-8 relative z-10">
                    {/* Animated outer rings */}
                    <div className="absolute inset-0 flex items-center justify-center -m-32">
                        <svg
                            className="absolute w-[500px] h-[500px] animate-theme-ring-1"
                            viewBox="0 0 200 200"
                        >
                            <circle
                                cx="100"
                                cy="100"
                                r="90"
                                fill="none"
                                stroke={themeColors?.primary || 'currentColor'}
                                strokeWidth="2"
                                opacity="0.4"
                                strokeDasharray="15,10"
                            >
                                <animate
                                    attributeName="stroke-dashoffset"
                                    values="0;-200"
                                    dur="3s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </svg>
                        <svg
                            className="absolute w-[400px] h-[400px] animate-theme-ring-2"
                            viewBox="0 0 200 200"
                        >
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={themeColors?.accent || 'currentColor'}
                                strokeWidth="2"
                                opacity="0.5"
                                strokeDasharray="12,8"
                            >
                                <animate
                                    attributeName="stroke-dashoffset"
                                    values="0;200"
                                    dur="2.5s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </svg>
                        <svg
                            className="absolute w-[300px] h-[300px] animate-theme-ring-3"
                            viewBox="0 0 200 200"
                        >
                            <circle
                                cx="100"
                                cy="100"
                                r="70"
                                fill="none"
                                stroke={
                                    themeColors?.secondary || 'currentColor'
                                }
                                strokeWidth="2"
                                opacity="0.6"
                                strokeDasharray="10,5"
                            >
                                <animate
                                    attributeName="stroke-dashoffset"
                                    values="0;-150"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </svg>
                    </div>

                    {/* Main icon container with glassmorphism */}
                    <div className="relative">
                        {/* Glow effect */}
                        <div
                            className="absolute inset-0 -m-12 rounded-full blur-3xl animate-theme-icon-glow"
                            style={{
                                background:
                                    themeColors?.primary || 'currentColor',
                                opacity: 0.6,
                            }}
                        />

                        {/* Glassmorphic container */}
                        <div
                            className="relative p-10 rounded-3xl backdrop-blur-xl border-2 animate-theme-icon-container"
                            style={{
                                background: themeColors
                                    ? `${themeColors.primary}15`
                                    : 'rgba(255,255,255,0.1)',
                                borderColor: `${themeColors?.primary || 'currentColor'}40`,
                            }}
                        >
                            {/* Icon with rotation */}
                            <div className="relative">
                                <Palette
                                    className="h-24 w-24 animate-theme-icon"
                                    style={{
                                        color: themeColors?.primary,
                                    }}
                                />
                                {/* Rotating accent dots */}
                                {[...Array(12)].map((_, i) => {
                                    const angle = (i * 30 * Math.PI) / 180;
                                    const radius = 60;
                                    const x = Math.cos(angle) * radius;
                                    const y = Math.sin(angle) * radius;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full animate-theme-dot"
                                            style={{
                                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                                background:
                                                    themeColors?.accent ||
                                                    'currentColor',
                                                animationDelay: `${i * 0.08}s`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Theme name */}
                    {palette && (
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="text-4xl font-bold tracking-tight animate-theme-text"
                                style={{
                                    color: themeColors?.primary,
                                }}
                            >
                                {palette.name}
                            </div>
                            {palette.description && (
                                <div
                                    className="text-base font-medium opacity-90 animate-theme-description"
                                    style={{
                                        color: themeColors?.primary,
                                    }}
                                >
                                    {palette.description}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="relative w-80 h-2 rounded-full overflow-hidden bg-background/40 backdrop-blur-sm border border-primary/20">
                        <div
                            className="h-full rounded-full animate-theme-progress relative overflow-hidden"
                            style={{
                                background: themeColors
                                    ? `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.accent}, ${themeColors.secondary}, ${themeColors.primary})`
                                    : undefined,
                                backgroundSize: '200% 100%',
                            }}
                        >
                            <div
                                className="absolute inset-0 animate-theme-progress-shine"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern animation styles
const animationStyles = `
@keyframes theme-transition-overlay {
    0% {
        opacity: 0;
        backdrop-filter: blur(0px);
    }
    10% {
        opacity: 1;
        backdrop-filter: blur(20px);
    }
    90% {
        opacity: 1;
        backdrop-filter: blur(20px);
    }
    100% {
        opacity: 0;
        backdrop-filter: blur(0px);
    }
}

@keyframes theme-backdrop {
    0% {
        opacity: 0;
    }
    20% {
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

@keyframes theme-mesh {
    0% {
        opacity: 0;
        transform: scale(0.95);
    }
    50% {
        opacity: 0.3;
    }
    100% {
        opacity: 0;
        transform: scale(1.1);
    }
}

@keyframes theme-morph-group {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    30% {
        opacity: 1;
    }
    70% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: scale(1.2);
    }
}

@keyframes theme-blob-group {
    0% {
        opacity: 0;
    }
    25% {
        opacity: 0.5;
    }
    75% {
        opacity: 0.5;
    }
    100% {
        opacity: 0;
    }
}

@keyframes theme-waves {
    0% {
        opacity: 0;
    }
    30% {
        opacity: 0.6;
    }
    70% {
        opacity: 0.6;
    }
    100% {
        opacity: 0;
    }
}

@keyframes theme-particles {
    0% {
        opacity: 0;
    }
    20% {
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

@keyframes theme-geometric {
    0% {
        opacity: 0;
        transform: scale(0.7);
    }
    40% {
        opacity: 0.4;
    }
    60% {
        opacity: 0.4;
    }
    100% {
        opacity: 0;
        transform: scale(1.3);
    }
}

@keyframes theme-grid {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0.3;
    }
    100% {
        opacity: 0;
    }
}

@keyframes theme-ring-1 {
    0% {
        transform: scale(0.6) rotate(0deg);
        opacity: 0;
    }
    30% {
        opacity: 0.5;
    }
    70% {
        opacity: 0.5;
    }
    100% {
        transform: scale(1.4) rotate(360deg);
        opacity: 0;
    }
}

@keyframes theme-ring-2 {
    0% {
        transform: scale(0.7) rotate(0deg);
        opacity: 0;
    }
    30% {
        opacity: 0.6;
    }
    70% {
        opacity: 0.6;
    }
    100% {
        transform: scale(1.3) rotate(-360deg);
        opacity: 0;
    }
}

@keyframes theme-ring-3 {
    0% {
        transform: scale(0.8) rotate(0deg);
        opacity: 0;
    }
    30% {
        opacity: 0.7;
    }
    70% {
        opacity: 0.7;
    }
    100% {
        transform: scale(1.2) rotate(360deg);
        opacity: 0;
    }
}

@keyframes theme-icon-glow {
    0%, 100% {
        transform: scale(0.9);
        opacity: 0.4;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

@keyframes theme-icon-container {
    0% {
        transform: scale(0.5) rotateY(0deg) rotateX(0deg);
        opacity: 0;
    }
    30% {
        transform: scale(1.15) rotateY(180deg) rotateX(15deg);
        opacity: 1;
    }
    70% {
        transform: scale(1) rotateY(360deg) rotateX(0deg);
        opacity: 1;
    }
    100% {
        transform: scale(0.95) rotateY(360deg) rotateX(0deg);
        opacity: 0;
    }
}

@keyframes theme-icon {
    0% {
        transform: scale(0.3) rotate(0deg);
        opacity: 0;
    }
    30% {
        transform: scale(1.2) rotate(180deg);
        opacity: 1;
    }
    70% {
        transform: scale(1) rotate(360deg);
        opacity: 1;
    }
    100% {
        transform: scale(0.9) rotate(360deg);
        opacity: 0;
    }
}

@keyframes theme-dot {
    0%, 100% {
        transform: translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(0.3);
        opacity: 0;
    }
    50% {
        transform: translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(1.3);
        opacity: 1;
    }
}

@keyframes theme-text {
    0% {
        transform: translateY(50px) scale(0.8);
        opacity: 0;
        filter: blur(20px);
    }
    40% {
        opacity: 1;
        filter: blur(0px);
    }
    60% {
        opacity: 1;
        filter: blur(0px);
    }
    100% {
        transform: translateY(-50px) scale(1.2);
        opacity: 0;
        filter: blur(20px);
    }
}

@keyframes theme-description {
    0% {
        transform: translateY(30px);
        opacity: 0;
    }
    45% {
        opacity: 1;
    }
    55% {
        opacity: 1;
    }
    100% {
        transform: translateY(-30px);
        opacity: 0;
    }
}

@keyframes theme-progress {
    0% {
        transform: translateX(-100%);
        width: 0%;
    }
    50% {
        width: 100%;
    }
    100% {
        transform: translateX(0%);
        width: 100%;
    }
}

@keyframes theme-progress-shine {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(200%);
    }
}

.animate-theme-transition-overlay {
    animation: theme-transition-overlay 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-backdrop {
    animation: theme-backdrop 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-mesh {
    animation: theme-mesh 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-morph-group {
    animation: theme-morph-group 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-blob-group {
    animation: theme-blob-group 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-waves {
    animation: theme-waves 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-particles {
    animation: theme-particles 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-geometric {
    animation: theme-geometric 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-grid {
    animation: theme-grid 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-ring-1 {
    animation: theme-ring-1 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-ring-2 {
    animation: theme-ring-2 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-ring-3 {
    animation: theme-ring-3 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-icon-glow {
    animation: theme-icon-glow 1.5s ease-in-out infinite;
}

.animate-theme-icon-container {
    animation: theme-icon-container 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-icon {
    animation: theme-icon 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-dot {
    animation: theme-dot 2s ease-in-out infinite;
}

.animate-theme-text {
    animation: theme-text 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-description {
    animation: theme-description 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-progress {
    animation: theme-progress 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-theme-progress-shine {
    animation: theme-progress-shine 2s ease-in-out infinite;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
    const styleId = 'theme-transition-animations';
    const existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = animationStyles;
        document.head.appendChild(style);
    } else {
        // Update existing styles
        existingStyle.textContent = animationStyles;
    }
}
