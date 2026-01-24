# Search Display Issue - Troubleshooting Guide

## 🐛 Issue: Search Results Not Displaying

The search is working (API returns data) but the leases aren't showing in the UI.

## 🔍 Debugging Steps Added

### 1. Service Layer (`leaseService.js`)
Added comprehensive logging to identify response structure:

```javascript
console.log('📦 Raw API Response:', response.data);
console.log('📊 Response Data Structure:', responseData);
console.log('✅ Using direct array:', leaseData.length, 'items');
// or
console.log('✅ Using items array:', leaseData.length, 'items');
```

### 2. Hook Layer (`useLeasesList.js`)
Added logging to track data flow:

```javascript
console.log('🔍 Fetching with params:', params);
console.log('🎯 getLeases result:', result);
console.log('📋 Leases data array:', result.data);
console.log('✅ Setting leases state with:', leasesData.length, 'items');
console.log('📄 Pagination data:', result.pagination);
```

### 3. Params Construction Fix
Updated to exclude pagination when searching:

```javascript
// Only add pagination if NOT searching
if (!debouncedSearch) {
    params.page = customParams.page || pagination.currentPage;
    params.limit = customParams.limit || pagination.pageSize;
}
```

## 📊 Expected Console Output

When you search for "john", you should see:

```
🔍 Fetching with params: {search: 'john', status: 'active'}
🔍 Fetching leases with URL: http://localhost:8000/leases/?search=john&status=active
📦 Raw API Response: { success: true, data: [...] }
📊 Response Data Structure: [...]
✅ Using direct array: 5 items
🎯 getLeases result: {success: true, data: Array(5), pagination: {...}}
📋 Leases data array: [Object, Object, Object, Object, Object]
✅ Setting leases state with: 5 items
📄 Pagination data: {count: 5, total_pages: 1, current_page: 1}
```

## 🧪 Testing Steps

### Step 1: Open Browser Console
Press `F12` or `Ctrl+Shift+I` to open Developer Tools

### Step 2: Clear Console
Click the "Clear" button (🚫) in the console

### Step 3: Perform Search
1. Type "john" in the search box
2. Press Enter
3. Watch the console output

### Step 4: Check for Errors
Look for any red error messages

### Step 5: Verify Data Flow
Check that you see all these logs in order:
1. ✅ "🔍 Fetching with params"
2. ✅ "🔍 Fetching leases with URL"
3. ✅ "📦 Raw API Response"
4. ✅ "📊 Response Data Structure"
5. ✅ "✅ Using direct array" or "✅ Using items array"
6. ✅ "🎯 getLeases result"
7. ✅ "✅ Setting leases state with"

## 🔧 Common Issues & Solutions

### Issue 1: Response Structure Mismatch
**Symptom:** Console shows "⚠️ Unexpected response structure"

**Solution:** The backend might be returning data in a different format. Check the raw response:

```javascript
// Check what structure the backend returns
console.log('📦 Raw API Response:', response.data);

// Common structures:
// Option A: { success: true, data: [...] }
// Option B: { success: true, data: { items: [...] } }
// Option C: { data: [...] }
```

### Issue 2: Empty Array Despite Data
**Symptom:** "✅ Setting leases state with: 0 items" but API returns data

**Solution:** The data extraction logic isn't working. Update `leaseService.js`:

```javascript
// Try accessing data directly
const responseData = response.data.data || response.data || {};
```

### Issue 3: Data Not Updating in State
**Symptom:** Console shows data but UI doesn't update

**Solution:** Check React state update in hook:

```javascript
// Add this after setLeases
console.log('🎨 Leases state after update:', leases);
```

### Issue 4: Loading State Stuck
**Symptom:** Loading spinner never goes away

**Solution:** Check that `setLoading(false)` is called in finally block

## 📱 Check Response Format

### Backend Response Format A (Direct Array):
```json
{
  "success": true,
  "data": [
    { "id": 1, "tenant": "John Doe", ... },
    { "id": 2, "tenant": "Jane Smith", ... }
  ]
}
```

### Backend Response Format B (Nested Items):
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "tenant": "John Doe", ... },
      { "id": 2, "tenant": "Jane Smith", ... }
    ],
    "count": 2,
    "total_pages": 1
  }
}
```

### Backend Response Format C (Paginated):
```json
{
  "success": true,
  "data": {
    "items": [...],
    "count": 10,
    "total_pages": 1,
    "current_page": 1,
    "next": null,
    "previous": null
  }
}
```

## 🎯 Quick Fix Checklist

- [ ] Open browser console (F12)
- [ ] Clear search box and verify normal listing works
- [ ] Type search term and press Enter
- [ ] Check console for all 7 expected log messages
- [ ] Note the response structure from "📦 Raw API Response"
- [ ] Verify "✅ Setting leases state with: X items" shows correct count
- [ ] Check if loading state changes to false
- [ ] Verify no red errors in console
- [ ] Check Network tab for the API call
- [ ] Verify API returns data (200 status)

## 🚀 Next Steps

1. **Check Console Output**: Share the console logs from your search
2. **Check Network Tab**: Share the API response from Network tab
3. **Check Component**: Verify `LeasesTable` component is receiving data

## 📞 Information Needed

If issue persists, please provide:

1. Console output when searching (all the emoji logs)
2. Network tab response for the search API call
3. Any red error messages
4. The exact backend response structure

---

**Status:** 🔍 Debugging Mode Active  
**Updated:** January 24, 2026
