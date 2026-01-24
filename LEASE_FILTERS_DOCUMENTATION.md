# Lease Filters with Query Parameters Documentation

## Overview
The lease filtering system now supports dynamic query parameters that are sent to the backend API to filter leases based on various criteria.

## Query Parameter Structure

### Base URL Pattern
```
{{base}}leases/?<parameter1>=<value1>&<parameter2>=<value2>
```

### Supported Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by lease status | `?status=active` |
| `property_id` | integer | Filter by property ID | `?property_id=123` |
| `unit_id` | integer | Filter by unit ID | `?unit_id=456` |
| `tenant_id` | integer | Filter by tenant ID | `?tenant_id=789` |
| `search` | string | Search across lease data | `?search=john` |
| `page` | integer | Page number for pagination | `?page=2` |
| `limit` | integer | Items per page | `?limit=25` |
| `tenant_name` | string | Filter by tenant name | `?tenant_name=john` |
| `start_date` | date | Filter by start date | `?start_date=2024-01-01` |
| `end_date` | date | Filter by end date | `?end_date=2024-12-31` |

## Status Values

The `status` parameter accepts the following values:
- `active` - Active leases
- `draft` - Draft leases
- `terminated` - Terminated leases
- `expired` - Expired leases
- `ended` - Ended leases

## Example API Calls

### Filter by Active Status
```
GET {{base}}leases/?status=active
```

### Filter by Property
```
GET {{base}}leases/?property_id=123
```

### Filter by Multiple Parameters
```
GET {{base}}leases/?status=active&property_id=123&page=1&limit=10
```

### Search with Status Filter
```
GET {{base}}leases/?status=active&search=john&page=1
```

### Filter by Property and Unit
```
GET {{base}}leases/?property_id=123&unit_id=456
```

## Implementation Flow

### 1. Component Level (LeaseFilters.jsx)
```jsx
// User selects a status from dropdown
<select
  value={filters.status}
  onChange={(e) => onFilterChange('status', e.target.value)}
>
  <option value="">All Statuses</option>
  <option value="active">Active</option>
  <option value="draft">Draft</option>
  <option value="terminated">Terminated</option>
  <option value="expired">Expired</option>
</select>
```

### 2. Hook Level (useLeasesList.js)
```javascript
// Filters are managed and passed to API call
const params = {
  search: debouncedSearch,
  status: filters.status,
  property_id: filters.propertyFilter,
  unit_id: filters.unitFilter,
  tenant_id: filters.tenantFilter,
  page: pagination.currentPage,
  limit: pagination.pageSize,
};
```

### 3. Service Level (leaseService.js)
```javascript
// Query parameters are constructed and sent to backend
const queryParams = new URLSearchParams();
if (params.status) queryParams.append('status', params.status);
if (params.property_id) queryParams.append('property_id', params.property_id);
// ... other parameters

const response = await api.get(`${API_BASE}/leases/?${queryParams.toString()}`);
```

### 4. API Request
```
Final URL: {{base}}leases/?status=active&property_id=123&page=1&limit=10
```

## Filter Behavior

### Active Filter Count
The system tracks how many filters are currently active and displays a badge:
```javascript
const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
  return value && value !== '';
}).length;
```

### Clear Filters
Users can clear all filters at once, which resets all parameters:
```javascript
const handleClearFilters = () => {
  resetFilters(); // Resets all filters to empty values
};
```

### Filter Dependencies
- **Unit Filter**: Only enabled when a property is selected
- **District Filter**: Only enabled when a region is selected
- **Ward Filter**: Only enabled when a district is selected

## Usage Examples

### Example 1: Filter Active Leases
1. User clicks on status dropdown
2. Selects "Active"
3. System sends: `GET /leases/?status=active`
4. Backend returns only active leases

### Example 2: Filter by Property and Status
1. User selects property "Building A" (ID: 5)
2. User selects status "Active"
3. System sends: `GET /leases/?status=active&property_id=5`
4. Backend returns active leases in Building A

### Example 3: Search with Filters
1. User types "John" in search box
2. User selects status "Active"
3. System sends: `GET /leases/?status=active&search=john`
4. Backend returns active leases matching "John"

## Frontend Components Involved

1. **LeaseFilters.jsx** - UI component for filter controls
2. **useLeasesList.js** - Custom hook managing filter state
3. **leaseService.js** - API service handling HTTP requests
4. **Leases.jsx** - Main page component integrating filters

## Constants

Filter values are defined in `config/constants.js`:
```javascript
export const LEASE_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
  ENDED: 'ended',
};
```

## Testing

### Manual Testing Steps
1. Open Leases page
2. Click on Status dropdown
3. Select "Active"
4. Verify URL contains `?status=active`
5. Verify only active leases are displayed
6. Clear filters and verify all leases return

### Expected Backend Behavior
- Backend receives query parameters in request
- Filters data based on parameters
- Returns filtered results with pagination
- Updates count and total_pages accordingly

## Notes
- All query parameters are optional
- Empty parameters are not sent to backend
- Search is debounced by 500ms to reduce API calls
- Filters trigger a reset to page 1
- Pagination is maintained across filter changes
