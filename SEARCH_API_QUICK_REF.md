# Search API - Quick Reference

## 🔍 Search Mode (No Pagination)

### When: User types in search box and presses Enter/clicks away

### API Calls:
```
✅ GET /leases/?search=john
✅ GET /leases/?search=apartment&status=active
✅ GET /leases/?search=unit%20201&property_id=5
```

### Returns: ALL matching results (no pagination)

---

## 📄 Browse Mode (With Pagination)

### When: User clears search box or browses normally

### API Calls:
```
✅ GET /leases/?page=1&limit=10
✅ GET /leases/?status=active&page=1&limit=10
✅ GET /leases/?property_id=5&page=2&limit=10
```

### Returns: Paginated results (10 items per page)

---

## 🎯 Quick Decision Matrix

| User Action | Has Search Text? | Pagination? | Example URL |
|------------|------------------|-------------|-------------|
| Types "john" + Enter | ✅ Yes | ❌ No | `/leases/?search=john` |
| Clears search | ❌ No | ✅ Yes | `/leases/?page=1&limit=10` |
| Filters by status (no search) | ❌ No | ✅ Yes | `/leases/?status=active&page=1&limit=10` |
| Searches + filters | ✅ Yes | ❌ No | `/leases/?search=john&status=active` |

---

## 💡 Key Logic

```javascript
if (params.search) {
    // Search mode: No pagination
    URL = /leases/?search=value&[filters]
} else {
    // Browse mode: With pagination
    URL = /leases/?[filters]&page=X&limit=Y
}
```

---

**Updated:** January 24, 2026  
**Status:** ✅ Ready for Production
