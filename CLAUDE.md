# FridgeChef Project Rules & Memory

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Phosphor Icons
- **Backend**: Python FastAPI, SQLAlchemy 2.0, SQLite
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Deployment**: Vercel (frontend), Render (backend)

---

## Development Commands

### Backend
- **Run Tests**: `pytest`
- **Run Tests with Coverage**: `pytest --cov=app`
- **Start Server**: `uvicorn app.main:app --reload` (or use `start_backend.bat` on Windows)

### Frontend
- **Start Dev Server**: `npm run dev`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- *Note: Frontend tests are not currently configured.*

---

## Design System

### Colors (Tailwind Custom)
- `terracotta` - Primary accent (orange-ish)
- `sage` - Secondary accent (green-ish)
- `butter` - Tertiary accent (yellow-ish)
- `cream` / `cream-dark` / `cream-darker` / `cream-lightest` - Background colors
- `charcoal` - Text color

### Icon Styling Rules
- **ALWAYS** use Phosphor Icons (not Heroicons, Lucide, or emojis)
- **NEVER** use raw emojis in the UI - replace with styled icons
- **Icon container pattern**:
```tsx
// Standard icon container with background
<div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center">
  <Camera size={28} className="text-terracotta" weight="duotone" />
</div>

// Smaller variant
<div className="p-3 bg-sage/10 rounded-xl">
  <ForkKnife size={28} weight="duotone" className="text-sage" />
</div>
```
- Use `weight="duotone"` for feature icons
- Use `weight="bold"` for action buttons
- Match icon color to background: `bg-terracotta/10` + `text-terracotta`

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
- Use `animate-bounce-subtle` for loading indicators (not shimmer)

---

## Auth Flow Rules

### Public vs Protected Routes
- **Public routes**: Homepage (`/`), Dashboard, Recipes list, Shopping lists
- **Protected routes**: Scan page (requires login to use AI features)
- **Pattern**: Let users browse freely, only require login for actions that need it

### Implementation Pattern
```tsx
// In protected pages (e.g., scan/page.tsx)
const { isAuthenticated, hasHydrated, isLoading } = useAuthStore();

useEffect(() => {
  if (hasHydrated && !isLoading && !isAuthenticated) {
    router.push('/login?redirect=/scan');  // Include redirect param
  }
}, [hasHydrated, isLoading, isAuthenticated, router]);

if (!hasHydrated || isLoading || !isAuthenticated) {
  return null;
}
```

### Login Redirect Pattern
```tsx
// In login page - read redirect param
const searchParams = useSearchParams();
const redirectUrl = searchParams.get('redirect') || '/dashboard';

// After successful login
router.push(redirectUrl);
```

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

### 8. Next.js useSearchParams SSR Error
**Problem**: `useSearchParams()` causes build error: "should be wrapped in a suspense boundary"
**Solution**: Wrap component using `useSearchParams` in `<Suspense>` boundary
**Rule**: Always wrap useSearchParams in Suspense
```tsx
// WRONG - causes build error
export default function Page() {
  const searchParams = useSearchParams();  // Error!
  return <div>...</div>;
}

// CORRECT - wrap in Suspense
function PageContent() {
  const searchParams = useSearchParams();
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}
```

### 9. Emojis vs Icons
**Problem**: Raw emojis (📸🍳🛒) look inconsistent and unprofessional
**Solution**: Replace all emojis with styled Phosphor Icons in containers
**Rule**: NEVER use emojis in UI - always use Phosphor Icons with proper styling

### 10. Auth Blocking All Routes
**Problem**: Blocking all (app) routes for unauthenticated users prevents exploration
**Solution**: Only protect routes that actually need auth (scan). Let users browse freely.
**Rule**: Don't over-protect - only require auth where necessary

### 11. SQLAlchemy JSON Mutation Detection
**Problem**: Updating JSON/dict fields doesn't trigger SQLAlchemy to detect changes
**Solution**: Use `flag_modified()` or reassign the field
```python
from sqlalchemy.orm import attributes
attributes.flag_modified(user, 'settings')
# OR
user.settings = {**user.settings, 'new_key': 'value'}
```
**Rule**: Always flag_modified for JSON field updates

### 12. localStorage in Private Browsing
**Problem**: `localStorage.setItem()` throws QuotaExceededError in private/incognito mode
**Solution**: Always wrap localStorage calls in try-catch with fallback
```typescript
// WRONG - crashes in incognito
localStorage.setItem('auth_token', token);

// CORRECT - safe wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try { return localStorage.getItem(key); }
    catch { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); }
    catch { /* silently fail */ }
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key); }
    catch { /* silently fail */ }
  }
};
```
**Rule**: NEVER use raw localStorage - always use safe wrapper

### 13. TypeScript `any` Type Abuse
**Problem**: Using `any` defeats TypeScript's type safety, leads to runtime errors
**Solution**: Define proper interfaces for all data structures
```typescript
// WRONG
const [recipes, setRecipes] = useState<any[]>([]);
catch (err: any) { ... }

// CORRECT
interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
}
const [recipes, setRecipes] = useState<Recipe[]>([]);
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';
}
```
**Rule**: Define interfaces in `types/` folder, use `unknown` for catch blocks

### 14. Missing Error Boundaries
**Problem**: Unhandled errors crash entire app with no recovery
**Solution**: Use Next.js `error.tsx` files at route boundaries
```typescript
// app/(app)/error.tsx - catches errors in (app) route group
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```
**Rule**: Always have error.tsx at app root and major route groups

### 15. Rate Limiting Consistency
**Problem**: Some API endpoints unprotected, allowing abuse
**Solution**: Apply rate limits to ALL write operations
```python
# Always rate limit mutations
@router.post("/items")
@limiter.limit("20/minute")  # Write operations
async def create_item(...): ...

@router.get("/items")
@limiter.limit("60/minute")  # Read operations can be higher
async def list_items(...): ...
```
**Rule**: All POST/PUT/DELETE endpoints need rate limits

---

## Code Patterns to Follow

### Frontend Components
```tsx
// Always use 'use client' for interactive components
'use client';

// Use Phosphor Icons (not Heroicons or Lucide)
import { Camera, House, Sun, Moon } from '@phosphor-icons/react';

// Use custom media query hooks
import { useIsLandscape, useIsMobile } from '@/hooks/useMediaQuery';

// Use auth store for protected features
import { useAuthStore } from '@/store/auth';
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

// Icon containers
className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center"
className="p-3 bg-sage/10 rounded-xl"
```

### Hook Patterns
```tsx
// Return React components from hooks when needed
interface SeasonalGreeting {
  greeting: string;
  Icon: ComponentType<IconProps>;  // Return component, not emoji string
  iconColor: string;
  iconBgColor: string;
}
```

### API Calls
```python
# Use gemini-2.5-flash model
model = genai.GenerativeModel('gemini-2.5-flash')
```

---

## File Locations

### Key Frontend Files
- `frontend/src/app/(app)/layout.tsx` - App shell (header, nav, sidebar)
- `frontend/src/app/(app)/scan/page.tsx` - Scan page (protected)
- `frontend/src/app/(app)/dashboard/page.tsx` - Dashboard with seasonal greeting
- `frontend/src/app/login/page.tsx` - Login with redirect support
- `frontend/src/components/layout/Navigation.tsx` - Bottom nav component
- `frontend/src/components/ui/ProgressBar.tsx` - Cooking progress with icons
- `frontend/src/hooks/useSeasonalSurprise.ts` - Time/holiday greetings with icons
- `frontend/src/hooks/useMediaQuery.ts` - Responsive hooks
- `frontend/src/store/auth.ts` - Auth state management
- `frontend/tailwind.config.ts` - Custom colors/theme

### Key Backend Files
- `backend/app/main.py` - FastAPI app entry
- `backend/app/routers/` - API endpoints
- `backend/app/services/gemini_service.py` - AI integration
- `backend/app/models/` - SQLAlchemy models

---

## Deployment Notes

### Vercel (Frontend)
- Auto-deploys from main branch
- Preview URLs need CORS allowlist
- Environment: `NEXT_PUBLIC_API_URL`

### Render (Backend)
- Check logs at Render dashboard if API fails
- Environment variables must include `GEMINI_API_KEY`
- Database persists in `/opt/render/project/src/`

---

## Quick Fixes Reference

| Issue | Solution |
|-------|----------|
| Nav bar too big | Use `h-16`, remove scan label |
| API 403 errors | Check CORS config, auth headers |
| Gemini not working | Verify model is `gemini-2.5-flash` |
| Login not persisting | Check auth token storage |
| Page feels like reload | Remove shimmer/skeleton animations |
| useSearchParams error | Wrap in `<Suspense>` boundary |
| Emojis look bad | Replace with styled Phosphor Icons |
| JSON field not saving | Use `flag_modified()` in SQLAlchemy |
| Users can't browse | Only protect scan, not all routes |
| Incognito mode crash | Use safeLocalStorage wrapper |
| TypeScript `any` errors | Define proper interfaces in types/ |
| App crashes no recovery | Add error.tsx at route boundaries |
| API abuse/spam | Add @limiter.limit() to all mutations |

---

## DO NOT DO (Common Mistakes)

1. **DON'T** use emojis in UI - use Phosphor Icons
2. **DON'T** use shimmer/skeleton loading animations
3. **DON'T** block all routes for unauthenticated users
4. **DON'T** use `useSearchParams` without Suspense boundary
5. **DON'T** use Heroicons or Lucide - use Phosphor Icons
6. **DON'T** make nav bar fancy/protruding - keep it flat
7. **DON'T** forget to test auth flow end-to-end
8. **DON'T** use old Gemini model versions
9. **DON'T** update JSON fields without flag_modified()
10. **DON'T** have different validation rules on frontend vs backend
11. **DON'T** use raw localStorage - use safeLocalStorage wrapper
12. **DON'T** use `any` type - define proper interfaces
13. **DON'T** use `catch (err: any)` - use `catch (err: unknown)`
14. **DON'T** leave routes without error.tsx boundaries
15. **DON'T** expose API endpoints without rate limiting

---

*Last Updated: 2026-02-03*
