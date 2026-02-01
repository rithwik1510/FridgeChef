# FridgeChef Project Rules & Memory

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Phosphor Icons
- **Backend**: Python FastAPI, SQLAlchemy 2.0, SQLite
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Deployment**: Vercel (frontend), Render (backend)

---

## Design System

### Colors (Tailwind Custom)
- `terracotta` - Primary accent (orange-ish)
- `cream` / `cream-dark` - Background colors
- `charcoal` - Text color

### Navigation Bar Rules
- **Mobile**: Bottom nav, height `h-16` (64px), landscape `h-14`
- **Center scan button**: Orange circle only, NO label, size `w-12 h-12`
- **Other nav items**: Icon + label (10px text)
- **DO NOT** make the nav bar protruding or oversized - keep it simple and flat
- Uses `items-center justify-around` for alignment

### Animations
- **AVOID** shimmer/skeleton loading animations - they cause reload feel
- **AVOID** wave/fade animations on page transitions
- Keep transitions simple: `transition-all duration-200`
- Use `active:scale-95` for tap feedback

---

## Lessons Learned (Mistakes to Avoid)

### 1. Navigation Bar Iterations
**Problem**: Tried multiple fancy designs (protruding button, PhonePe style, increased heights)
**Solution**: Simple flat design with h-16 height and minimal scan circle (no label) works best
**Rule**: Don't over-engineer the nav - simplicity wins

### 2. Gemini Model Versions
**Problem**: Model names changed/deprecated causing API failures
**Timeline**:
- `gemini-1.5-flash` → deprecated
- `gemini-2.0-flash` → issues
- `gemini-2.5-flash` → **CURRENT STABLE (use this)**
**Rule**: Always use `gemini-2.5-flash` for free tier stability

### 3. Page Transitions
**Problem**: Shimmer loading + fade animations made pages feel like they were reloading
**Solution**: Removed all shimmer/skeleton animations, simplified transitions
**Rule**: Minimal animations for mobile apps - they should feel native

### 4. Authentication Issues
**Problem**: Users getting logged out, 403 errors not handled
**Solution**:
- Proper auth persistence in frontend
- Handle 403 errors gracefully (redirect to login)
- CORS config must support credentials
**Rule**: Always test auth flow end-to-end after changes

### 5. CORS Configuration
**Problem**: Cross-origin requests failing between Vercel frontend and Render backend
**Solution**:
- Allow all Vercel preview URLs via regex
- Include credentials support
- Explicit allowed headers
**Rule**: Test CORS with actual deployed URLs, not just localhost

### 6. Password Validation
**Problem**: Frontend and backend had different min length requirements
**Solution**: Standardized to 8 characters minimum on both ends
**Rule**: Keep validation rules in sync between frontend and backend

### 7. SQLAlchemy 2.0 Compatibility
**Problem**: Old SQLAlchemy patterns not working
**Solution**: Updated to SQLAlchemy 2.0 patterns
**Rule**: Use modern SQLAlchemy 2.0 syntax for all database operations

---

## Code Patterns to Follow

### Frontend Components
```tsx
// Always use 'use client' for interactive components
'use client';

// Use Phosphor Icons (not Heroicons or Lucide)
import { Camera, House } from '@phosphor-icons/react';

// Use custom media query hooks
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';
```

### Tailwind Classes
```tsx
// Mobile-first responsive
className="lg:hidden"  // Show only on mobile/tablet
className="hidden lg:flex"  // Show only on desktop

// Standard button states
className="transition-all duration-200 active:scale-95"

// Active states use terracotta
className={active ? 'text-terracotta' : 'text-charcoal/50'}
```

### API Calls
```python
# Use gemini-2.5-flash model
model = genai.GenerativeModel('gemini-2.5-flash')
```

---

## File Locations

### Key Frontend Files
- `frontend/src/components/layout/Navigation.tsx` - Bottom nav component
- `frontend/src/hooks/useMediaQuery.ts` - Responsive hooks
- `frontend/tailwind.config.ts` - Custom colors/theme

### Key Backend Files
- `backend/app/main.py` - FastAPI app entry
- `backend/app/routers/` - API endpoints
- `backend/app/services/gemini_service.py` - AI integration

---

## Deployment Notes

### Vercel (Frontend)
- Auto-deploys from main branch
- Preview URLs need CORS allowlist

### Render (Backend)
- Check logs at Render dashboard if API fails
- Environment variables must include GEMINI_API_KEY

---

## Quick Fixes Reference

| Issue | Solution |
|-------|----------|
| Nav bar too big | Use `h-16`, remove scan label |
| API 403 errors | Check CORS config, auth headers |
| Gemini not working | Verify model is `gemini-2.5-flash` |
| Login not persisting | Check auth token storage |
| Page feels like reload | Remove shimmer/skeleton animations |

---

*Last Updated: 2026-02-01*
