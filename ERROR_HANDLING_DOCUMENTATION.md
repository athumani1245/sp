# Error Handling Documentation - Add Unit Feature

## 🎯 Overview

The add unit feature now properly displays server-provided error descriptions, including 403 (Forbidden) responses.

## 🔄 Error Flow

### 1. **User Attempts to Add Unit**
```
User fills form → Clicks Submit → API Request
```

### 2. **Server Returns 403 Error**
```json
HTTP 403 Forbidden
{
  "success": false,
  "description": "You have reached your subscription limit for units. Please upgrade your plan."
}
```

### 3. **Error Handler Processes Response**
Location: `src/utils/errorHandler.js`

```javascript
else if (err.response?.status === 403) {
    error_msg = err.response.data?.description || "You don't have permission to perform this action.";
}
```

**Priority Order for Error Messages:**
1. `err.response.data?.description` ← **First priority** (server's detailed message)
2. Default fallback: "You don't have permission to perform this action."

### 4. **Service Returns Error Object**
Location: `src/services/propertyService.js`

```javascript
export const addPropertyUnit = async (propertyId, unitData) => {
    try {
        const response = await api.post(`${API_BASE}/units/`, unitData);
        return {
            success: true,
            data: response.data.data,
            message: "Unit added successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to add unit.");
    }
};
```

Returns:
```javascript
{
    success: false,
    error: "You have reached your subscription limit for units. Please upgrade your plan.",
    status: 403
}
```

### 5. **Hook Displays Error to User**
Location: `src/features/properties/hooks/useUnitSubmit.js`

```javascript
if (result.success) {
    setSuccess(result.message || 'Unit added successfully!');
    // ... success handling
} else {
    // Display the server's error message (including 403 description)
    setError(result.error || 'Failed to add unit. Please try again.');
}
```

### 6. **UI Shows Error Alert**
Location: `src/components/forms/addUnit.jsx`

```jsx
<div className="modal-body">
    {error && <div className="alert alert-danger">{error}</div>}
    {success && <div className="alert alert-success">{success}</div>}
    {/* form fields */}
</div>
```

User sees:
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ You have reached your subscription limit for    │
│    units. Please upgrade your plan.                 │
└─────────────────────────────────────────────────────┘
```

## 📋 Supported HTTP Status Codes

The error handler supports the following status codes with custom messages:

| Status | Code | Message Source |
|--------|------|----------------|
| **Forbidden** | 403 | `description` from server response |
| **Not Found** | 404 | `description` from server response |
| **Bad Request** | 400 | `description` from server response |
| **Conflict** | 409 | `description` from server response |
| **Validation Error** | 422 | `description` from server response |
| **Server Error** | 500 | "Server error. Please try again later." |
| **Unauthorized** | 401 | Handled by API interceptor (auto-refresh/redirect) |

## 🔍 Error Response Formats

The error handler checks for error messages in this order:

```javascript
1. err.response?.data?.description  ← Primary (most detailed)
2. err.response?.data?.error
3. err.response?.data?.message
4. err.response?.data?.detail
5. err.message
6. defaultMessage (fallback)
```

## 🧪 Testing 403 Errors

### Test Case 1: Subscription Limit Reached
```
1. Create units up to subscription limit
2. Try to add one more unit
3. ✅ Should see: "You have reached your subscription limit for units. Please upgrade your plan."
```

### Test Case 2: Permission Denied
```
1. Login as user without unit creation permission
2. Try to add a unit
3. ✅ Should see server's description or "You don't have permission to perform this action."
```

### Test Case 3: Network Error
```
1. Disconnect internet
2. Try to add a unit
3. ✅ Should see: "Failed to add unit. Please try again."
```

## 💡 Best Practices

### For Backend Developers:
Always send a `description` field in 403 responses:

```json
{
  "success": false,
  "description": "Clear, user-friendly message explaining why the action was forbidden",
  "code": "SUBSCRIPTION_LIMIT_REACHED"
}
```

### For Frontend Developers:
The error handling is centralized. To use it:

```javascript
// In any service
try {
    const response = await api.post('/endpoint', data);
    return { success: true, data: response.data };
} catch (err) {
    return handleApiError(err, "User-friendly default message");
}

// In any component/hook
const result = await someService();
if (!result.success) {
    setError(result.error); // Will display server's description
}
```

## 🎨 UI Improvements (Optional)

To enhance error display, you could add icons or styling:

```jsx
{error && (
    <div className="alert alert-danger d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div>{error}</div>
    </div>
)}
```

Or for specific 403 errors with upgrade prompts:

```jsx
{error && (
    <div className="alert alert-warning">
        <strong>⚠️ Action Blocked</strong>
        <p>{error}</p>
        {error.includes('subscription') && (
            <button className="btn btn-primary btn-sm mt-2">
                Upgrade Plan
            </button>
        )}
    </div>
)}
```

## 📝 Example Server Responses

### ✅ Subscription Limit
```json
HTTP 403 Forbidden
{
  "success": false,
  "description": "You have reached your subscription limit for units. Please upgrade your plan to add more units."
}
```

### ✅ Permission Denied
```json
HTTP 403 Forbidden
{
  "success": false,
  "description": "You do not have permission to add units. Please contact your administrator."
}
```

### ✅ Feature Not Available
```json
HTTP 403 Forbidden
{
  "success": false,
  "description": "This feature is not available in your current plan. Upgrade to Premium to unlock unlimited units."
}
```

## 🔧 Troubleshooting

### Issue: Generic error message shown instead of server description

**Check:**
1. Server is sending `description` field in response
2. Response status is exactly 403
3. No console errors blocking the flow

**Debug:**
```javascript
// Add to propertyService.js temporarily
catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', err.response?.data);
    return handleApiError(err, "Failed to add unit.");
}
```

### Issue: Error not displaying in UI

**Check:**
1. Error state is being set: `setError(result.error)`
2. Error alert is in the JSX: `{error && <div className="alert alert-danger">{error}</div>}`
3. Modal is visible and not hidden

---

## ✅ Summary

The system is now configured to:
- ✅ Capture 403 errors from the server
- ✅ Extract the `description` field from the response
- ✅ Display the server's message to the user
- ✅ Fall back to generic messages if description is not provided
- ✅ Handle all HTTP error codes consistently

**Last Updated:** January 24, 2026  
**Status:** ✅ Complete and Active
