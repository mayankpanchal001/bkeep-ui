# GSAP Animations Documentation

## Overview

BKeep Accounting Homepage uses **GSAP (GreenSock Animation Platform)** with **ScrollTrigger** for advanced, performant animations. This document provides comprehensive guidance on the animation system.

---

## 📦 Installation

GSAP is already installed. If you need to reinstall:

```bash
npm install gsap
```

## 🎯 Core Concepts

### Animation Components

Located in: `src/components/homepage/GSAPAnimations.tsx`

All animation components are modular, reusable, and follow React best practices.

---

## 🚀 Available Animation Components

### 1. **GSAPScrollAnimation**

Main component for scroll-triggered animations with multiple animation types.

#### Props

| Prop        | Type           | Default        | Description                                |
| ----------- | -------------- | -------------- | ------------------------------------------ |
| `children`  | ReactNode      | required       | Content to animate                         |
| `animation` | string         | `'fadeUp'`     | Animation type (see below)                 |
| `delay`     | number         | `0`            | Delay in seconds                           |
| `duration`  | number         | `1`            | Animation duration in seconds              |
| `stagger`   | number         | `0.1`          | Stagger delay between children             |
| `ease`      | string         | `'power3.out'` | GSAP easing function                       |
| `start`     | string         | `'top 80%'`    | ScrollTrigger start position               |
| `end`       | string         | `'bottom 20%'` | ScrollTrigger end position                 |
| `scrub`     | boolean/number | `false`        | Enable scrubbing (smooth scroll animation) |
| `pin`       | boolean        | `false`        | Pin element during scroll                  |
| `markers`   | boolean        | `false`        | Show debug markers (dev only)              |
| `className` | string         | `''`           | CSS classes                                |

#### Animation Types

##### **fadeUp** (default)

Fades in from bottom with Y translation.

```tsx
<GSAPScrollAnimation animation="fadeUp">
    <YourComponent />
</GSAPScrollAnimation>
```

##### **fadeDown**

Fades in from top.

```tsx
<GSAPScrollAnimation animation="fadeDown" duration={1.2}>
    <Navigation />
</GSAPScrollAnimation>
```

##### **fadeLeft**

Slides in from left.

```tsx
<GSAPScrollAnimation animation="fadeLeft" ease="power3.out">
    <BenefitsSection />
</GSAPScrollAnimation>
```

##### **fadeRight**

Slides in from right.

```tsx
<GSAPScrollAnimation animation="fadeRight">
    <Sidebar />
</GSAPScrollAnimation>
```

##### **scale**

Scales up from 0.8 to 1.

```tsx
<GSAPScrollAnimation animation="scale" ease="back.out(1.4)">
    <PricingSection />
</GSAPScrollAnimation>
```

##### **rotate**

Rotates and fades in.

```tsx
<GSAPScrollAnimation animation="rotate" duration={1.2}>
    <Card />
</GSAPScrollAnimation>
```

##### **blur**

Animates from blurred to sharp.

```tsx
<GSAPScrollAnimation animation="blur" duration={1.4}>
    <ImageGallery />
</GSAPScrollAnimation>
```

##### **parallax**

Smooth parallax scroll effect.

```tsx
<GSAPScrollAnimation animation="parallax" scrub={true}>
    <BackgroundImage />
</GSAPScrollAnimation>
```

##### **stagger**

Animates children in sequence.

```tsx
<GSAPScrollAnimation animation="stagger" stagger={0.2}>
    <div className="grid">
        <Card />
        <Card />
        <Card />
    </div>
</GSAPScrollAnimation>
```

##### **wave**

Elastic wave-like entrance.

```tsx
<GSAPScrollAnimation animation="wave" stagger={0.15}>
    <FeaturesGrid />
</GSAPScrollAnimation>
```

##### **magnetic**

Subtle magnetic pull effect.

```tsx
<GSAPScrollAnimation animation="magnetic">
    <InteractiveElement />
</GSAPScrollAnimation>
```

##### **reveal**

Horizontal reveal (wipe effect).

```tsx
<GSAPScrollAnimation animation="reveal" duration={1.5}>
    <Hero />
</GSAPScrollAnimation>
```

##### **slide**

Horizontal slide entrance.

```tsx
<GSAPScrollAnimation animation="slide">
    <Sidebar />
</GSAPScrollAnimation>
```

---

### 2. **GSAPParallaxSection**

Creates smooth parallax scrolling effects.

#### Props

| Prop        | Type      | Default  | Description          |
| ----------- | --------- | -------- | -------------------- |
| `children`  | ReactNode | required | Content to parallax  |
| `speed`     | number    | `0.5`    | Parallax speed (0-1) |
| `className` | string    | `''`     | CSS classes          |

#### Usage

```tsx
<GSAPParallaxSection speed={0.3}>
    <HeroSection />
</GSAPParallaxSection>
```

**Speed Guide:**

- `0.1` - Very subtle
- `0.3` - Gentle movement (recommended for hero)
- `0.5` - Noticeable parallax
- `0.8` - Strong effect

---

### 3. **GSAPCountUp**

Animated number counter with scroll trigger.

#### Props

| Prop        | Type   | Default  | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| `end`       | number | required | Target number                  |
| `duration`  | number | `2`      | Animation duration             |
| `prefix`    | string | `''`     | Text before number (e.g., "$") |
| `suffix`    | string | `''`     | Text after number (e.g., "+")  |
| `decimals`  | number | `0`      | Decimal places                 |
| `className` | string | `''`     | CSS classes                    |

#### Usage

```tsx
<GSAPCountUp
    end={90}
    suffix="%"
    duration={2.5}
    className="text-4xl font-bold"
/>
```

**Examples:**

```tsx
// Percentage
<GSAPCountUp end={95} suffix="%" />

// Currency
<GSAPCountUp end={1500000} prefix="$" decimals={2} />

// Count
<GSAPCountUp end={1200} suffix="+" />
```

---

### 4. **GSAPMagneticElement**

Interactive magnetic hover effect (follows mouse).

#### Props

| Prop        | Type      | Default  | Description          |
| ----------- | --------- | -------- | -------------------- |
| `children`  | ReactNode | required | Content to magnetize |
| `strength`  | number    | `0.3`    | Pull strength (0-1)  |
| `className` | string    | `''`     | CSS classes          |

#### Usage

```tsx
<GSAPMagneticElement strength={0.15}>
    <Button>Get Started</Button>
</GSAPMagneticElement>
```

**Strength Guide:**

- `0.05` - Very subtle (cards, large elements)
- `0.15` - Moderate (buttons, CTAs)
- `0.3` - Strong (badges, small elements)

---

### 5. **GSAPTextReveal**

Split text animation revealing word-by-word.

#### Props

| Prop        | Type   | Default  | Description         |
| ----------- | ------ | -------- | ------------------- |
| `children`  | string | required | Text to animate     |
| `delay`     | number | `0`      | Start delay         |
| `stagger`   | number | `0.03`   | Delay between words |
| `className` | string | `''`     | CSS classes         |

#### Usage

```tsx
<GSAPTextReveal delay={0.3} stagger={0.05} className="text-5xl font-bold">
    Close the books in half the time
</GSAPTextReveal>
```

---

### 6. **GSAPHorizontalScroll**

Creates horizontal scrolling sections.

#### Props

| Prop        | Type      | Default  | Description       |
| ----------- | --------- | -------- | ----------------- |
| `children`  | ReactNode | required | Content to scroll |
| `className` | string    | `''`     | CSS classes       |

#### Usage

```tsx
<GSAPHorizontalScroll>
    <div className="flex gap-8">
        <Card />
        <Card />
        <Card />
        <Card />
    </div>
</GSAPHorizontalScroll>
```

---

### 7. **GSAPPageLoad**

Orchestrates page entrance animation.

#### Usage

```tsx
export default function Page() {
    return (
        <GSAPPageLoad>
            <div>Your page content</div>
        </GSAPPageLoad>
    );
}
```

---

### 8. **GSAPCursorFollower**

Custom animated cursor (desktop only).

#### Usage

```tsx
// Add to your layout/page
<GSAPCursorFollower />
```

**Features:**

- Follows mouse with smooth lag
- Blend mode effect
- Auto-hidden on mobile

---

### 9. **GSAPScrollProgress**

Animated scroll progress bar at top of page.

#### Usage

```tsx
// Add to your layout/page
<GSAPScrollProgress />
```

---

## 🎨 Complete Homepage Example

```tsx
import {
    GSAPScrollAnimation,
    GSAPParallaxSection,
    GSAPPageLoad,
    GSAPScrollProgress,
    GSAPCursorFollower,
} from '@/components/homepage/GSAPAnimations';

export default function Homepage() {
    return (
        <GSAPPageLoad>
            <div>
                {/* Progress bar */}
                <GSAPScrollProgress />

                {/* Custom cursor */}
                <GSAPCursorFollower />

                {/* Hero with parallax */}
                <GSAPParallaxSection speed={0.3}>
                    <GSAPScrollAnimation animation="scale" duration={1.2}>
                        <HeroSection />
                    </GSAPScrollAnimation>
                </GSAPParallaxSection>

                {/* Features with wave effect */}
                <GSAPScrollAnimation animation="wave" stagger={0.2}>
                    <FeaturesSection />
                </GSAPScrollAnimation>

                {/* Stats with stagger */}
                <GSAPScrollAnimation animation="stagger" stagger={0.15}>
                    <StatsSection />
                </GSAPScrollAnimation>
            </div>
        </GSAPPageLoad>
    );
}
```

---

## 🎭 Easing Functions

### Common Easings

```tsx
// Default
ease = 'power3.out'; // Smooth deceleration

// Snappy
ease = 'power4.out'; // Sharp deceleration
ease = 'back.out(1.7)'; // Overshoot effect

// Bouncy
ease = 'elastic.out(1, 0.5)'; // Elastic bounce

// Linear
ease = 'none'; // Constant speed

// Custom
ease = 'power2.inOut'; // Accelerate then decelerate
```

### When to Use Each

| Easing          | Best For           | Example             |
| --------------- | ------------------ | ------------------- |
| `power3.out`    | General animations | Most scroll reveals |
| `power4.out`    | Hero sections      | Main headlines      |
| `back.out(1.4)` | Cards/buttons      | Pricing cards       |
| `elastic.out`   | Playful elements   | Badges, icons       |
| `none`          | Parallax/scrub     | Background elements |

---

## 📐 ScrollTrigger Positions

### Start/End Format

```tsx
start = 'trigger viewport';
end = 'trigger viewport';
```

### Common Positions

```tsx
// Start when top of element hits 80% down viewport
start = 'top 80%';

// Start when top hits center
start = 'top center';

// Start when top hits top
start = 'top top';

// End when bottom hits 20% from top
end = 'bottom 20%';

// End relative to scroll distance
end = '+=500';
```

### Visual Guide

```
Viewport:
┌─────────────────────┐ 0%   (top)
│                     │
├─────────────────────┤ 20%
│                     │
├─────────────────────┤ 50%  (center)
│                     │
├─────────────────────┤ 80%
│                     │
└─────────────────────┘ 100% (bottom)
```

---

## 🎯 Best Practices

### 1. **Performance**

```tsx
// ✅ Good - Animates transforms (GPU accelerated)
<GSAPScrollAnimation animation="fadeUp">

// ❌ Avoid - Don't animate width/height
gsap.to(element, { width: '100%' })
```

### 2. **Timing**

```tsx
// ✅ Good - Staggered reveals feel natural
<GSAPScrollAnimation animation="stagger" stagger={0.15}>
    <Cards />
</GSAPScrollAnimation>

// ❌ Too slow - Users get impatient
stagger={0.5}
```

### 3. **Subtlety**

```tsx
// ✅ Good - Subtle, professional
<GSAPMagneticElement strength={0.15}>

// ❌ Too aggressive - Distracting
<GSAPMagneticElement strength={0.8}>
```

### 4. **Mobile Considerations**

```tsx
// Reduce animation intensity on mobile
const isMobile = window.innerWidth < 768;

<GSAPScrollAnimation
    duration={isMobile ? 0.6 : 1.2}
    animation={isMobile ? "fadeUp" : "wave"}
>
```

### 5. **Cleanup**

All animations auto-cleanup on unmount using GSAP context. No manual cleanup needed!

---

## 🐛 Debugging

### Enable Markers

```tsx
<GSAPScrollAnimation markers={true}>
    <YourComponent />
</GSAPScrollAnimation>
```

This shows visual indicators of trigger points (development only).

### ScrollTrigger Refresh

If elements jump or don't trigger correctly:

```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger';

useEffect(() => {
    // After images load or layout changes
    ScrollTrigger.refresh();
}, []);
```

---

## 🎨 Animation Combinations

### Hero Section

```tsx
<GSAPParallaxSection speed={0.3}>
    <GSAPScrollAnimation animation="scale" duration={1.2}>
        <GSAPTextReveal stagger={0.05}>Your Amazing Headline</GSAPTextReveal>

        <GSAPMagneticElement strength={0.15}>
            <Button>Get Started</Button>
        </GSAPMagneticElement>
    </GSAPScrollAnimation>
</GSAPParallaxSection>
```

### Feature Cards

```tsx
<GSAPScrollAnimation animation="wave" stagger={0.2}>
    <div className="grid grid-cols-3">
        <GSAPMagneticElement strength={0.1}>
            <Card />
        </GSAPMagneticElement>
        {/* More cards */}
    </div>
</GSAPScrollAnimation>
```

### Stats Counter

```tsx
<GSAPScrollAnimation animation="stagger" stagger={0.15}>
    <div className="stats-grid">
        <div>
            <GSAPCountUp end={90} suffix="%" duration={2.5} />
            <p>Accuracy</p>
        </div>
        {/* More stats */}
    </div>
</GSAPScrollAnimation>
```

---

## 📊 Performance Tips

### 1. **Use `will-change`**

Already built into components, but if adding custom animations:

```tsx
<div style={{ willChange: 'transform' }}>
```

### 2. **Batch Updates**

GSAP automatically batches, but avoid creating many ScrollTriggers:

```tsx
// ✅ Good - One trigger for section
<GSAPScrollAnimation animation="stagger">
    <div className="grid">
        <Card /> {/* No individual triggers */}
    </div>
</GSAPScrollAnimation>

// ❌ Avoid - Too many triggers
<div className="grid">
    <GSAPScrollAnimation><Card /></GSAPScrollAnimation>
    <GSAPScrollAnimation><Card /></GSAPScrollAnimation>
    {/* 20 more... */}
</div>
```

### 3. **Lazy Load Heavy Animations**

```tsx
// Only animate when in viewport
start = 'top 90%'; // Trigger earlier
```

---

## 🔧 Advanced Customization

### Custom Timeline

```tsx
import { gsap } from 'gsap';

useEffect(() => {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: elementRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
        },
    });

    tl.to('.element-1', { x: 100 })
        .to('.element-2', { y: 50 }, '<')
        .to('.element-3', { opacity: 0 });
}, []);
```

### Responsive Animations

```tsx
const animation = useBreakpointValue({
    base: 'fadeUp',
    md: 'wave',
    lg: 'stagger'
});

<GSAPScrollAnimation animation={animation}>
```

---

## 📚 Resources

### Official GSAP Docs

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Easing Visualizer](https://greensock.com/ease-visualizer/)

### Learning

- [GSAP Getting Started](https://greensock.com/get-started/)
- [ScrollTrigger Tutorial](https://greensock.com/st-demos/)

---

## 🎯 Quick Reference

### Animation Speed Guide

| Duration | Use Case                  |
| -------- | ------------------------- |
| 0.3s     | Micro-interactions        |
| 0.6s     | Buttons, small elements   |
| 1.0s     | Cards, sections (default) |
| 1.5s     | Hero, major reveals       |
| 2.0s+    | Cinematic effects         |

### Stagger Timing

| Stagger | Use Case           |
| ------- | ------------------ |
| 0.05s   | Text words         |
| 0.1s    | Small items (list) |
| 0.15s   | Cards in grid      |
| 0.2s    | Large sections     |

---

## ✅ Checklist for New Animations

- [ ] Component wrapped in animation component
- [ ] Appropriate animation type selected
- [ ] Duration feels natural (0.8-1.5s)
- [ ] Easing matches brand (power3.out default)
- [ ] Start trigger at 75-80% viewport
- [ ] Tested on mobile (reduced motion)
- [ ] No layout shift during animation
- [ ] `willChange` applied if custom
- [ ] Cleanup handled (auto with our components)

---

## 🚀 Ready to Animate!

All components are production-ready and optimized. Start with simple `fadeUp` animations and add complexity as needed. The animations are designed to be:

✨ **Subtle** - Enhance, don't distract  
⚡ **Performant** - GPU-accelerated transforms  
📱 **Responsive** - Works on all devices  
♿ **Accessible** - Respects prefers-reduced-motion  
🎨 **Beautiful** - Professional and polished

Happy animating! 🎉
