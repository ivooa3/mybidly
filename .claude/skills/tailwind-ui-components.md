# Tailwind CSS + UI Components - Best Practices

## Overview

This skill covers Tailwind CSS setup, design system, and reusable UI components for the Justfouryou application. Focus on creating a "lovable" interface that's clean, modern, and easy to use.

---

## Setup

### Installation

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Justfouryou brand colors
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea', // Primary brand color
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777', // Secondary brand color
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  /* Custom component classes */
  .btn-primary {
    @apply px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors;
  }

  .input-field {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900;
  }

  .card {
    @apply bg-white rounded-lg shadow-soft p-6;
  }
}
```

### Install Forms Plugin

```bash
npm install -D @tailwindcss/forms
```

---

## Design System

### Color Palette

**Primary Colors:**
- Purple 600: `#9333ea` - Main brand color (buttons, links, highlights)
- Pink 600: `#db2777` - Secondary/accent color (gradients, CTAs)

**Neutral Colors:**
- Gray scale for text, backgrounds, borders
- White for cards and surfaces

**Status Colors:**
- Green: Success, accepted bids
- Yellow: Warning, pending bids
- Red: Error, declined bids

### Typography

```typescript
// Use Inter font from Google Fonts
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Font Sizes:**
- `text-xs` (12px) - Helper text, labels
- `text-sm` (14px) - Body text, table content
- `text-base` (16px) - Default body
- `text-lg` (18px) - Large body
- `text-xl` (20px) - Subheadings
- `text-2xl` (24px) - Section titles
- `text-3xl` (30px) - Page titles
- `text-4xl` (36px) - Hero headings

### Spacing

Use Tailwind's default spacing scale:
- `p-2, p-4, p-6, p-8` for padding
- `m-2, m-4, m-6, m-8` for margins
- `space-y-4, space-x-4` for gap between elements

---

## Reusable Components

### Button Component

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-700 hover:bg-gray-100'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Usage:**
```tsx
<Button variant="primary" size="lg">Create Offer</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### Input Component

```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={clsx(
            'block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900',
            'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

**Usage:**
```tsx
<Input
  label="Product Name"
  placeholder="Enter product name"
  error={errors.productName?.message}
/>
```

### Card Component

```typescript
// components/ui/Card.tsx
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function Card({ children, className, title, subtitle, actions }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-soft', className)}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
<Card
  title="Offers"
  subtitle="Manage your product offers"
  actions={<Button size="sm">Create New</Button>}
>
  <p>Card content here...</p>
</Card>
```

### Stats Card Component

```typescript
// components/ui/StatsCard.tsx
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function StatsCard({ title, value, icon, trend, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {trend && (
            <p className={clsx(
              'mt-2 text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}

          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Usage:**
```tsx
<StatsCard
  title="Total Bids"
  value={150}
  trend={{ value: 12.5, isPositive: true }}
  icon={<ChartIcon />}
/>
```

### Badge Component

```typescript
// components/ui/Badge.tsx
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  }

  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  )
}
```

**Usage:**
```tsx
<Badge variant="success">Accepted</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Declined</Badge>
```

### Table Component

```typescript
// components/ui/Table.tsx
import { ReactNode } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Usage:**
```tsx
<Table
  data={bids}
  keyExtractor={(bid) => bid.id}
  columns={[
    { key: 'customerEmail', label: 'Email' },
    { key: 'bidAmount', label: 'Amount', render: (bid) => `€${bid.bidAmount}` },
    {
      key: 'status',
      label: 'Status',
      render: (bid) => (
        <Badge variant={bid.status === 'accepted' ? 'success' : 'warning'}>
          {bid.status}
        </Badge>
      )
    }
  ]}
/>
```

### Modal Component

```typescript
// components/ui/Modal.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]}`}>
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}

          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
```

**Usage:**
```tsx
const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Offer"
  size="lg"
>
  <OfferForm onSuccess={() => setIsOpen(false)} />
</Modal>
```

---

## Layout Components

### Sidebar Component

```typescript
// components/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { LogoutButton } from './LogoutButton'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Offers', href: '/dashboard/offers' },
  { label: 'Bids', href: '/dashboard/bids' },
  { label: 'Embed Code', href: '/dashboard/embed' },
]

export function Sidebar({ user }: { user: { shopName: string; email: string } }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Justfouryou
        </h1>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <p className="font-semibold text-gray-900">{user.shopName}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block px-4 py-2 rounded-lg font-medium transition-colors',
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </aside>
  )
}
```

### Empty State Component

```typescript
// components/ui/EmptyState.tsx
import { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            {icon}
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>

      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**Usage:**
```tsx
{bids.length === 0 && (
  <EmptyState
    title="No bids yet"
    description="When customers place bids, they'll appear here"
    action={{
      label: 'Create First Offer',
      onClick: () => router.push('/dashboard/offers/new')
    }}
  />
)}
```

---

## Form Components

### Form Field Wrapper

```typescript
// components/ui/FormField.tsx
import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  children: ReactNode
}

export function FormField({
  label,
  error,
  helperText,
  required,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
```

**Usage:**
```tsx
<FormField
  label="Product Name"
  error={errors.productName?.message}
  helperText="Enter a descriptive name for your product"
  required
>
  <input {...register('productName')} className="input-field" />
</FormField>
```

---

## Loading States

### Spinner Component

```typescript
// components/ui/Spinner.tsx
import { clsx } from 'clsx'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-300 border-t-purple-600', sizes[size], className)} />
  )
}
```

### Loading Skeleton

```typescript
// components/ui/Skeleton.tsx
import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx('animate-pulse bg-gray-200 rounded', className)} />
  )
}

// Example usage for table rows
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      ))}
    </div>
  )
}
```

---

## Responsive Design

### Mobile Menu (Hamburger)

```typescript
// components/MobileNav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        {/* Hamburger Icon */}
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-100 rounded">
              Dashboard
            </Link>
            <Link href="/dashboard/offers" className="block py-2 px-4 hover:bg-gray-100 rounded">
              Offers
            </Link>
            {/* More links... */}
          </nav>
        </div>
      )}
    </div>
  )
}
```

### Responsive Classes

```tsx
{/* Stack on mobile, grid on desktop */}
<div className="flex flex-col md:grid md:grid-cols-3 gap-4">
  <StatsCard title="Total Bids" value={150} />
  <StatsCard title="Accepted" value={120} />
  <StatsCard title="Revenue" value="€4,200" />
</div>

{/* Hide on mobile */}
<div className="hidden md:block">Desktop only content</div>

{/* Show only on mobile */}
<div className="md:hidden">Mobile only content</div>
```

---

## Best Practices

### ✅ DO

1. **Use consistent spacing** - Stick to Tailwind's spacing scale
2. **Mobile-first responsive design** - Use `md:`, `lg:` breakpoints
3. **Reuse components** - DRY (Don't Repeat Yourself)
4. **Use semantic colors** - `text-red-600` for errors, `text-green-600` for success
5. **Add hover states** - `hover:bg-gray-100` for better UX
6. **Use transitions** - `transition-colors`, `transition-opacity` for smoothness
7. **Provide loading states** - Spinners, skeletons for async operations
8. **Add focus states** - `focus:ring-2 focus:ring-purple-500` for accessibility
9. **Use proper contrast** - Ensure text is readable
10. **Test on mobile** - Widget and payment pages must work perfectly on mobile

### ❌ DON'T

1. **Don't use arbitrary values excessively** - Stick to design tokens
2. **Don't hardcode colors** - Use Tailwind classes
3. **Don't forget accessibility** - Add labels, ARIA attributes
4. **Don't make tiny click targets** - Minimum 44x44px for touch
5. **Don't use too many colors** - Stick to brand palette
6. **Don't skip hover/focus states** - Poor UX
7. **Don't ignore mobile** - Many customers will use phones

---

## Widget-Specific Styling

### Widget Container

```tsx
// app/widget/page.tsx
export default function WidgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Justfouryou Banner */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Justfouryou
          </h1>
        </div>

        {/* Widget Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Widget content */}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Powered by{' '}
          <a
            href="https://www.next-commerce.io"
            target="_blank"
            className="text-purple-600 hover:underline"
          >
            Next Commerce
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/) (Premium, optional)
- [Headless UI](https://headlessui.com/) - Unstyled accessible components
- [Heroicons](https://heroicons.com/) - Free SVG icons
- [clsx](https://github.com/lukeed/clsx) - Utility for conditional classes
