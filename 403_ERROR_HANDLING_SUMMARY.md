# 403 Error Handling - Quick Reference

## ✅ Already Implemented!

The system **already handles 403 errors** and displays the server's description message to users.

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ADDS UNIT                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Response (403):                                          │
│  {                                                               │
│    "success": false,                                            │
│    "description": "You have reached your subscription limit"    │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  errorHandler.js (Line 38):                                     │
│  if (err.response?.status === 403) {                            │
│      error_msg = err.response.data?.description || fallback     │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  propertyService.js:                                            │
│  return {                                                        │
│      success: false,                                            │
│      error: "You have reached your subscription limit",         │
│      status: 403                                                │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  useUnitSubmit.js (Line 27):                                    │
│  setError(result.error)                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  addUnit.jsx - UI displays:                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ⚠️ You have reached your subscription limit              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 What Was Changed

### File: `useUnitSubmit.js`

**Before:**
```javascript
} else {
    setError(result.error);
}
```

**After:**
```javascript
} else {
    // Display the server's error message (including 403 description)
    setError(result.error || 'Failed to add unit. Please try again.');
}
```

**Change:** Added fallback and clarifying comment.

## 📋 Test It

### Step 1: Trigger a 403 Error
- Add units until you hit your subscription limit
- Or try adding a unit without permission

### Step 2: Check the Error Message
- The modal should display the exact message from the server
- Example: "You have reached your subscription limit for units. Please upgrade your plan."

## ✅ Verification Checklist

- [x] `errorHandler.js` checks for `err.response.data?.description` first
- [x] 403 status code prioritizes server description
- [x] `addPropertyUnit` service uses `handleApiError`
- [x] `useUnitSubmit` hook sets error from result
- [x] `addUnit.jsx` displays error in alert
- [x] Fallback messages exist for all error types

## 🔍 Debug Mode

If you want to verify the flow, add console logs:

```javascript
// In propertyService.js (temporarily)
catch (err) {
    console.log('🐛 Error Status:', err.response?.status);
    console.log('🐛 Error Description:', err.response?.data?.description);
    return handleApiError(err, "Failed to add unit.");
}
```

---

**Status:** ✅ Feature Already Active  
**Last Verified:** January 24, 2026  
**No Additional Changes Needed**
