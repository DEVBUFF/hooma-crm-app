# Hooma CRM — Frontend Development Agent v2

> Place this file as `CLAUDE.md` in project root. It works as system context for Claude Code CLI,
> Claude in VS Code, and can be copied as a Claude Project prompt.

## Project overview

Hooma is a CRM for pet grooming salons. UK-first market, freemium SaaS.
- URL: https://hellohooma.app
- Repo: https://github.com/DEVBUFF/hooma-crm-app
- Deploy: Vercel (hooma-crm-app.vercel.app)

## Tech stack (exact versions from package.json)

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.7.3 (strict mode)
- **React**: 19.2.4
- **Styling**: Tailwind CSS 4.1.9 + tw-animate-css
- **UI components**: shadcn/ui (Radix primitives + CVA + clsx + tailwind-merge)
- **Backend**: Firebase (Auth + Firestore + Cloud Functions)
- **Forms**: react-hook-form 7.x + zod 3.x validation
- **Icons**: Lucide React 0.564
- **Charts**: Recharts 2.15
- **Dates**: date-fns 4.1 + react-day-picker 9.13
- **Notifications**: Sonner 1.7 (toast)
- **Other UI**: vaul (drawer), cmdk (command palette), next-themes, embla-carousel, react-resizable-panels
- **Analytics**: @vercel/analytics + @vercel/speed-insights

## Architecture rules

### File structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, register)
│   ├── (dashboard)/        # Authenticated app
│   │   ├── layout.tsx      # Sidebar + topbar wrapper
│   │   ├── page.tsx        # Dashboard home
│   │   ├── calendar/
│   │   ├── clients/
│   │   ├── services/
│   │   ├── staff/
│   │   ├── reports/
│   │   └── settings/
│   ├── layout.tsx          # Root layout (fonts, providers)
│   └── globals.css         # Tailwind + CSS variables
├── components/
│   ├── ui/                 # shadcn/ui primitives (DO NOT EDIT directly)
│   ├── layout/             # Sidebar, Topbar, MobileNav
│   ├── calendar/           # Calendar-specific components
│   ├── clients/            # Client & pet components
│   ├── bookings/           # Booking cards, forms, timeline
│   ├── services/           # Service management
│   ├── staff/              # Staff scheduling
│   ├── reports/            # Charts, metric cards
│   └── shared/             # Reusable across features (EmptyState, LoadingSpinner, etc.)
├── lib/
│   ├── firebase/           # Firebase config, auth helpers, Firestore queries
│   │   ├── config.ts       # Firebase app init
│   │   ├── auth.ts         # Auth functions (signIn, signOut, onAuthStateChanged)
│   │   └── firestore.ts    # Firestore collection refs, typed queries
│   ├── utils.ts            # cn() helper and general utilities
│   ├── validations/        # Zod schemas (booking, client, pet, service)
│   └── constants.ts        # App-wide constants (routes, config)
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts         # Auth state hook
│   ├── use-bookings.ts     # Booking CRUD
│   ├── use-clients.ts      # Client CRUD
│   └── use-media-query.ts  # Responsive breakpoints
├── types/                  # TypeScript type definitions
│   ├── booking.ts
│   ├── client.ts
│   ├── pet.ts
│   ├── service.ts
│   ├── staff.ts
│   └── index.ts            # Re-exports
└── providers/              # React context providers
    ├── auth-provider.tsx
    └── theme-provider.tsx
```

### Component patterns

**Server vs Client Components:**
- Default to Server Components
- Add `'use client'` only when needed: state, effects, event handlers, browser APIs
- Data fetching happens in Server Components or via Firebase hooks in Client Components

**Component file structure:**
```tsx
// 1. Imports (external, then internal, then types)
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types'

// 2. Types/interfaces for this component
interface BookingCardProps {
  booking: Booking
  onComplete?: (id: string) => void
}

// 3. Component (named export for non-page components)
export function BookingCard({ booking, onComplete }: BookingCardProps) {
  // hooks first, then derived state, then handlers, then render
}
```

**Naming conventions:**
- Files: kebab-case (`booking-card.tsx`, `use-auth.ts`)
- Components: PascalCase (`BookingCard`, `DashboardLayout`)
- Hooks: camelCase with `use` prefix (`useBookings`, `useAuth`)
- Types: PascalCase (`Booking`, `Client`, `Pet`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_BOOKINGS_PER_DAY`)
- Firebase collections: camelCase (`bookings`, `clients`, `services`)

### Styling rules

**Tailwind CSS 4 specifics:**
- Use `@import "tailwindcss"` instead of `@tailwind` directives
- CSS variables defined in `globals.css`, referenced via Tailwind
- Use `cn()` from `@/lib/utils` to merge conditional classes
- Mobile-first: start with mobile styles, add `md:` and `lg:` for larger screens

**Brand colors (use via CSS variables):**
```css
--hooma-primary: #7B8CDE;        /* Periwinkle — buttons, links, nav */
--hooma-primary-light: #EEF0FB;  /* Hover bg, badges, highlights */
--hooma-primary-dark: #5563B8;   /* Pressed/hover buttons */
--hooma-bg-base: #F8F7F4;        /* App background */
--hooma-bg-surface: #FFFFFF;     /* Cards, modals */
--hooma-text-primary: #1A1A1A;   /* Headings */
--hooma-text-secondary: #6B6B6B; /* Body, descriptions */
--hooma-text-tertiary: #9B9B9B;  /* Placeholders, timestamps */
--hooma-border: #E5E2DC;         /* Card borders, dividers */
--hooma-error: #D4483B;
--hooma-warning: #E6960A;
--hooma-success: #2E8B57;
--hooma-info: #2563EB;
```

**Typography:**
- Headings: DM Sans, weight 500
- Body/UI: Inter, weight 400
- Data/numbers: JetBrains Mono, weight 500
- Load via `next/font/google` in root layout

**Component styling:**
```tsx
// GOOD: Tailwind utilities with cn() for conditionals
<div className={cn(
  "rounded-[14px] border border-[--hooma-border] bg-white p-4",
  isActive && "border-[--hooma-primary] bg-[--hooma-primary-light]"
)}>

// BAD: inline styles
<div style={{ borderRadius: '14px', border: '1px solid #E5E2DC' }}>

// BAD: arbitrary CSS classes outside Tailwind
<div className="custom-card-style">
```

### Firebase patterns

**Firestore data model:**
```typescript
// Collection: salons/{salonId}
interface Salon {
  id: string
  name: string
  ownerId: string      // Firebase Auth UID
  address?: string
  phone?: string
  currency: 'GBP'      // UK-first
  timezone: string
  createdAt: Timestamp
}

// Collection: salons/{salonId}/bookings/{bookingId}
interface Booking {
  id: string
  petId: string
  clientId: string
  staffId: string
  serviceId: string
  date: Timestamp
  startTime: string    // "09:00" format
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  price: number        // in pence (GBP)
  createdAt: Timestamp
}

// Collection: salons/{salonId}/clients/{clientId}
interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  pets: string[]       // pet document IDs
  notes?: string
  createdAt: Timestamp
}

// Collection: salons/{salonId}/pets/{petId}
interface Pet {
  id: string
  name: string
  breed: string
  weight?: number
  allergies?: string[]
  behaviourNotes?: string
  clientId: string
  createdAt: Timestamp
}

// Collection: salons/{salonId}/services/{serviceId}
interface Service {
  id: string
  name: string
  duration: number     // minutes
  price: number        // in pence
  category?: string
  isActive: boolean
}

// Collection: salons/{salonId}/staff/{staffId}
interface Staff {
  id: string
  name: string
  email: string
  role: 'owner' | 'groomer' | 'assistant'
  availability: WeeklySchedule
  isActive: boolean
}
```

**Firebase query patterns:**
```typescript
// Always use typed helpers
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

// Queries scoped to salon
const bookingsRef = collection(db, `salons/${salonId}/bookings`)
const todayBookings = query(
  bookingsRef,
  where('date', '>=', startOfDay),
  where('date', '<=', endOfDay),
  orderBy('date')
)
```

**Auth pattern:**
```typescript
// Use the auth hook in client components
const { user, salon, loading } = useAuth()

// Protect routes in layout.tsx
if (!user) redirect('/auth/login')
```

### Form patterns

```typescript
// Always: react-hook-form + zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, type BookingFormData } from '@/lib/validations/booking'

const form = useForm<BookingFormData>({
  resolver: zodResolver(bookingSchema),
  defaultValues: { ... }
})
```

### Error handling

```typescript
// Use sonner for user-facing feedback
import { toast } from 'sonner'

try {
  await createBooking(data)
  toast.success('Booking created')
} catch (error) {
  toast.error('Could not create booking. Please try again.')
  console.error('[createBooking]', error)
}
```

## Code quality rules

1. **No `any` type.** Use `unknown` and narrow, or define proper types.
2. **No `console.log` in production.** Use `console.error` with context prefix for errors.
3. **No hardcoded strings in UI.** Use constants for routes, labels that repeat.
4. **No hardcoded colours.** Always use CSS variables or Tailwind classes.
5. **No unused imports.** ESLint will catch these.
6. **No barrel exports except in `types/index.ts`.** Direct imports for everything else.
7. **Prefer named exports** over default exports (except for Next.js pages).
8. **All prices in pence.** Convert to pounds only for display: `(price / 100).toFixed(2)`.
9. **All dates via date-fns.** Never use raw `Date` manipulation.
10. **British English in UI text.** colour, organise, favourite, centre.

## Performance rules

1. **Images:** Always use `next/image` with explicit width/height.
2. **Fonts:** Load via `next/font/google` with `display: 'swap'`.
3. **Code splitting:** Dynamic import heavy components: `const Chart = dynamic(() => import('./Chart'), { ssr: false })`
4. **Firebase:** Use `onSnapshot` for real-time lists, `getDoc` for single reads.
5. **Memoization:** Use `useMemo`/`useCallback` only when profiling shows a need. Don't premature-optimise.

## Testing (future)

- Unit: Vitest + React Testing Library
- E2E: Playwright (critical paths: login, create booking, view calendar)
- No tests required yet, but write testable code (pure functions, dependency injection)

## Git conventions

- Branch naming: `feat/calendar-drag-drop`, `fix/booking-overlap`, `chore/update-deps`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- PR title matches the main commit message
- Squash merge to main

## When working on a task

1. Read the task description and acceptance criteria fully
2. Check if the Brand & Design Lead has provided a UI spec — follow it exactly
3. Check existing components before creating new ones
4. Use shadcn/ui primitives wherever possible
5. Test on mobile viewport (375px) before committing
6. Run `npm run build` to verify no TypeScript errors
7. Keep the PR small — one feature per PR
