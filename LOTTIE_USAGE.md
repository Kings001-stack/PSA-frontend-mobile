# Lottie Animations Usage Guide

This guide explains how to use Lottie animations in the PrimeChem Pharmacy Assistant app.

## Installed Packages

1. **lottie-react-native** - Primary package for React Native Lottie animations
2. **@lottiefiles/dotlottie-react** - Additional package for advanced Lottie features (primarily for web)

## Available Animation Files

Located in `frontend/src/assets/lottie/`:

- `Loading animation blue.json` - Blue loading spinner animation
- `Successfully done.json` - Success checkmark animation
- `error.json` - Error animation
- `empty.json` - Empty state animation
- `loading.json` - Alternative loading animation
- `success.json` - Alternative success animation

## Components

### AnimatedIcon Component

The main component for displaying Lottie animations:

```tsx
import AnimatedIcon from "../components/AnimatedIcon";

// Usage examples:
<AnimatedIcon type="loading" size={120} />
<AnimatedIcon type="success" size={80} loop={false} />
<AnimatedIcon type="error" size={100} />
<AnimatedIcon type="empty" size={140} />
```

**Props:**

- `type`: "loading" | "success" | "error" | "empty"
- `size`: number (default: 100)
- `loop`: boolean (default: true)
- `autoPlay`: boolean (default: true)
- `speed`: number (default: 1)
- `onAnimationFinish`: callback function

### SuccessModal Component

Modal with animated feedback:

```tsx
import SuccessModal from "../components/SuccessModal";

<SuccessModal
  visible={showSuccess}
  message="Operation completed successfully!"
  onClose={() => setShowSuccess(false)}
  type="success"
  duration={2000}
/>;
```

## Current Usage in App

### Loading States

- **AdminDashboardScreen**: Dashboard data loading
- **RefillManagementScreen**: Refill requests loading
- **ImprovedRefillScreen**: Refills and medications loading
- **InventoryScreen**: Inventory loading
- **MedicationSearchScreen**: Search results loading

### Success/Error Feedback

- **ImprovedRefillScreen**: Refill request submission
- **RefillManagementScreen**: Status updates (approve/reject)
- **InventoryScreen**: Inventory operations
- **LoginScreen**: Authentication feedback

### Empty States

- **ImprovedRefillScreen**: No refill requests
- **RefillManagementScreen**: No refills found
- **InventoryScreen**: No inventory items
- **MedicationSearchScreen**: No search results

## Adding New Animations

1. Add your `.json` animation file to `frontend/src/assets/lottie/`
2. Update the `animations` object in `AnimatedIcon.tsx`:

```tsx
const animations = {
  loading: require("../assets/lottie/Loading animation blue.json"),
  success: require("../assets/lottie/Successfully done.json"),
  error: require("../assets/lottie/error.json"),
  empty: require("../assets/lottie/empty.json"),
  // Add your new animation:
  newAnimation: require("../assets/lottie/your-animation.json"),
};
```

3. Update the `AnimationType` type:

```tsx
type AnimationType = "loading" | "success" | "error" | "empty" | "newAnimation";
```

## Best Practices

1. **Performance**: Use appropriate sizes for animations (avoid very large sizes)
2. **Loop Control**: Set `loop={false}` for one-time animations like success/error
3. **Loading States**: Always show loading animations for async operations
4. **Consistent Sizing**: Use consistent sizes across similar use cases
5. **Accessibility**: Ensure animations don't interfere with accessibility features

## Animation Guidelines

- **Loading**: Use blue loading animation for consistency with app theme
- **Success**: Use green checkmark animation for positive feedback
- **Error**: Use red error animation for negative feedback
- **Empty States**: Use subtle empty state animations to guide users

## Troubleshooting

If animations don't display:

1. Check that the JSON file exists in the correct path
2. Verify the animation is properly imported in `AnimatedIcon.tsx`
3. Ensure the component has proper dimensions (width/height)
4. Check console for any import errors
