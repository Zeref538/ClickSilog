/**
 * Device Testing Setup Helper
 * 
 * This script helps verify your device is ready for testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Click Silog - Device Testing Setup Check\n');
console.log('='.repeat(60));

// Check ADB
console.log('\n📱 Checking ADB Connection...');
try {
  const adbVersion = execSync('adb version', { encoding: 'utf8' });
  console.log('✅ ADB is installed');
  console.log(adbVersion.split('\n')[0]);
} catch (error) {
  console.log('❌ ADB not found');
  console.log('   Please install Android SDK Platform Tools');
  console.log('   Download: https://developer.android.com/studio/releases/platform-tools');
  process.exit(1);
}

// Check connected devices
console.log('\n📱 Checking Connected Devices...');
try {
  const devices = execSync('adb devices', { encoding: 'utf8' });
  const deviceLines = devices.split('\n').filter(line => 
    line.includes('\tdevice') || line.includes('\tunauthorized')
  );
  
  if (deviceLines.length === 0) {
    console.log('⚠️  No devices connected');
    console.log('\n📋 Setup Steps:');
    console.log('   1. Enable Developer Options on your Android device:');
    console.log('      Settings → About Phone → Tap "Build Number" 7 times');
    console.log('   2. Enable USB Debugging:');
    console.log('      Settings → Developer Options → Enable "USB Debugging"');
    console.log('   3. Connect device via USB');
    console.log('   4. On device, tap "Allow USB Debugging" when prompted');
    console.log('   5. Run this script again');
  } else {
    console.log(`✅ Found ${deviceLines.length} device(s):`);
    deviceLines.forEach((line, index) => {
      const [deviceId, status] = line.split('\t');
      const statusIcon = status === 'device' ? '✅' : '⚠️';
      console.log(`   ${statusIcon} Device ${index + 1}: ${deviceId} (${status})`);
    });
  }
} catch (error) {
  console.log('❌ Error checking devices:', error.message);
}

// Check .env file
console.log('\n⚙️  Checking Environment Configuration...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const useMocks = envContent.includes('EXPO_PUBLIC_USE_MOCKS=false');
  const hasFirebase = envContent.includes('EXPO_PUBLIC_FIREBASE_API_KEY');
  
  console.log('✅ .env file exists');
  console.log(`   USE_MOCKS: ${useMocks ? 'false ✅' : 'true ⚠️ (should be false for production)'}`);
  console.log(`   Firebase Config: ${hasFirebase ? '✅ Present' : '❌ Missing'}`);
} else {
  console.log('⚠️  .env file not found');
  console.log('   Create .env file with Firebase credentials');
}

// Check Node modules
console.log('\n📦 Checking Dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules installed');
} else {
  console.log('⚠️  node_modules not found');
  console.log('   Run: npm install');
}

// Testing recommendations
console.log('\n📋 Testing Recommendations:');
console.log('   1. Install Expo Go from Play Store (for quick testing)');
console.log('   2. OR build development client: npm run build:android:dev');
console.log('   3. Start Metro: npm run start:clear');
console.log('   4. Follow testing guide: docs/TESTING_GUIDE.md');
console.log('   5. Quick checklist: docs/QUICK_TESTING_GUIDE.md');

console.log('\n' + '='.repeat(60));
console.log('✅ Setup check complete!\n');


