# FridgeChef Mobile Implementation Plan

**Goal:** Make FridgeChef fully mobile-responsive with consistent features and smooth animations across all devices.

**Timeline:** ~10-14 hours | **Priority:** High

---

## Current State Analysis

### What's Already Working ✅
- Mobile bottom navigation (4 items)
- Tablet horizontal navigation
- Responsive grid layouts (1 col → 2-3 cols)
- Typography scaling (h1-h6)
- 8 custom animations (fade-in, slide-up, scale-in, etc.)
- Consistent transitions (200-500ms)

### What's Missing ❌
- Touch targets too small (36px instead of 44px minimum)
- No mobile hamburger/drawer menu
- No JavaScript-level responsive detection (useMediaQuery)
- No tablet breakpoints for some pages
- Toast notifications overlap mobile nav
- No camera capture shortcut
- No landscape mode handling
- No reduced motion support (accessibility)
- No swipe gestures

---

## Phase 1: Foundation Layer (Critical)

### 1.1 Create useMediaQuery Hook

**New File:** `frontend/src/hooks/useMediaQuery.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Convenience hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

---

### 1.2 Fix Touch Target Sizes

**File:** `frontend/src/components/ui/Button.tsx`

**Current (Too Small):**
```typescript
const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[36px] gap-1.5',  // ❌ 36px
  md: 'px-4 py-2.5 text-base min-h-[44px] gap-2',
  lg: 'px-5 py-3 text-lg min-h-[52px] gap-2.5',
};
```

**Fixed (44px+ for touch):**
```typescript
const sizeStyles = {
  sm: 'px-4 py-2.5 text-sm min-h-[44px] gap-1.5',  // ✅ 44px
  md: 'px-5 py-3 text-base min-h-[48px] gap-2',    // ✅ 48px
  lg: 'px-6 py-3.5 text-lg min-h-[52px] gap-2.5',
};

// IconButton sizes
const iconSizeStyles = {
  sm: 'w-10 h-10',   // ✅ Changed from w-8 h-8 (32px → 40px)
  md: 'w-11 h-11',   // ✅ Changed from w-10 h-10 (40px → 44px)
  lg: 'w-12 h-12',
};
```

---

### 1.3 Add Reduced Motion Support (Accessibility)

**File:** `frontend/src/app/globals.css`

**Add to @layer base:**
```css
@layer base {
  /* Reduced Motion Support - Important for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

---

## Phase 2: Mobile Drawer Navigation

### 2.1 Create Mobile Drawer Component

**New File:** `frontend/src/components/layout/MobileDrawer.tsx`

**Features:**
- Slides in from left (280px width, max 85vw)
- Dark backdrop overlay with fade animation
- Swipe-to-close gesture support
- User info header with avatar
- All navigation items with staggered animations
- Sign out button at bottom
- Body scroll lock when open
- Escape key to close
- Focus trap for accessibility

**Key Implementation:**
```typescript
// Swipe to close detection
useEffect(() => {
  if (!isOpen || !drawerRef.current) return;

  let startX = 0;
  const drawer = drawerRef.current;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    if (diff > 50) onClose(); // Swipe left threshold
  };

  drawer.addEventListener('touchstart', handleTouchStart);
  drawer.addEventListener('touchmove', handleTouchMove);

  return () => {
    drawer.removeEventListener('touchstart', handleTouchStart);
    drawer.removeEventListener('touchmove', handleTouchMove);
  };
}, [isOpen, onClose]);
```

---

### 2.2 Add Hamburger Menu to Header

**File:** `frontend/src/components/layout/Header.tsx`

**Changes:**
```typescript
// Add imports
import { useState } from 'react';
import { List } from '@phosphor-icons/react';
import { MobileDrawer } from './MobileDrawer';

// Add state
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

// Add hamburger button (before logo, mobile only)
<div className="flex items-center gap-2">
  <button
    onClick={() => setIsDrawerOpen(true)}
    className="lg:hidden p-2 rounded-xl hover:bg-cream-dark/50
               transition-colors min-w-[44px] min-h-[44px]
               flex items-center justify-center"
    aria-label="Open menu"
  >
    <List size={24} weight="bold" />
  </button>
  <Link href="/dashboard">
    <Logo size="md" />
  </Link>
</div>

// Add drawer at end
<MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
```

---

## Phase 3: Mobile Animations

### 3.1 Add New Animation Keyframes

**File:** `frontend/tailwind.config.ts`

**Add to animation section:**
```typescript
animation: {
  // Existing animations...
  'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
  'slide-in-right': 'slideInRight 0.3s ease-out forwards',
  'slide-in-bottom': 'slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-out-bottom': 'slideOutBottom 0.3s ease-in forwards',
  'spring-scale': 'springScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  'tap-feedback': 'tapFeedback 0.15s ease-out',
},

keyframes: {
  // Existing keyframes...
  slideInLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  slideInRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  slideInBottom: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  springScale: {
    '0%': { transform: 'scale(0.8)', opacity: '0' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  tapFeedback: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(0.95)' },
    '100%': { transform: 'scale(1)' },
  },
},
```

---

### 3.2 Add Touch Utility Classes

**File:** `frontend/src/app/globals.css`

**Add to @layer utilities:**
```css
@layer utilities {
  /* Touch Target Minimum (Apple/Google guideline: 44px) */
  .touch-target {
    @apply min-w-[44px] min-h-[44px];
  }

  /* Safe Area Insets (for notched devices like iPhone X+) */
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .safe-top {
    padding-top: env(safe-area-inset-top, 0);
  }

  /* Touch Action Utilities */
  .touch-pan-x {
    touch-action: pan-x;
  }

  .touch-pan-y {
    touch-action: pan-y;
  }

  /* Active State for Touch Feedback */
  .active-scale {
    @apply active:scale-[0.97] transition-transform duration-100;
  }

  /* Prevent Text Selection on Interactive Elements */
  .no-select {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  /* GPU Acceleration for Smooth Animations */
  .will-change-transform {
    will-change: transform;
  }
}
```

---

## Phase 4: Toast Positioning Fix

**File:** `frontend/src/components/ui/Toast.tsx`

**Problem:** Toasts appear at `bottom-4` which overlaps the mobile navigation bar.

**Solution:** Move toasts above mobile nav on small screens.

**Update ToastContainer:**
```typescript
<div className="
  fixed z-50 flex flex-col gap-2 max-w-sm
  bottom-20 right-4 left-4     /* Mobile: above nav */
  sm:left-auto                  /* Tablet+: right aligned */
  lg:bottom-4                   /* Desktop: normal position */
  safe-bottom                   /* Notch safety */
">
```

---

## Phase 5: Tablet Breakpoint Optimization

### 5.1 Lists Page Grid

**File:** `frontend/src/app/(app)/lists/page.tsx`

**Current (jumps from 1 to 3 columns):**
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
```

**Fixed (smooth progression):**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

### 5.2 Recipes Page Grid

**File:** `frontend/src/app/(app)/recipes/page.tsx`

**Current:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Fixed (better tablet/desktop):**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Phase 6: Camera Capture for Mobile

**File:** `frontend/src/components/scan/ImageUploader.tsx`

**Add camera capture input:**
```typescript
// Add second input ref
const cameraRef = useRef<HTMLInputElement>(null);

// Add hidden camera input
<input
  ref={cameraRef}
  type="file"
  accept="image/*"
  capture="environment"  // Use rear camera
  onChange={handleChange}
  className="hidden"
/>

// Update buttons
<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
  {/* Camera button - prominent on mobile */}
  <Button
    variant="primary"
    size="lg"
    onClick={() => cameraRef.current?.click()}
    iconLeft={<Camera size={20} />}
    className="sm:hidden"  // Only on mobile
  >
    Take Photo
  </Button>

  {/* Gallery button */}
  <Button
    variant={isMobile ? 'outline' : 'primary'}
    size="lg"
    onClick={handleButtonClick}
  >
    {isMobile ? 'Choose from Gallery' : 'Choose Image'}
  </Button>
</div>
```

---

## Phase 7: Mobile Form Optimization

### 7.1 Create Touch-Friendly Slider

**New File:** `frontend/src/components/ui/Slider.tsx`

**Features:**
- Large touch area (48px height)
- Pointer events for smooth dragging
- Visual thumb scaling on drag
- Min/max labels
- Value display

```typescript
export const Slider: React.FC<SliderProps> = ({
  min, max, step = 1, value, onChange, label, valueLabel
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-semibold text-terracotta">
            {valueLabel ? valueLabel(value) : value}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        className="relative h-12 flex items-center cursor-pointer touch-pan-x"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-2 bg-cream-darker rounded-full" />

        {/* Filled portion */}
        <div
          className="absolute left-0 h-2 bg-terracotta rounded-full"
          style={{ width: `${percent}%` }}
        />

        {/* Thumb */}
        <div
          className={`absolute w-6 h-6 bg-terracotta rounded-full shadow-medium
                      transform -translate-x-1/2 transition-transform
                      ${isDragging ? 'scale-125' : 'hover:scale-110'}`}
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
};
```

---

### 7.2 Update Settings Page

**File:** `frontend/src/app/(app)/settings/page.tsx`

**Replace range input with Slider:**
```typescript
import { Slider } from '@/components/ui/Slider';

// Replace the range input with:
<Slider
  min={15}
  max={180}
  step={15}
  value={preferences.max_cook_time || 60}
  onChange={(v) => setPreferences({ ...preferences, max_cook_time: v })}
  label="Maximum Cooking Time"
  valueLabel={(v) => `${v} min`}
/>
```

---

### 7.3 Update Input Component

**File:** `frontend/src/components/ui/Input.tsx`

**Add mobile keyboard support:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Existing props...
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
}

// In the input element, add:
<input
  inputMode={inputMode}
  enterKeyHint={enterKeyHint}
  className="... text-base ..."  // text-base prevents iOS zoom
/>
```

---

## Phase 8: Landscape Mode Support

**File:** `frontend/src/components/layout/Navigation.tsx`

**Add landscape detection:**
```typescript
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';

const isLandscape = useIsLandscape();
const isMobile = useIsMobile();
const isMobileLandscape = isLandscape && isMobile;

// Compact nav in landscape
<nav className={`
  lg:hidden fixed bottom-0 left-0 right-0
  bg-cream border-t border-charcoal/10 z-40
  ${isMobileLandscape ? 'h-12' : 'h-16'}
  safe-bottom
`}>
  <div className={`flex justify-around items-center h-full
                   ${isMobileLandscape ? 'max-w-md mx-auto' : ''}`}>
    {navItems.map((item) => (
      <Link
        className={`flex items-center justify-center
          ${isMobileLandscape ? 'flex-row gap-2 min-h-[40px]' : 'flex-col min-h-[44px]'}
        `}
      >
        <Icon size={isMobileLandscape ? 20 : 24} />
        <span className={isMobileLandscape ? 'text-sm' : 'text-xs'}>
          {item.label}
        </span>
      </Link>
    ))}
  </div>
</nav>
```

---

## Phase 9: Swipe Gestures (Optional Enhancement)

### 9.1 Create useSwipe Hook

**New File:** `frontend/src/hooks/useSwipe.ts`

```typescript
export function useSwipe<T extends HTMLElement>(options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const startX = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(diff) > (options.threshold || 50)) {
        if (diff > 0) options.onSwipeRight?.();
        else options.onSwipeLeft?.();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [options]);

  return ref;
}
```

---

## Files Summary

### New Files to Create (4)
| File | Purpose |
|------|---------|
| `frontend/src/hooks/useMediaQuery.ts` | Responsive detection hooks |
| `frontend/src/hooks/useSwipe.ts` | Touch gesture detection |
| `frontend/src/components/layout/MobileDrawer.tsx` | Slide-out navigation menu |
| `frontend/src/components/ui/Slider.tsx` | Touch-friendly range input |

### Files to Modify (11)
| File | Changes |
|------|---------|
| `frontend/tailwind.config.ts` | Add mobile animations |
| `frontend/src/app/globals.css` | Touch utilities, reduced motion |
| `frontend/src/components/ui/Button.tsx` | Touch target sizes |
| `frontend/src/components/ui/Tag.tsx` | Touch target sizes |
| `frontend/src/components/ui/Input.tsx` | Mobile keyboard support |
| `frontend/src/components/ui/Toast.tsx` | Mobile positioning |
| `frontend/src/components/layout/Header.tsx` | Hamburger menu |
| `frontend/src/components/layout/Navigation.tsx` | Landscape mode |
| `frontend/src/components/scan/ImageUploader.tsx` | Camera capture |
| `frontend/src/app/(app)/lists/page.tsx` | Tablet grid |
| `frontend/src/app/(app)/settings/page.tsx` | New slider component |

---

## Testing Checklist

### Device Testing Matrix
| Device | Screen Width | Test |
|--------|-------------|------|
| iPhone SE | 320px | ☐ |
| iPhone 12/13/14 | 390px | ☐ |
| iPhone Plus/Max | 428px | ☐ |
| iPad Mini | 768px | ☐ |
| iPad Pro | 1024px | ☐ |
| Landscape Phone | 568px-896px | ☐ |

### Feature Testing
- [ ] All buttons have 44px+ touch targets
- [ ] Mobile drawer opens/closes smoothly
- [ ] Drawer swipe-to-close works
- [ ] Toast appears above bottom nav on mobile
- [ ] Camera capture works on mobile browser
- [ ] Slider is easy to drag on touch
- [ ] Landscape mode shows compact nav
- [ ] Reduced motion disables animations
- [ ] No horizontal scroll on any page
- [ ] Forms don't zoom on iOS

### Browser Testing
- [ ] Safari iOS 14+
- [ ] Chrome Android 90+
- [ ] Samsung Internet 15+

---

## Implementation Priority

| Phase | Priority | Time Est. | Depends On |
|-------|----------|-----------|------------|
| 1. Foundation | Critical | 1-2 hrs | - |
| 2. Mobile Navigation | High | 2-3 hrs | Phase 1 |
| 3. Mobile Animations | High | 1-2 hrs | Phase 1 |
| 4. Toast Fix | High | 15 min | - |
| 5. Tablet Breakpoints | Medium | 30 min | - |
| 6. Camera Capture | Medium | 1 hr | Phase 1 |
| 7. Form Optimization | Medium | 1-2 hrs | Phase 1 |
| 8. Landscape Mode | Low | 1 hr | Phase 1 |
| 9. Swipe Gestures | Low | 1-2 hrs | Phase 1 |

**Total Estimated Time: 10-14 hours**

---

## Quick Start Commands

```bash
# Start development
cd frontend
npm run dev

# Test build
npm run build

# Lint check
npm run lint
```

---

## Notes

- All animations use CSS-only approach (no external libraries)
- Touch targets follow Apple (44pt) and Google (48dp) guidelines
- Safe area insets handle notched devices (iPhone X+)
- Reduced motion respects user accessibility preferences
- Camera capture uses `capture="environment"` for rear camera
