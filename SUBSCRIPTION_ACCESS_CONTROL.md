# Subscription-Based Access Control System

## Overview
This system implements subscription-based access control that restricts features based on the user's subscription status. Users with inactive subscriptions cannot access premium features and are prompted to subscribe.

## Components

### 1. **SubscriptionGate Component**
A wrapper component that protects features requiring an active subscription.

**Location:** `src/components/SubscriptionGate.jsx`

**Usage:**
```jsx
import SubscriptionGate from '../components/SubscriptionGate';

// Wrap any feature that requires subscription
<SubscriptionGate feature="adding new properties">
  <button onClick={() => setShowModal(true)}>
    Add New Property
  </button>
</SubscriptionGate>
```

**Features:**
- Automatically disables and overlays protected content when subscription is inactive
- Shows a lock icon and "Subscription Required" message
- Opens a modal with subscription details when clicked
- Provides a "Subscribe Now" button that redirects to subscription page

### 2. **SubscriptionBanner Component**
Displays subscription status alerts at the top of the dashboard.

**Location:** `src/components/SubscriptionBanner.jsx`

**Usage:**
```jsx
import SubscriptionBanner from '../components/SubscriptionBanner';

function Dashboard() {
  return (
    <Layout>
      <SubscriptionBanner />
      {/* Rest of dashboard content */}
    </Layout>
  );
}
```

**Alert Types:**
- **Danger (Red):** Subscription expired - shows "Subscribe Now" button
- **Warning (Yellow):** Subscription ending soon (≤7 days) - shows "Renew Now" button
- **Info (Blue):** Trial period active (>7 days remaining) - shows trial info

### 3. **useSubscription Hook**
Custom hook for accessing subscription data and checking feature access.

**Location:** `src/hooks/useSubscription.js`

**Usage:**
```jsx
import { useSubscription } from '../hooks/useSubscription';

function MyComponent() {
  const { 
    subscription, 
    hasActiveSubscription, 
    isFeatureEnabled,
    getSubscriptionStatus,
    getRemainingUnits 
  } = useSubscription();

  if (!hasActiveSubscription) {
    return <div>Please subscribe to access this feature</div>;
  }

  const maxUnits = getRemainingUnits();
  const status = getSubscriptionStatus();

  return (
    <div>
      <p>Status: {status.message}</p>
      <p>Max Units: {maxUnits}</p>
    </div>
  );
}
```

## Authentication Context Updates

The `AuthContext` has been updated to include subscription management:

```jsx
const { 
  isAuthenticated,
  login,
  logout,
  subscription,           // Subscription object from API
  hasActiveSubscription   // Boolean: true if status === 'active'
} = useAuth();
```

**Subscription Object Structure:**
```javascript
{
  plan_name: "Mwezi",
  plan_id: "23e7125c-3b02-4c64-acba-d368ce25f8de",
  is_active: true,
  is_trial: true,
  max_units: 30,
  start_date: "16-10-2025",
  end_date: "15-11-2025",
  days_left: 20,
  status: "active"  // "active" or "inactive"
}
```

## Implementation Guide

### Protecting a Feature

#### Method 1: Using SubscriptionGate (Recommended for UI elements)
```jsx
import SubscriptionGate from '../components/SubscriptionGate';

<SubscriptionGate feature="managing tenants">
  <button onClick={handleAddTenant}>Add Tenant</button>
</SubscriptionGate>
```

#### Method 2: Using useSubscription Hook (Recommended for logic)
```jsx
import { useSubscription } from '../hooks/useSubscription';

function MyComponent() {
  const { hasActiveSubscription, canAccessFeature } = useSubscription();

  const handleAction = () => {
    if (!canAccessFeature()) {
      alert('Please subscribe to access this feature');
      return;
    }
    // Proceed with action
  };

  return (
    <button 
      onClick={handleAction}
      disabled={!hasActiveSubscription}
    >
      Premium Action
    </button>
  );
}
```

#### Method 3: Direct Auth Context (For simple checks)
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { hasActiveSubscription } = useAuth();

  if (!hasActiveSubscription) {
    return <div>Subscription required</div>;
  }

  return <div>Premium content</div>;
}
```

### Adding Subscription Banner to a Page

```jsx
import SubscriptionBanner from '../components/SubscriptionBanner';

function MyPage() {
  return (
    <Layout>
      <div className="main-content">
        <SubscriptionBanner />
        {/* Page content */}
      </div>
    </Layout>
  );
}
```

## Data Flow

1. **Login:** User logs in → API returns access token + subscription data
2. **Storage:** Subscription data stored in localStorage and AuthContext
3. **Access Control:** Components check `hasActiveSubscription` flag
4. **Display:** SubscriptionBanner shows appropriate alerts
5. **Protection:** SubscriptionGate wraps premium features

## Local Storage Keys

- `token` - JWT access token
- `refresh` - JWT refresh token
- `subscription` - JSON string of subscription object

## Subscription Status Logic

A subscription is considered **active** when:
```javascript
subscription.status === 'active' && subscription.is_active === true
```

## Customization

### Changing Subscription Page Route

Update the redirect URL in both components:

**SubscriptionGate.jsx:**
```javascript
onClick={() => {
  setShowModal(false);
  window.location.href = '/subscription'; // Change this
}}
```

**SubscriptionBanner.jsx:**
```javascript
const handleSubscribe = () => {
  navigate('/subscription'); // Change this
};
```

### Modifying Alert Thresholds

**SubscriptionBanner.jsx:**
```javascript
// Warning when less than 7 days remaining
if (subscription.days_left <= 7 && subscription.days_left > 0) {
  // Change 7 to your preferred threshold
}
```

## Example: Protecting Multiple Features

```jsx
import SubscriptionGate from '../components/SubscriptionGate';

function PropertyManagement() {
  return (
    <div>
      {/* Free features - no protection */}
      <button onClick={viewProperties}>View Properties</button>

      {/* Protected features */}
      <SubscriptionGate feature="adding properties">
        <button onClick={addProperty}>Add Property</button>
      </SubscriptionGate>

      <SubscriptionGate feature="editing properties">
        <button onClick={editProperty}>Edit Property</button>
      </SubscriptionGate>

      <SubscriptionGate feature="deleting properties">
        <button onClick={deleteProperty}>Delete Property</button>
      </SubscriptionGate>
    </div>
  );
}
```

## Testing

### Simulating Expired Subscription

Modify localStorage:
```javascript
const expiredSubscription = {
  plan_name: "Mwezi",
  status: "inactive",
  is_active: false,
  days_left: 0
};
localStorage.setItem('subscription', JSON.stringify(expiredSubscription));
window.location.reload();
```

### Simulating Active Subscription

```javascript
const activeSubscription = {
  plan_name: "Mwezi",
  status: "active",
  is_active: true,
  days_left: 20,
  max_units: 30
};
localStorage.setItem('subscription', JSON.stringify(activeSubscription));
window.location.reload();
```

## Best Practices

1. **Always use SubscriptionGate for UI elements** that should be visually disabled
2. **Use useSubscription hook for business logic** and conditional rendering
3. **Add SubscriptionBanner to main pages** (Dashboard, Properties, Tenants, etc.)
4. **Provide clear feature names** in SubscriptionGate for better UX
5. **Test both active and inactive states** before deploying
6. **Keep subscription page route consistent** across all components

## Troubleshooting

### Features still accessible after subscription expires
- Check if `hasActiveSubscription` is properly calculated in AuthContext
- Verify subscription status in localStorage
- Ensure components are wrapped with SubscriptionGate

### Subscription banner not showing
- Check if SubscriptionBanner is imported and rendered
- Verify subscription data exists in AuthContext
- Check browser console for errors

### Modal not appearing on protected feature click
- Ensure SubscriptionGate is properly wrapping the element
- Check if onClick handlers are being prevented
- Verify Bootstrap Modal is properly imported
