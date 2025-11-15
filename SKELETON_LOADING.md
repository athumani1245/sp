# Skeleton Loading Implementation

This project uses `react-loading-skeleton` for modern skeleton loading screens instead of traditional spinners.

## Library
- **Package**: `react-loading-skeleton`
- **Documentation**: https://github.com/dvtng/react-loading-skeleton
- **Version**: Latest (installed via npm)

## Benefits
- ✅ Better UX - Shows the layout structure while loading
- ✅ Reduces perceived loading time
- ✅ Professional, modern appearance
- ✅ Customizable and responsive
- ✅ Accessible by default

## Available Skeleton Components

All skeleton components are located in `src/components/skeletons/`

### 1. TableSkeleton
**Usage**: List pages with table layouts (desktop view)
```jsx
import { TableSkeleton } from '../components/skeletons';
<TableSkeleton rows={5} columns={6} showHeader={true} />
```
**Props**:
- `rows` (number): Number of skeleton rows (default: 5)
- `columns` (number): Number of columns (default: 5)
- `showHeader` (boolean): Show header skeleton (default: true)

### 2. CardSkeleton
**Usage**: Mobile card views and list items
```jsx
import { CardSkeleton } from '../components/skeletons';
<CardSkeleton count={3} />
```
**Props**:
- `count` (number): Number of skeleton cards (default: 3)

### 3. PropertyCardSkeleton
**Usage**: Property grid cards
```jsx
import { PropertyCardSkeleton } from '../components/skeletons';
<PropertyCardSkeleton count={3} />
```
**Props**:
- `count` (number): Number of skeleton cards (default: 3)

### 4. DetailsSkeleton
**Usage**: Detail pages (Property, Lease, Tenant details)
```jsx
import { DetailsSkeleton } from '../components/skeletons';
<DetailsSkeleton />
```
**Props**: None - shows full page skeleton

### 5. DashboardSkeleton
**Usage**: Dashboard statistics cards
```jsx
import { DashboardSkeleton } from '../components/skeletons';
<DashboardSkeleton />
```
**Props**: None - shows 4 stat cards

### 6. PlanCardsSkeleton
**Usage**: Subscription plan cards
```jsx
import { PlanCardsSkeleton } from '../components/skeletons';
<PlanCardsSkeleton count={3} />
```
**Props**:
- `count` (number): Number of plan cards (default: 3)

### 7. LicenseInfoSkeleton
**Usage**: License/subscription information modal
```jsx
import { LicenseInfoSkeleton } from '../components/skeletons';
<LicenseInfoSkeleton />
```
**Props**: None

## Pages Updated

### ✅ List Pages
- **Properties** (`src/pages/dashboard/Properties.jsx`)
  - Desktop: TableSkeleton (4 columns)
  - Mobile: PropertyCardSkeleton
  
- **Leases** (`src/pages/Leases.jsx`)
  - Desktop: TableSkeleton (6 columns)
  - Mobile: CardSkeleton
  
- **Tenants** (`src/pages/Tenants.jsx`)
  - Desktop: TableSkeleton (5 columns)
  - Mobile: CardSkeleton
  
- **Property Managers** (`src/pages/PropertyManagers.jsx`)
  - Desktop: TableSkeleton (5 columns)
  - Mobile: CardSkeleton

### ✅ Detail Pages
- **Property Details** (`src/pages/dashboard/Property.jsx`)
  - Main: DetailsSkeleton
  - Units tab: TableSkeleton (3 rows, no header)
  
- **Lease Details** (`src/pages/Lease.jsx`)
  - Main: DetailsSkeleton
  
- **Tenant Details** (`src/pages/Tenant.jsx`)
  - Main: DetailsSkeleton
  - Leases section: TableSkeleton (3 rows, no header)

### ✅ Dashboard
- **Dashboard** (`src/pages/Dashboard.jsx`)
  - Stats: DashboardSkeleton
  - Recent leases: TableSkeleton (3 rows, no header)

### ✅ Modals & Components
- **SubscriptionModal** (`src/components/forms/SubscriptionModal.jsx`)
  - Plans: PlanCardsSkeleton
  
- **Header** (`src/components/layout/Header.jsx`)
  - License modal: LicenseInfoSkeleton

## When NOT to Use Skeletons

Keep spinner loading for:
- ✅ **Button actions** (form submissions, saves, deletions)
- ✅ **Inline operations** (quick updates, toggles)
- ✅ **Small components** that don't have a clear layout structure

Examples of spinners that should remain:
```jsx
// Button submission state
<button disabled={loading}>
  {loading ? (
    <span className="spinner-border spinner-border-sm me-2" />
  ) : null}
  Save Changes
</button>
```

## Customization

You can customize skeleton appearance globally by modifying the default theme:

```jsx
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

<SkeletonTheme baseColor="#e0e0e0" highlightColor="#f0f0f0">
  <YourComponent />
</SkeletonTheme>
```

## Responsive Design

All skeleton components are responsive and work with Bootstrap's breakpoint system:
- Desktop: Table skeletons
- Mobile: Card skeletons

Example pattern:
```jsx
{loading && (
  <>
    {/* Desktop */}
    <div className="d-none d-md-block">
      <TableSkeleton rows={5} columns={6} />
    </div>
    {/* Mobile */}
    <div className="d-md-none">
      <CardSkeleton count={4} />
    </div>
  </>
)}
```

## Migration from Spinners

Old pattern (removed):
```jsx
{loading && (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted mt-2">Loading data...</p>
  </div>
)}
```

New pattern (current):
```jsx
{loading && <TableSkeleton rows={5} columns={6} />}
```

## Performance

Skeleton loading is lightweight and doesn't impact performance:
- ~3KB gzipped package size
- No external dependencies
- Renders efficiently with React
- CSS animations (no JavaScript)

## Future Enhancements

Consider creating additional skeleton components for:
- Report modals
- Search results
- Notification panels
- User profile cards
- Calendar views
