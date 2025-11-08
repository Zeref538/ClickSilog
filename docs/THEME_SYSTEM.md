# Theme System Documentation

## Overview

The ClickSilog app uses a comprehensive, canonical theme system to ensure consistent UI/UX across all screens and eliminate the risk of `ReferenceError: Property 'spacing' doesn't exist`.

## Architecture

### Canonical Theme File

**Location:** `src/theme/index.js`

This is the single source of truth for all design tokens:
- Spacing tokens (xs, sm, md, lg, xl, xxl)
- Border radius tokens
- Typography tokens
- Color definitions (via lightTheme/darkTheme)

### Theme Context

**Location:** `src/contexts/ThemeContext.js`

Provides the `useTheme()` hook that components use to access theme tokens:

```javascript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  
  return (
    <View style={{ padding: spacing.md, borderRadius: borderRadius.md }}>
      <Text style={typography.body}>Hello</Text>
    </View>
  );
};
```

### Runtime Safeguards

**Location:** `src/theme/utils.js`

Utilities for safe theme token access:

- `getToken(theme, path, fallback)` - Safely get any theme token
- `getSpacing(theme, size, fallback)` - Get spacing value safely
- `getColor(theme, colorName, fallback)` - Get color value safely
- `validateTheme(theme)` - Validate theme structure
- `createSafeTheme(theme)` - Create theme with fallbacks

## Usage Rules

### ✅ CORRECT Usage

```javascript
// 1. Using useTheme hook (recommended)
import { useTheme } from '../contexts/ThemeContext';

const { spacing, borderRadius, typography } = useTheme();
const style = { padding: spacing.md };

// 2. Using theme object from useTheme
const { theme } = useTheme();
const style = { padding: theme.spacing.md };

// 3. Using safe utilities
import { getSpacing } from '../theme/utils';
const padding = getSpacing(theme, 'md', 16);
```

### ❌ INCORRECT Usage

```javascript
// ❌ Bare spacing variable
const spacing = { xs: 4, sm: 8 }; // DON'T DO THIS
const style = { padding: spacing.md };

// ❌ Direct import of spacing (unless from theme/index.js)
import { spacing } from './somewhere'; // DON'T DO THIS

// ❌ Magic numbers
const style = { padding: 16 }; // Use spacing.md instead
```

## Design Tokens

### Spacing

All spacing values follow an 8px base system:

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Border Radius

- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `xxl`: 24px
- `round`: 9999px (fully rounded)

### Typography

- `h1`, `h2`, `h3`, `h4` - Headings
- `body`, `bodyBold`, `bodyMedium` - Body text
- `caption`, `captionBold` - Captions
- `overline` - Overline text
- `button` - Button text

## CI/CD Integration

### Theme Usage Check

Run the theme audit script:

```bash
npm run check:theme
```

This script:
- Scans all source files for unsafe theme usage
- Detects bare `spacing` variables
- Detects magic numbers that should be spacing tokens
- Fails the build if issues are found

### ESLint Rules

The ESLint configuration includes rules to prevent unsafe theme usage. See `.eslintrc.js` for details.

## Migration Guide

### Replacing Magic Numbers

**Before:**
```javascript
const style = {
  padding: 16,
  margin: 8,
  gap: 24,
};
```

**After:**
```javascript
const { spacing } = useTheme();
const style = {
  padding: spacing.md,
  margin: spacing.sm,
  gap: spacing.lg,
};
```

### Replacing Inline Styles

**Before:**
```javascript
<View style={{ padding: 12, marginTop: 8 }}>
```

**After:**
```javascript
const { spacing } = useTheme();
<View style={{ padding: spacing.md, marginTop: spacing.sm }}>
```

## Testing

### Unit Tests

Test theme utilities:

```javascript
import { getSpacing, validateTheme } from '../theme/utils';

test('getSpacing returns fallback for invalid theme', () => {
  const spacing = getSpacing(null, 'md', 16);
  expect(spacing).toBe(16);
});

test('validateTheme detects missing spacing', () => {
  const result = validateTheme({ colors: {} });
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Missing or invalid theme.spacing');
});
```

### Manual Testing

1. Open each screen and verify no console errors
2. Verify spacing is consistent across screens
3. Test theme toggle (light/dark mode)
4. Verify all components use theme tokens

## Troubleshooting

### "ReferenceError: Property 'spacing' doesn't exist"

**Cause:** Component is trying to access `spacing` without using `useTheme()` hook.

**Fix:**
1. Import `useTheme` hook
2. Destructure `spacing` from hook
3. Use `spacing.md` instead of bare `spacing`

### Theme not updating

**Cause:** Component not re-rendering when theme changes.

**Fix:** Ensure component uses `useTheme()` hook and theme is properly provided by `ThemeProvider`.

### Missing theme tokens

**Cause:** Theme object is malformed or missing properties.

**Fix:** Use `createSafeTheme()` utility to ensure all required properties exist with fallbacks.

## Best Practices

1. **Always use `useTheme()` hook** - Never import spacing directly
2. **Use theme tokens** - Never use magic numbers for spacing
3. **Validate in development** - Use `getToken()` with warnings in `__DEV__`
4. **Test theme changes** - Verify both light and dark modes
5. **Run theme check** - Use `npm run check:theme` before committing

## Files Structure

```
src/
├── theme/
│   ├── index.js          # Canonical theme exports
│   └── utils.js          # Runtime safeguards
├── contexts/
│   └── ThemeContext.js   # Theme provider and hook
├── config/
│   └── theme.js          # Theme definitions (light/dark)
└── scripts/
    └── check-theme-usage.js  # CI audit script
```

## References

- [Design System Principles](./DESIGN_SYSTEM.md)
- [Component Guidelines](./COMPONENT_GUIDELINES.md)
- [Testing Guide](./TESTING.md)

