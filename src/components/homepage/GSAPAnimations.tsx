import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface GSAPScrollAnimationProps {
    children: ReactNode;
    animation?:
        | 'fadeUp'
        | 'fadeDown'
        | 'fadeLeft'
        | 'fadeRight'
        | 'scale'
        | 'rotate'
        | 'blur'
        | 'parallax'
        | 'stagger'
        | 'wave'
        | 'magnetic'
        | 'reveal'
        | 'slide';
    delay?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
    markers?: boolean;
    className?: string;
}

export function GSAPScrollAnimation({
    children,
    animation = 'fadeUp',
    delay = 0,
    duration = 1,
    stagger = 0.1,
    ease = 'power3.out',
    start = 'top 80%',
    end = 'bottom 20%',
    scrub = false,
    pin = false,
    markers = false,
    className = '',
}: GSAPScrollAnimationProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            // Base animation configurations
            const animations = {
                fadeUp: {
                    y: 60,
                    opacity: 0,
                },
                fadeDown: {
                    y: -60,
                    opacity: 0,
                },
                fadeLeft: {
                    x: -60,
                    opacity: 0,
                },
                fadeRight: {
                    x: 60,
                    opacity: 0,
                },
                scale: {
                    scale: 0.8,
                    opacity: 0,
                },
                rotate: {
                    rotation: 15,
                    opacity: 0,
                },
                blur: {
                    filter: 'blur(10px)',
                    opacity: 0,
                },
                parallax: {
                    y: 100,
                },
                stagger: {
                    y: 40,
                    opacity: 0,
                },
                wave: {
                    y: 30,
                    rotation: 5,
                    opacity: 0,
                },
                magnetic: {
                    scale: 0.95,
                    opacity: 0,
                },
                reveal: {
                    clipPath: 'inset(0 100% 0 0)',
                },
                slide: {
                    x: -100,
                    opacity: 0,
                },
            };

            const initialState = animations[animation] || animations.fadeUp;

            // Set initial state
            gsap.set(element, initialState);

            // Create animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: start,
                    end: end,
                    scrub: scrub,
                    pin: pin,
                    markers: markers,
                    toggleActions: 'play none none reverse',
                },
            });

            // Animate based on type
            if (animation === 'stagger') {
                const children = element.children;
                tl.to(
                    children,
                    {
                        y: 0,
                        opacity: 1,
                        duration: duration,
                        ease: ease,
                        stagger: stagger,
                        delay: delay,
                    },
                    0
                );
            } else if (animation === 'wave') {
                const children = element.children;
                tl.to(
                    children,
                    {
                        y: 0,
                        rotation: 0,
                        opacity: 1,
                        duration: duration,
                        ease: 'elastic.out(1, 0.5)',
                        stagger: {
                            each: stagger,
                            from: 'start',
                        },
                        delay: delay,
                    },
                    0
                );
            } else if (animation === 'reveal') {
                tl.to(
                    element,
                    {
                        clipPath: 'inset(0 0% 0 0)',
                        duration: duration,
                        ease: ease,
                        delay: delay,
                    },
                    0
                );
            } else {
                tl.to(
                    element,
                    {
                        ...Object.fromEntries(
                            Object.keys(initialState).map((key) => [
                                key,
                                key === 'filter' ? 'blur(0px)' : 0,
                            ])
                        ),
                        opacity: 1,
                        duration: duration,
                        ease: ease,
                        delay: delay,
                    },
                    0
                );
            }
        }, elementRef);

        return () => ctx.revert();
    }, [
        animation,
        delay,
        duration,
        stagger,
        ease,
        start,
        end,
        scrub,
        pin,
        markers,
    ]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}

// Advanced parallax effect for hero sections
export function GSAPParallaxSection({
    children,
    speed = 0.5,
    className = '',
}: {
    children: ReactNode;
    speed?: number;
    className?: string;
}) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.to(element, {
                y: () => window.innerHeight * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, elementRef);

        return () => ctx.revert();
    }, [speed]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}

// Smooth scroll-driven counter animation
export function GSAPCountUp({
    end,
    duration = 2,
    suffix = '',
    prefix = '',
    decimals = 0,
    className = '',
}: {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    className?: string;
}) {
    const elementRef = useRef<HTMLSpanElement>(null);
    const counterRef = useRef({ value: 0 });

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.to(counterRef.current, {
                value: end,
                duration: duration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                onUpdate: function () {
                    if (element) {
                        element.textContent = `${prefix}${counterRef.current.value.toFixed(decimals)}${suffix}`;
                    }
                },
            });
        }, elementRef);

        return () => ctx.revert();
    }, [end, duration, suffix, prefix, decimals]);

    return (
        <span ref={elementRef} className={className}>
            {prefix}0{suffix}
        </span>
    );
}

// Magnetic hover effect for buttons/cards
export function GSAPMagneticElement({
    children,
    strength = 0.3,
    className = '',
}: {
    children: ReactNode;
    strength?: number;
    className?: string;
}) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(element, {
                x: deltaX,
                y: deltaY,
                duration: 0.5,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <div
            ref={elementRef}
            className={className}
            style={{ willChange: 'transform' }}
        >
            {children}
        </div>
    );
}

// Text reveal animation with split text effect
export function GSAPTextReveal({
    children,
    delay = 0,
    stagger = 0.03,
    className = '',
}: {
    children: string;
    delay?: number;
    stagger?: number;
    className?: string;
}) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            const words = element.querySelectorAll('.word');
            gsap.set(words, { opacity: 0, y: 20, rotationX: -90 });

            gsap.to(words, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.8,
                stagger: stagger,
                ease: 'back.out(1.7)',
                delay: delay,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        }, elementRef);

        return () => ctx.revert();
    }, [delay, stagger]);

    const words = children.split(' ');

    return (
        <div ref={elementRef} className={className}>
            {words.map((word, index) => (
                <span
                    key={index}
                    className="word inline-block"
                    style={{ perspective: '1000px' }}
                >
                    {word}
                    {index < words.length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </div>
    );
}

// Horizontal scroll section
export function GSAPHorizontalScroll({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;

        const ctx = gsap.context(() => {
            const scrollWidth = wrapper.scrollWidth - window.innerWidth;

            gsap.to(wrapper, {
                x: -scrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: () => `+=${scrollWidth}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={className}>
            <div ref={wrapperRef} className="flex w-fit">
                {children}
            </div>
        </div>
    );
}

// Smooth page load animation
export function GSAPPageLoad({ children }: { children: ReactNode }) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.2 });

            tl.from(element, {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
            });

            tl.from(
                element.children,
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
                '-=0.3'
            );
        }, elementRef);

        return () => ctx.revert();
    }, []);

    return <div ref={elementRef}>{children}</div>;
}

// Cursor follower effect
export function GSAPCursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const handleMouseMove = (e: MouseEvent) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out',
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="pointer-events-none fixed left-0 top-0 z-50 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary mix-blend-difference lg:block"
            style={{ willChange: 'transform' }}
        />
    );
}

// Scroll progress indicator
export function GSAPScrollProgress() {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const progress = progressRef.current;
        if (!progress) return;

        const ctx = gsap.context(() => {
            gsap.to(progress, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.3,
                },
            });
        }, progressRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
            <div
                ref={progressRef}
                className="h-full origin-left scale-x-0 bg-linear-to-r from-primary to-primary/50"
            />
        </div>
    );
}
