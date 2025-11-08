# App Icon Creation Guide

## Icon Specifications

### Required Sizes
- **1024x1024** - Main icon (for app.json)
- **1024x1024** - Adaptive icon foreground (Android)
- **1242x2436** - Splash screen (optional, can use icon)

### Android Adaptive Icon
- **Foreground**: 1024x1024 (icon)
- **Background**: 1024x1024 (solid color or pattern)
- **Safe Zone**: Keep important content within 768x768 center area

## Design Guidelines

### App Theme
- **Primary Color**: #FFD54F (Yellow)
- **App Name**: ClickSilog (Restaurant ordering app)
- **Style**: Modern, clean, professional

### Design Elements
1. **Restaurant Theme**: Fork, spoon, bowl, or plate
2. **Color Scheme**: Yellow (#FFD54F) background with dark (#1E1E1E) icons
3. **Typography**: Bold, readable (consider "CS" or "C" for ClickSilog)
4. **Style**: Flat design, minimal, modern

## Quick Creation Methods

### Method 1: Use Icon Template
1. Open `assets/icon-template.svg` in a design tool (Figma, Illustrator, etc.)
2. Customize colors and elements
3. Export as PNG at 1024x1024

### Method 2: Online Icon Generator
1. Go to https://icon.kitchen
2. Upload a 1024x1024 image
3. Generate all required sizes automatically
4. Download and place in `assets/` folder

### Method 3: AI Image Generator
Use this prompt:
```
"Restaurant app icon, yellow (#FFD54F) background, 
fork and spoon or bowl icon, modern flat design, 
clean, professional, 1024x1024, centered"
```

### Method 4: Simple Text Icon
Create a simple icon with:
- Yellow (#FFD54F) background
- Bold "CS" or "C" text in dark color (#1E1E1E)
- Rounded corners
- Modern font (Poppins, Inter, etc.)

## File Structure

After creating icons, place them in `assets/` folder:

```
assets/
  ├── icon.png (1024x1024)
  ├── adaptive-icon.png (1024x1024)
  └── splash.png (1242x2436) [optional]
```

## Quick Fix: Use Simple Text Icon

If you need a quick icon, you can:

1. **Create in Canva/Figma**:
   - 1024x1024 canvas
   - Yellow (#FFD54F) background
   - Bold "CS" text in dark color
   - Export as PNG

2. **Or use online tool**:
   - https://www.canva.com
   - Create 1024x1024 design
   - Use yellow background + text
   - Download

## Testing

After creating icons:
1. Place in `assets/` folder
2. Update `app.json` (already configured)
3. Test with: `npx expo start`
4. Build APK: `npm run build:android:apk`

## Recommended Tools

### Free
- **Figma**: https://figma.com (Best for design)
- **Canva**: https://canva.com (Easy to use)
- **GIMP**: https://gimp.org (Image editing)

### Online Generators
- **IconKitchen**: https://icon.kitchen
- **AppIcon.co**: https://www.appicon.co
- **MakeAppIcon**: https://makeappicon.com

### AI Generators
- **DALL·E**: https://openai.com/dall-e-2
- **Midjourney**: https://midjourney.com
- **Stable Diffusion**: https://stability.ai

## Quick Start (5 minutes)

1. Go to https://www.canva.com
2. Create new design: 1024x1024
3. Add yellow background (#FFD54F)
4. Add text "CS" or "C" (large, bold, dark color)
5. Export as PNG
6. Save as `assets/icon.png`
7. Copy same file as `assets/adaptive-icon.png`

Done! Your app icon is ready.

