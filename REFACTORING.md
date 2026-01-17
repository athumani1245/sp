# Code Restructuring Documentation

## Overview
This branch contains a comprehensive refactoring of the Tanaka Property Management application for improved maintainability, scalability, and code organization.

## What's Been Implemented

### Phase 1: Foundation (✅ Completed)

#### 1. Constants & Configuration
- **Location**: `src/config/constants.js`
- **Purpose**: Centralized configuration values
- **Contents**:
  - API endpoints
  - Application routes
  - Pagination config
  - Status values (leases, subscriptions, payments, etc.)
  - UI configuration (toast duration, debounce delays)
  - Validation rules
  - Error and success messages
  - Local storage keys
  - Environment configuration

**Benefits**:
- Single source of truth for app constants
- Easy to update values across the entire app
- Prevents typos and inconsistencies
- Better IDE autocomplete support

#### 2. Custom Hooks Library
**Location**: `src/shared/hooks/`

**Hooks Created**:

1. **useApiRequest** (`useApiRequest.js`)
   - Handles API calls with loading/error states
   - Supports success/error callbacks
   - Automatic error handling
   
2. **usePagination** (`usePagination.js`)
   - Manages pagination state
   - Page navigation (next, prev, go to page)
   - Page size management
   - Range display calculation (e.g., "1-10 / 100")

3. **useDebounce** (`useDebounce.js`)
   - Debounces any value (useful for search inputs)
   - Configurable delay

4. **useFilters** (`useFilters.js`)
   - Manages filter state
   - Active filter counting
   - Clear individual or all filters
   - Get active filters only

5. **useModal** (`useModal.js`)
   - Modal open/close state
   - Modal data management
   - Toggle functionality

6. **useNotification** (`useNotification.js`)
   - Toast/notification management
   - Variant support (success, error, warning, info)
   - Helper methods (showSuccess, showError, etc.)

**Benefits**:
- Reusable logic across components
- Consistent behavior
- Reduced component complexity
- Easier testing
- Better separation of concerns

#### 3. Enhanced Error Handling
**Location**: `src/shared/utils/errorHandler.js`

**Features**:
- `AppError` custom error class
- Error type categorization
- Status code to error type mapping
- User-friendly error messages
- Validation error formatting
- Error recovery detection
- Retry-able error identification

**Benefits**:
- Consistent error handling
- Better user experience
- Easier debugging
- Standardized error responses

#### 4. PropTypes System
**Location**: `src/shared/types/propTypes.js`

**Defined Types**:
- Property, Unit, Tenant, Lease
- Payment, PropertyManager
- Pagination, DashboardStats
- UserProfile, Subscription, Package
- Location (Region, District, Ward)
- Common component props (Toast, Modal, Button)

**Benefits**:
- Runtime type checking
- Better documentation
- Prevents prop-related bugs
- Improved IntelliSense

### Phase 2: Component Refactoring (🚧 In Progress)

#### Feature-Based Structure
**New Directory Organization**:
```
src/
├── features/
│   ├── properties/
│   │   ├── components/
│   │   │   ├── UnitsTable.jsx
│   │   │   ├── UnitRow.jsx
│   │   │   ├── AddUnitRow.jsx
│   │   │   └── PropertyHeader.jsx
│   │   ├── hooks/
│   │   │   ├── usePropertyDetails.js
│   │   │   └── usePropertyUnits.js
│   │   ├── pages/
│   │   │   └── PropertyDetailsPage.jsx
│   │   └── index.js
│   │
│   ├── leases/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useLeasesList.js
│   │   ├── pages/
│   │   └── index.js
│   │
│   └── [other features...]
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
└── config/
```

**Benefits**:
- Related code grouped together
- Easier to locate functionality
- Better code reuse
- Simpler imports
- Scalable structure

#### Custom Hooks Created

1. **usePropertyDetails** (`features/properties/hooks/`)
   - Manages property data fetching
   - Property update operations
   - Loading/error states
   - Refresh functionality

2. **usePropertyUnits** (`features/properties/hooks/`)
   - Units CRUD operations
   - Unit list management
   - Pagination handling
   - Optimistic UI updates

3. **useLeasesList** (`features/leases/hooks/`)
   - Leases fetching with filters
   - Integrated with useFilters and usePagination
   - Debounced search
   - Auto-refresh on filter changes

**Benefits**:
- Business logic separated from UI
- Reusable across components
- Easier to test
- Cleaner components

## Migration Guide

### Using New Constants

**Before**:
```javascript
if (lease.status === 'active') { }
localStorage.setItem('token', token);
```

**After**:
```javascript
import { LEASE_STATUS, STORAGE_KEYS } from '../config/constants';

if (lease.status === LEASE_STATUS.ACTIVE) { }
localStorage.setItem(STORAGE_KEYS.TOKEN, token);
```

### Using Custom Hooks

**Before (in component)**:
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getData();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

**After**:
```javascript
import { useApiRequest } from '../shared/hooks';

const { data, loading, error, execute } = useApiRequest(getData, {
  onSuccess: (data) => console.log('Success!'),
  showSuccessMessage: true,
});

useEffect(() => {
  execute();
}, []);
```

### Using Filters Hook

**Before**:
```javascript
const [search, setSearch] = useState('');
const [status, setStatus] = useState('');
const [property, setProperty] = useState('');
// ... many useState calls

const clearAllFilters = () => {
  setSearch('');
  setStatus('');
  setProperty('');
  // ... many setters
};

const activeCount = [search, status, property].filter(x => x).length;
```

**After**:
```javascript
import { useFilters } from '../shared/hooks';

const {
  filters,
  setFilter,
  resetFilters,
  activeFilterCount,
  hasActiveFilters
} = useFilters({
  search: '',
  status: '',
  property: ''
});

// Use:
<input value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
<button onClick={resetFilters}>Clear All ({activeFilterCount})</button>
```

### Using Pagination Hook

**Before**:
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [totalPages, setTotalPages] = useState(0);

const handleNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};
// ... more pagination logic
```

**After**:
```javascript
import { usePagination } from '../shared/hooks';

const {
  currentPage,
  pageSize,
  totalPages,
  nextPage,
  prevPage,
  goToPage,
  getRangeDisplay,
  hasNextPage,
  hasPrevPage
} = usePagination({
  initialPageSize: 10,
  onPageChange: (page, size) => fetchData(page, size)
});

// Use:
<button onClick={prevPage} disabled={!hasPrevPage}>Previous</button>
<span>{getRangeDisplay()}</span>
<button onClick={nextPage} disabled={!hasNextPage}>Next</button>
```

## Best Practices Going Forward

### 1. Always Use Constants
- Never hardcode status values
- Use route constants for navigation
- Use storage keys from constants

### 2. Extract Reusable Logic to Hooks
- If logic is used in multiple places, create a hook
- Keep components focused on UI
- Business logic belongs in hooks or services

### 3. PropTypes for All Components
- Add PropTypes to every component
- Use shared PropTypes for common shapes
- Add defaultProps where appropriate

### 4. Feature-Based Organization
- New features should follow the feature folder structure
- Keep related code together
- Use index.js for clean exports

### 5. Error Handling
- Use the enhanced error handler
- Always handle errors consistently
- Provide user-friendly messages
- Log errors for debugging

## Testing Strategy

### Unit Tests
- Test custom hooks in isolation
- Test utility functions
- Test error handler logic

### Integration Tests
- Test hooks with API calls
- Test component + hook integration
- Test filter + pagination interaction

### Component Tests
- Test component rendering
- Test user interactions
- Test error states
- Test loading states

## Performance Considerations

### Implemented Optimizations
1. Debounced search inputs
2. Memoized filter logic
3. Optimized re-renders with useCallback
4. Separated concerns for better code splitting

### Future Optimizations
1. React.memo for expensive components
2. useMemo for expensive computations
3. Virtual scrolling for large lists
4. Code splitting with React.lazy

## Backward Compatibility

### Maintained Compatibility
- All existing services still work
- Original components not yet refactored continue to function
- Gradual migration path available

### Legacy Support
- Old error handler still exported for compatibility
- Existing utility functions preserved
- Can migrate components one at a time

## Next Steps

### Immediate (Current Sprint)
1. Complete Property.jsx refactoring
2. Complete Leases.jsx refactoring  
3. Create shared UI components

### Short Term (Next Sprint)
1. Refactor remaining large components
2. Migrate all pages to feature folders
3. Add comprehensive tests

### Medium Term (Future Sprints)
1. Add React Query for server state
2. Implement advanced caching
3. Add Storybook for component documentation
4. Performance monitoring and optimization

## Rollback Plan

If issues arise:
1. Switch back to `main` branch
2. This branch preserves all original functionality
3. Gradual adoption minimizes risk

## Questions or Issues?

Document any issues or questions in:
- GitHub Issues
- Team Slack channel
- Code review comments

## Contributors

- Initial refactoring by AI Assistant
- Review and approval by development team

---

**Last Updated**: January 8, 2026  
**Branch**: `feature/code-restructuring`  
**Status**: In Progress (Phase 2)
