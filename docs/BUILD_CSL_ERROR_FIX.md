# Fix: "package.json does not exist in /CSL" Build Error

## Error Details
```
package.json does not exist in /CSL
```

This error appears in:
- Pre-install hook
- Build error hook
- Build complete hook

## Root Cause
The build system is looking for `package.json` in `/CSL` (Windows path), but EAS builds run on Linux where that path doesn't exist.

## Likely Causes

1. **Metro config using `__dirname`** - Fixed by using `process.cwd()` instead
2. **Hidden build hook script** - May be in a hidden directory or EAS configuration
3. **Project archive issue** - The project might not be extracting correctly

## Fixes Applied

1. ✅ Updated `metro.config.js` to use `process.cwd()` instead of `__dirname`
2. ✅ Created `.easignore` to exclude Windows-specific files
3. ✅ Fixed dependency versions to match Expo SDK 54

## Next Steps

1. **Commit the fixes:**
   ```bash
   git add .
   git commit -m "Fix EAS build path issues"
   git push
   ```

2. **Rebuild with cache cleared:**
   ```bash
   eas build --clear-cache --platform android --profile preview
   ```

3. **If still failing**, check the build logs for:
   - Which specific script is trying to access `/CSL`
   - What command is being run in the build hooks
   - Any other path-related errors

## Alternative: Check Build Logs

The build logs should show the exact command causing the error. Look for:
- Scripts being executed
- Commands with `/CSL` in them
- Any `cd` commands or path changes

## If Problem Persists

1. Check if there's a `.eas` directory with hooks
2. Verify no scripts in `package.json` use absolute Windows paths
3. Ensure `package.json` is in the root and committed to git
4. Try building a minimal version to isolate the issue

---

**Status**: Fixes applied, ready to rebuild

