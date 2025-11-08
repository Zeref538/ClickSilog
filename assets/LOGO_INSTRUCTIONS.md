# ClickSilog Logo Setup Instructions

I've created three professional SVG logo files for your ClickSilog app:

## 📁 Logo Files Created

1. **`icon-simple.svg`** ⭐ **RECOMMENDED FOR APP ICON**
   - Simplified, clean design
   - Optimized for small sizes
   - Features: Plate with rice and fried egg (silog representation)
   - Best for: App icon, favicon

2. **`icon.svg`**
   - More detailed version
   - Includes fork and spoon elements
   - Best for: Larger displays, marketing materials

3. **`logo.svg`**
   - Full logo with "ClickSiLog" text
   - Complete branding package
   - Best for: Splash screens, website headers, marketing

## 🎨 Design Concept

The logo represents the core of ClickSilog:
- **Yellow/Gold Background**: Warm, appetizing Filipino cuisine colors
- **White Plate**: Clean restaurant presentation
- **Garlic Rice (Yellow mound)**: The "log" in silog
- **Fried Egg (Sunny side up)**: The "si" in silog
- **Orange Accents**: Energetic, food-focused branding

## 📱 Converting SVG to PNG for Expo

Expo requires PNG files for icons. Here's how to convert:

### Method 1: Online Converter (Easiest)

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `assets/icon-simple.svg`
3. Set output size to **1024x1024** pixels
4. Download and save as `assets/icon.png`
5. Repeat for splash screen using `logo.svg` at **1242x2436** (or your preferred size)

### Method 2: ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Generate app icon
convert -background none -size 1024x1024 assets/icon-simple.svg assets/icon.png

# Generate splash screen
convert -background "#FFD54F" -size 1242x2436 assets/logo.svg assets/splash.png
```

### Method 3: Using Sharp (Node.js)

```bash
npm install sharp --save-dev
```

Then create a script to convert (see `scripts/generate-icons.js`)

## ✅ Next Steps

1. **Convert SVG to PNG**:
   - Convert `icon-simple.svg` → `assets/icon.png` (1024x1024)
   - Convert `logo.svg` → `assets/splash.png` (1242x2436 or your preferred size)

2. **Update app.json** (already done):
   - Icon path: `./assets/icon.png`
   - Splash image: `./assets/splash.png`
   - Splash background: `#FFD54F` (matching logo colors)

3. **Test the icons**:
   ```bash
   npm start
   ```
   Or rebuild your app to see the new icons

## 🎨 Color Palette

- **Primary Yellow**: `#FFD54F` / `#FFC107`
- **Accent Orange**: `#FF6F00` / `#FF8F00`
- **White**: `#FFFFFF`
- **Egg Yellow**: `#FFEB3B`
- **Rice Cream**: `#FFF8E1`

## 📐 Required Sizes

### App Icon
- iOS: 1024x1024 (App Store)
- Android: 512x512 (Play Store)
- Android Adaptive: 192x192 (foreground)

### Splash Screen
- iOS: 1242x2436 (iPhone X and newer)
- Android: 1080x1920 (standard)

## 🔧 Customization

All SVG files can be edited with:
- **Inkscape** (free): https://inkscape.org/
- **Adobe Illustrator** (paid)
- **Figma** (free, web-based): https://figma.com/

You can modify:
- Colors to match your brand
- Shapes and elements
- Text styling
- Size and proportions

## 📝 Notes

- The logo is designed to be recognizable at small sizes
- Colors are chosen to be appetizing and represent Filipino cuisine
- The fried egg and rice clearly represent "silog" meals
- The design is modern and suitable for a digital ordering app

