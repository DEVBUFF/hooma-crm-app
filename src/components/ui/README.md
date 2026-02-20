# Hooma UI Design System

All primitives live in `src/components/ui/`. Patterns in `src/components/patterns/`.  
Tokens are in `src/lib/tokens.ts` (alias `t`) — prefer Tailwind CSS vars over raw token values in new code.

---

## Tokens

```ts
import { t } from "@/lib/tokens"

// Prefer CSS vars via Tailwind:
<p className="text-foreground" />          // t.colors.semantic.text
<p className="text-muted-foreground" />    // t.colors.semantic.textSubtle
<div className="bg-card" />               // t.colors.component.card.bg
<div className="bg-[--color-input]" />    // t.colors.component.input.bg

// Use t directly only for dynamic/inline values (e.g. accentBg per-item):
style={{ background: t.colors.semantic.accentTint }}
```

---

## Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="accent">Accent (terra)</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Saving…</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full width</Button>

// As link (Radix Slot)
<Button asChild><Link href="/app">Go to app</Link></Button>
```

---

## Input

```tsx
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

// Basic
<Input placeholder="you@example.com" />

// With left icon + label
<Input
  label="Email"
  leftIcon={<Mail size={17} />}
  placeholder="you@example.com"
  autoComplete="email"
/>

// With error
<Input
  label="Email"
  leftIcon={<Mail size={17} />}
  value={email}
  error={emailError}
  onChange={(e) => setEmail(e.target.value)}
/>

// With helper text
<Input
  label="Subdomain"
  helperText="Only lowercase letters and hyphens."
/>

// Eye-toggle password (rightIcon not built-in — overlay pattern)
<div className="relative">
  <Input type={show ? "text" : "password"} leftIcon={<Lock size={17} />} className="pr-11" />
  <button
    type="button"
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    onClick={() => setShow(!show)}
  >
    {show ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>
```

---

## Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

// Variants
<Card>Default card</Card>
<Card variant="elevated">Elevated (hero sections)</Card>
<Card variant="auth">Auth panel (backdrop-blur)</Card>

// Padding
<Card padding="sm">Compact</Card>
<Card padding="md">Default (24 px)</Card>
<Card padding="lg">Generous (32 px)</Card>
<Card className="px-8 py-10">Custom asymmetric padding</Card>

// Interactive (hover lift + deeper shadow — no JS needed)
<Card interactive>Clickable card</Card>

// Interactive + routing
<Link href="/app/services" className="block">
  <Card interactive className="flex-row items-center gap-4 p-5">
    …
  </Card>
</Link>

// With sub-components
<Card variant="elevated" padding="lg">
  <CardHeader divided>
    <CardTitle>Appointments today</CardTitle>
    <CardDescription>All confirmed bookings</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter divided>
    <Button size="sm">View all</Button>
  </CardFooter>
</Card>
```

---

## Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Canceled</Badge>
<Badge variant="neutral">Draft</Badge>

// With dot indicator
<Badge variant="success" dot>Online</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium (default)</Badge>
<Badge size="lg">Large</Badge>
```

---

## Modal

```tsx
import { Modal } from "@/components/ui/modal"

const [open, setOpen] = useState(false)

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Edit service"
  description="Changes are saved immediately."
  size="md"          // "sm" | "md" (default) | "lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSave} loading={saving}>Save</Button>
    </>
  }
>
  <Input label="Service name" value={name} onChange={…} />
</Modal>
```

Closes on **Esc** or overlay click. Scrolls internally when content overflows.

---

## Toast

```ts
import { toast } from "@/lib/toast"

toast.success("Booking created!")
toast.error("Something went wrong.")
toast.info("Sync complete — 3 records updated.")
```

`<Toaster />` is already wired into the root layout. No setup needed.

---

## Patterns

### EmptyState

```tsx
import { EmptyState } from "@/components/patterns/empty-state"
import { Users } from "lucide-react"

<EmptyState
  icon={<Users size={28} strokeWidth={1.5} />}
  title="No customers yet"
  description="Add your first client to get started."
  accent="primary"           // "primary" | "success" | "warning" | "neutral"
  action={{ label: "Add customer", onClick: () => setOpen(true) }}
/>
```

### Skeleton

```tsx
import { Skeleton, SkeletonList, SkeletonCard } from "@/components/patterns/skeleton"

// Single block
<Skeleton h="h-5" w="w-40" rounded="rounded-full" />

// List of rows
<SkeletonList rows={4} gap="gap-3" />

// Card with footer actions
<SkeletonCard footer />
```

### ConfirmDialog

```tsx
import { ConfirmDialog } from "@/components/patterns/confirm-dialog"

<ConfirmDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete service?"
  description="This cannot be undone."
  confirmText="Delete"
  tone="danger"              // "danger" | "default"
  onConfirm={async () => {
    await deleteService(id)  // async — dialog stays open until resolved
  }}
/>
```
