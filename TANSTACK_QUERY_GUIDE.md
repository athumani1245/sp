# TanStack Query Implementation Guide

## Overview
This project uses TanStack Query (React Query) for efficient data fetching, caching, and state management.

## Configuration

### QueryClient Setup
Location: `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## Property Service

### Files Structure
```
src/
  services/
    propertyService.ts     # Low-level API calls
  hooks/
    useProperties.ts       # React hooks with TanStack Query
```

### Available Hooks

#### Location Services
```typescript
// Get all regions (cached for 1 hour)
const { data: regions, isLoading } = useRegions();

// Get districts by region
const { data: districts } = useDistricts(regionId);

// Get wards by district
const { data: wards } = useWards(districtId);
```

#### Property CRUD
```typescript
// List properties with pagination
const { data, isLoading, error } = useProperties({
  search: 'apartment',
  page: 1,
  page_size: 10,
  status: 'active',
  property_type: 'Apartment'
});

// Get single property
const { data: property } = useProperty(propertyId);

// Get property statistics
const { data: stats } = usePropertyStats(propertyId);

// Add property
const addPropertyMutation = useAddProperty();
addPropertyMutation.mutate(propertyData);

// Update property
const updatePropertyMutation = useUpdateProperty();
updatePropertyMutation.mutate({ id: propertyId, data: updates });

// Delete property
const deletePropertyMutation = useDeleteProperty();
deletePropertyMutation.mutate(propertyId);
```

#### Units Management
```typescript
// Get available units
const { data: units } = useAvailableUnits({ status: 'available' });

// Get property units
const { data: propertyUnits } = usePropertyUnits({ property: propertyId });

// Add unit
const addUnitMutation = useAddPropertyUnit();
addUnitMutation.mutate(unitData);

// Update unit
const updateUnitMutation = useUpdatePropertyUnit();
updateUnitMutation.mutate({ id: unitId, data: updates });

// Delete unit
const deleteUnitMutation = useDeletePropertyUnit();
deleteUnitMutation.mutate(unitId);
```

### Example Usage

#### Simple List Page
```typescript
const PropertiesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Automatically fetches, caches, and refetches data
  const { data, isLoading, error } = useProperties({
    search,
    page,
    page_size: 10,
  });

  if (isLoading) return <Spin />;
  if (error) return <Alert message="Error loading properties" />;

  const properties = data?.data || [];
  const total = data?.pagination?.total || 0;

  return (
    <Table
      dataSource={properties}
      pagination={{ current: page, total }}
      onChange={(pagination) => setPage(pagination.current)}
    />
  );
};
```

#### Form with Mutation
```typescript
const AddPropertyModal = ({ onClose }) => {
  const [form] = Form.useForm();
  const addPropertyMutation = useAddProperty();

  const handleSubmit = async (values) => {
    try {
      await addPropertyMutation.mutateAsync(values);
      form.resetFields();
      onClose();
      // Cache is automatically invalidated and list refreshes
    } catch (error) {
      // Error handling (already shown via message.error in mutation)
    }
  };

  return (
    <Modal
      onOk={() => form.submit()}
      confirmLoading={addPropertyMutation.isPending}
    >
      <Form form={form} onFinish={handleSubmit}>
        {/* form fields */}
      </Form>
    </Modal>
  );
};
```

#### Cascading Selects
```typescript
const LocationForm = () => {
  const [selectedRegion, setSelectedRegion] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(selectedRegion);
  const { data: wards } = useWards(selectedDistrict);

  return (
    <>
      <Select
        options={regions?.map(r => ({ value: r.region_code, label: r.region_name }))}
        onChange={setSelectedRegion}
      />
      <Select
        options={districts?.map(d => ({ value: d.district_code, label: d.district_name }))}
        onChange={setSelectedDistrict}
        disabled={!districts}
      />
      <Select
        options={wards?.map(w => ({ value: w.ward_code, label: w.ward_name }))}
        disabled={!wards}
      />
    </>
  );
};
```

## Benefits

### Automatic Features
- ✅ **Caching**: Data is cached and reused across components
- ✅ **Background Refetching**: Stale data is automatically refetched
- ✅ **Deduplication**: Multiple requests for same data are merged
- ✅ **Loading States**: Built-in `isLoading`, `isPending` states
- ✅ **Error Handling**: Built-in error states and retry logic
- ✅ **Cache Invalidation**: Mutations automatically invalidate related queries
- ✅ **Optimistic Updates**: Can update UI before server responds
- ✅ **Success/Error Messages**: Integrated with Ant Design message component

### Performance
- Reduces unnecessary API calls
- Improves perceived performance with cached data
- Automatic request deduplication
- Configurable stale time and cache time

## Query Keys Structure

Query keys are organized hierarchically:

```typescript
propertyKeys = {
  all: ['properties'],
  lists: () => [...propertyKeys.all, 'list'],
  list: (params) => [...propertyKeys.lists(), params],
  details: () => [...propertyKeys.all, 'detail'],
  detail: (id) => [...propertyKeys.details(), id],
  stats: (id) => [...propertyKeys.all, 'stats', id],
  units: (id) => [...propertyKeys.all, 'units', id],
}
```

This structure allows for precise cache invalidation:
- `queryClient.invalidateQueries({ queryKey: propertyKeys.all })` - Invalidates all property queries
- `queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })` - Only invalidates list queries
- `queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) })` - Only invalidates specific property

## Next Steps

To implement similar patterns for other entities:

1. Create service file: `src/services/tenantService.ts`
2. Create hooks file: `src/hooks/useTenants.ts`
3. Follow the same pattern as `useProperties.ts`
4. Use the hooks in your components

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
