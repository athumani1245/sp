# Contextual Help & Tooltips - Usage Guide

## Overview

The application now features a comprehensive tooltip system using Tippy.js to provide contextual help throughout the user interface. This enhances user experience by offering helpful information without cluttering the interface.

## Implementation

### Library Used
- **@tippyjs/react** - React wrapper for Tippy.js (the complete tooltip & popover solution)
- **tippy.js** - Core tooltip library with rich features and animations

### Components

Located in `src/components/common/Tooltip.jsx`, we provide 4 tooltip variants:

#### 1. **Tooltip** (Base Component)
The foundational component for all tooltips.

```jsx
import { Tooltip } from '../components/common/Tooltip';

<Tooltip content="This is helpful information">
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content` (string|HTML) - Tooltip content (supports HTML)
- `placement` (string) - Position: 'top', 'bottom', 'left', 'right' (default: 'top')
- `theme` (string) - Theme: 'dark', 'light', 'success', 'warning', 'danger', 'info' (default: 'dark')
- `arrow` (boolean) - Show arrow (default: true)
- `delay` (number|array) - Delay in ms [show, hide] (default: [200, 0])
- `interactive` (boolean) - Allow hovering over tooltip (default: false)
- `maxWidth` (number|string) - Max width (default: 300)
- `trigger` (string) - Trigger event: 'mouseenter focus', 'click', etc. (default: 'mouseenter focus')
- `disabled` (boolean) - Disable tooltip (default: false)
- `shortcut` (string) - Keyboard shortcut to display (e.g., 'Ctrl+S')
- `children` (ReactNode) - Element to attach tooltip to

#### 2. **InfoTooltip**
Shows an info icon (ⓘ) with a tooltip. Perfect for inline help in forms.

```jsx
import { InfoTooltip } from '../components/common/Tooltip';

<label>
  Property Name *
  <InfoTooltip content="Give your property a unique, descriptive name" />
</label>
```

**Props:**
- `content` (string|HTML) - Tooltip content
- `theme` (string) - Theme color (default: 'info')
- `placement` (string) - Tooltip position (default: 'top')
- All other Tooltip props

#### 3. **HelpTooltip**
Shows a question mark icon (?) with a tooltip. Useful for complex features.

```jsx
import { HelpTooltip } from '../components/common/Tooltip';

<div className="card-header">
  Advanced Settings
  <HelpTooltip content="<strong>Pro Tip:</strong><br/>These settings affect performance" />
</div>
```

**Props:**
- Same as InfoTooltip

#### 4. **IconButtonTooltip**
For icon-only buttons without text labels. Includes keyboard shortcut display.

```jsx
import { IconButtonTooltip } from '../components/common/Tooltip';

<IconButtonTooltip content="Save changes" shortcut="Ctrl+S">
  <button className="btn btn-primary">
    <i className="bi bi-save"></i>
  </button>
</IconButtonTooltip>
```

**Props:**
- Same as Tooltip, with special handling for keyboard shortcuts

## Theme Styles

### Available Themes

1. **dark** (default) - Dark background, white text
2. **light** - White background, dark text
3. **success** - Green theme for positive actions/info
4. **warning** - Yellow/orange theme for warnings
5. **danger** - Red theme for critical info/destructive actions
6. **info** - Blue theme for informational content

### Custom CSS

All tooltip styles are in `src/assets/styles/tooltips.css` and imported via `src/index.css`.

## Current Implementation Locations

### ✅ Form Fields (Contextual Help)

#### AddProperty Form
- **Property Name** - Guidance on naming conventions
- **Property Type** - Explains Standalone, Apartment, Commercial types
- **Property Manager** - Manager assignment explanation
- **Region/District/Ward** - Location hierarchy guidance
- **Street Address** - Address format examples

#### AddLease Form
- **Tenant** - Tenant selection help
- **Property/Unit** - Property and unit selection
- **Start Date** - Lease start date explanation
- **Duration** - Lease period guidance (common: 6, 12, 24 months)
- **Monthly Rent** - Rent amount guidance

#### AddTenant Form
- **First Name** - Legal name guidance
- **Last Name** - Surname/family name
- **Phone Number** - Primary contact explanation (used as username)

### ✅ Dashboard Metrics (Data Explanations)

All 4 dashboard cards include detailed tooltips:

#### Total Revenue Card
- Shows collection rate percentage
- Breakdown: Collected vs Expected amounts
- Theme: Success (green) if ≥80%, Warning (yellow) if <80%

#### Outstanding Rent Payment Card
- Shows pending percentage
- Breakdown: Outstanding vs Total expected
- Theme: Warning (yellow)
- Explains amount due but not collected

#### Total Properties Card
- Portfolio summary
- Shows: Properties count + Total units
- Theme: Info (blue)

#### Occupied & Vacant Card
- Occupancy rate percentage
- Breakdown: Occupied, Vacant, Total units
- Theme: Success (green) if ≥70%, Warning (yellow) if <70%

## Best Practices

### 1. Content Writing

✅ **DO:**
- Be concise and helpful
- Use plain language
- Include examples when helpful
- Use HTML for formatting (`<strong>`, `<br/>`, lists)
- Provide keyboard shortcuts for power users

❌ **DON'T:**
- Write lengthy paragraphs
- Duplicate information already visible
- Use technical jargon without explanation

### 2. Placement

```jsx
// ✅ Good - Inline with labels
<label>
  Field Name <InfoTooltip content="Help text" />
</label>

// ✅ Good - Next to headings
<h3>
  Section Title <HelpTooltip content="Section explanation" />
</h3>

// ❌ Avoid - Breaking layout
<label>Field Name</label>
<InfoTooltip content="Help text" /> {/* Creates new line */}
```

### 3. Theming

```jsx
// ✅ Match tooltip theme to context
<InfoTooltip content="Success message" theme="success" />
<InfoTooltip content="Warning message" theme="warning" />
<InfoTooltip content="Error details" theme="danger" />

// ✅ Dynamic theming based on data
<InfoTooltip 
  content={message}
  theme={collectionRate > 80 ? 'success' : 'warning'}
/>
```

### 4. Rich Content

```jsx
// ✅ Use HTML for structured content
<InfoTooltip content={`
  <strong>Property Types:</strong><br/>
  <ul>
    <li><strong>Standalone:</strong> Single-family homes</li>
    <li><strong>Apartment:</strong> Multi-unit buildings</li>
    <li><strong>Commercial:</strong> Office, retail, mixed-use</li>
  </ul>
`} />
```

### 5. Keyboard Shortcuts

```jsx
// ✅ Display shortcuts for power users
<IconButtonTooltip content="Save changes" shortcut="Ctrl+S">
  <button><i className="bi bi-save"></i></button>
</IconButtonTooltip>

// Displays as: "Save changes [Ctrl+S]"
```

## Adding Tooltips to New Components

### Step 1: Import
```jsx
import { InfoTooltip, HelpTooltip, Tooltip } from '../components/common/Tooltip';
```

### Step 2: Add to JSX
```jsx
// For form labels
<label>
  Field Name *
  <InfoTooltip content="Helpful explanation here" />
</label>

// For section headers
<div className="header">
  Advanced Options
  <HelpTooltip content="These settings are optional" />
</div>

// For custom elements
<Tooltip content="Detailed information" placement="right">
  <span className="metric">95%</span>
</Tooltip>
```

## Accessibility

The tooltip components are built with accessibility in mind:

- **Keyboard Navigation**: Tooltips appear on focus for keyboard users
- **ARIA Labels**: Proper ARIA attributes are included
- **Screen Readers**: Content is accessible to screen readers
- **Touch Devices**: Touch-friendly on mobile devices
- **Escape Key**: Press Esc to close tooltips

## Performance Considerations

- Tooltips are rendered on-demand (not all at once)
- Lightweight components with minimal overhead
- Lazy-loaded Tippy.js instances
- No impact on page load times
- Optimized for mobile devices

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Consider implementing:

1. **Tutorial Mode** - Highlight tooltips on first use
2. **Tooltip Analytics** - Track which tooltips are most viewed
3. **User Preferences** - Allow users to disable tooltips
4. **Multi-language Support** - Translate tooltip content
5. **Video Tooltips** - Embed short video clips for complex features
6. **Contextual Tutorials** - Multi-step guided tours using tooltips

## Troubleshooting

### Tooltip Not Showing

1. Check if tooltip CSS is imported in `index.css`
2. Verify content prop is not empty
3. Check if element has `disabled={true}`
4. Ensure parent element allows overflow

### Styling Issues

1. Check z-index conflicts (tooltips use z-index: 9999)
2. Verify custom theme is defined in `tooltips.css`
3. Check for CSS specificity conflicts

### Performance Issues

1. Avoid creating tooltips in loops without keys
2. Use `disabled={true}` for conditional tooltips instead of conditional rendering
3. Memoize complex tooltip content

## Examples Gallery

### Simple Text Tooltip
```jsx
<InfoTooltip content="This is a simple help text" />
```

### HTML Content Tooltip
```jsx
<InfoTooltip content="<strong>Bold text</strong><br/>Normal text<br/><em>Italic text</em>" />
```

### Themed Tooltips
```jsx
<InfoTooltip content="Success message" theme="success" />
<InfoTooltip content="Warning message" theme="warning" />
<InfoTooltip content="Error message" theme="danger" />
<InfoTooltip content="Info message" theme="info" />
```

### Interactive Tooltip
```jsx
<Tooltip content="You can hover over me!" interactive={true}>
  <button>Hover me</button>
</Tooltip>
```

### Custom Placement
```jsx
<InfoTooltip content="I appear on the right" placement="right" />
<InfoTooltip content="I appear on the bottom" placement="bottom" />
```

### With Keyboard Shortcut
```jsx
<IconButtonTooltip content="Quick save" shortcut="Ctrl+S">
  <button><i className="bi bi-save"></i></button>
</IconButtonTooltip>
```

## Resources

- [Tippy.js Documentation](https://atomiks.github.io/tippyjs/)
- [React Integration Guide](https://github.com/atomiks/tippyjs-react)
- [Accessibility Best Practices](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)

---

**Last Updated:** January 2025  
**Maintained By:** Development Team  
**Version:** 1.0.0
