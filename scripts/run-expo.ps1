param(
  [switch]$StartEmulator,
  [string]$AvdName = '',
  [switch]$Tunnel
)

# PowerShell script to start emulator (optional), ensure env vars, then start Expo and open on Android.
# Usage:
#   .\run-expo.ps1 -StartEmulator -AvdName "Pixel_4_API_31" -Tunnel
#   .\run-expo.ps1 -Tunnel

Write-Host "Running run-expo.ps1..."

# Ensure workspace root is current working directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir
Set-Location ..\

# Set ANDROID_HOME if not set
if (-not $env:ANDROID_HOME -or $env:ANDROID_HOME -eq "") {
  $possible = "C:\\Users\\ADMIN\\AppData\\Local\\Android\\Sdk"
  if (Test-Path $possible) {
    Write-Host "ANDROID_HOME not set. Setting to: $possible"
    $env:ANDROID_HOME = $possible
  } else {
    Write-Warning "ANDROID_HOME is not set and default path does not exist. Please set ANDROID_HOME environment variable to continue."
  }
}

# Add platform-tools to PATH for this session
$platformTools = Join-Path $env:ANDROID_HOME 'platform-tools'
if ($env:Path -notlike "*$platformTools*") {
  Write-Host "Adding platform-tools to PATH for this session: $platformTools"
  $env:Path += ";$platformTools"
}

# Add emulator path for starting AVDs
$emulatorPath = Join-Path $env:ANDROID_HOME 'emulator'
$emulatorExe = Join-Path $emulatorPath 'emulator.exe'

# Helper function: check for connected device
function Get-ConnectedDevice {
  $devices = & adb devices | Where-Object { $_ -and ($_ -match "\tdevice$") }
  return $devices
}

$devices = Get-ConnectedDevice
if (-not $devices -and $StartEmulator) {
  # Try to choose an emulator AVD
  Write-Host "No connected devices detected. Trying to start emulator..."
  if (-not (Test-Path $emulatorExe)) {
    Write-Warning "emulator.exe not found at $emulatorExe. Please ensure your Android SDK is installed and emulator component is available."
    exit 1
  }

  if (-not $AvdName) {
    $avds = & "$emulatorExe" -list-avds
    if ($avds -and $avds.Count -gt 0) {
      $AvdName = $avds[0]
      Write-Host "Selecting first AVD: $AvdName"
    } else {
      Write-Warning "No AVDs found. Create an AVD in Android Studio (AVD Manager) or pass -AvdName 'Your_AVD' to the script."
      exit 1
    }
  }

  Write-Host "Starting AVD: $AvdName"
  # Start emulator in background
  Start-Process -FilePath $emulatorExe -ArgumentList @("-avd", "$AvdName") -NoNewWindow -WindowStyle Normal

  # Wait for the emulator to connect
  $count = 0
  while ($count -lt 60) {
    Start-Sleep -Seconds 2
    $devices = Get-ConnectedDevice
    if ($devices) { break }
    $count++
  }
}

# Recheck device
$devices = Get-ConnectedDevice
if ($devices) {
  Write-Host "Connected device(s):"
  $devices | ForEach-Object { Write-Host $_ }
} else {
  Write-Warning "No device connected. Ensure your emulator is running or a device is attached via USB."
}

# Run expo start and open on android
$startArgs = @('expo', 'start')
if ($Tunnel) { $startArgs += '--tunnel' }
# Use --android to open automatically once Metro is ready
$startArgs += '--android'

# Use npx to ensure local expo CLI is used
Write-Host "Starting Expo (this will open the app in Expo Go on the emulator): npx $($startArgs -join ' ')"

$npx = Get-Command npx -ErrorAction SilentlyContinue
if (-not $npx) {
  Write-Warning "'npx' not found. Please ensure Node.js is installed."
  exit 1
}

try {
  & npx $startArgs
} catch {
  Write-Warning "Failed starting with 'tunnel' (or the CLI returned an error): $_"
  Write-Host "Falling back to LAN host mode (npx expo start --lan --android). If this is a remote device, ensure the device and PC are on the same network."
  try {
    & npx expo start --lan --android
  } catch {
    Write-Error "Failed to start expo using both tunnel and LAN options: $_"
    exit 1
  }
}

Write-Host "Finished running expo command (if it returned)."
