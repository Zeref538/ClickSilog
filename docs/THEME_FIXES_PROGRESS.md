# Theme Fixes Progress

## Summary

The theme audit script has been refined and now reports **21 real issues** (down from 75 false positives).

## Completed Fixes

### ✅ MenuScreen.js
- Fixed `gap: 8` → `spacing.sm` (inline)
- Fixed `gap: 12` → `spacing.md` (inline)
- Fixed `padding: 12` → `spacing.md` (inline)
- Fixed `paddingBottom: 20` → `spacing.xl` (inline)

## Remaining Issues (21)

### UI Components (11 issues)

1. **MenuItemCard.js** (1 issue)
   - Line 220: `gap: 4` → should use `spacing.xs`

2. **ItemCustomizationModal.js** (1 issue)
   - Line 597: `gap: 24` → should use `spacing.lg`

3. **CashPaymentConfirmationModal.js** (2 issues)
   - Line 273: `padding: 20` → should use `spacing.xl` (or `spacing.md + spacing.xs`)
   - Line 344: `gap: 8` → should use `spacing.sm`

4. **ConfirmationModal.js** (2 issues)
   - Line 236: `padding: 20` → should use `spacing.xl`
   - Line 241: `padding: 24` → should use `spacing.lg`

5. **NotificationModal.js** (2 issues)
   - Line 200: `padding: 20` → should use `spacing.xl`
   - Line 205: `padding: 24` → should use `spacing.lg`

6. **RoleSelector.js** (3 issues)
   - Line 42: `padding: 24` → should use `spacing.lg`
   - Line 45: `padding: 16` → should use `spacing.md`
   - Line 50: `padding: 12` → should use `spacing.md` (or `spacing.sm + spacing.xs`)

### Admin Screens (3 issues)

7. **AddOnsManager.js** (1 issue)
   - Line 861: `padding: 24` → should use `spacing.lg`

8. **DiscountManager.js** (1 issue)
   - Line 934: `padding: 24` → should use `spacing.lg`

9. **MenuManager.js** (1 issue - not shown in current output but likely exists)
   - Similar padding issues

## Fix Strategy

### For StyleSheet.create() patterns:
1. Move spacing values to inline styles where `spacing` is available
2. Or create a function that returns styles with spacing parameter
3. Or use a helper function that has access to theme

### Example Fix Pattern:

**Before:**
```javascript
const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 8,
  }
});
```

**After:**
```javascript
const MyComponent = () => {
  const { spacing } = useTheme();
  
  return (
    <View style={[styles.container, { padding: spacing.xl, gap: spacing.sm }]}>
      {/* content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding and gap handled inline with theme spacing
  }
});
```

## Next Steps

1. Fix remaining 21 magic number issues
2. Run `npm run check:theme` to verify all issues are resolved
3. Continue with Phase 2 enhancements (core components)
4. Continue with Phase 3 enhancements (screen improvements)

## Notes

- The audit script now correctly ignores:
  - Theme definition files
  - Prop passing patterns (`spacing={spacing}`)
  - Context access patterns (`themeContext.spacing`)
  - Positioning values (`left: 0`, `right: 0`, etc.)
  - Comments

- Only real magic numbers in `padding`, `margin`, and `gap` properties are flagged
- Values must match spacing tokens (4, 8, 12, 16, 20, 24, 32, 40, 48) to be flagged

