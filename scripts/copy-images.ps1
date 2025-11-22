# Script to organize menu images
$baseDir = "D:\SCHOOL\VSCODE\LATEST CLICKSILOG\ClickSilog\ClickSilog"
$targetDir = "$baseDir\assets\menu-images"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Write-Host "Organizing menu images..." -ForegroundColor Green

# Silog Meals
$silogMapping = @{
    "TapSiLog.png" = "tapsilog.png"
    "BangSiLog.png" = "bangsilog.png"
    "PorkchopSiLog.png" = "porkchopsilog.png"
    "ToSiLog.png" = "tocilog.png"
    "ChickSiLog.png" = "chicksilog.png"
    "BaconSiLog.png" = "baconsilog.png"
    "LechonSiLog.png" = "lechonsilog.png"
    "BBQ with Rice.png" = "bbq_rice.png"
    "ShanghaiSiLog.png" = "shanghai_silog.png"
    "Hungarian.png" = "hungarian_silog.png"
    "Embosilog.png" = "embosilog.png"
    "HotSiLog.png" = "hotsilog.png"
    "LongSiLog.png" = "longsilog.png"
    "HamSiLog.png" = "hamsilog.png"
    "SpamSiLog.png" = "spamsilog.png"
}

$silogSource = "D:\SCHOOL\VSCODE\LATEST CLICKSILOG\ClickSilog\Silog Meals"
foreach ($key in $silogMapping.Keys) {
    $source = Join-Path $silogSource $key
    $dest = Join-Path $targetDir $silogMapping[$key]
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "Copied $key" -ForegroundColor Cyan
    }
}

# Snacks and Drinks
$snacksMapping = @{
    "FriesInACup.png" = "fries_cup.png"
    "FIAC-NachosVersion.png" = "nachos.png"
    "FIAC-CheeseStickVersion.png" = "cheese_sticks.png"
    "Corndog.png" = "corndog_classic.png"
    "CorndogPotato.png" = "corndog_potato.png"
    "CucumberLemonade.png" = "cucumber_lemonade.png"
    "LemonIcedTea.png" = "lemon_ice_tea.png"
    "BlueLemonade.png" = "blue_lemonade.png"
    "RedIcedTea.png" = "red_ice_tea.png"
    "MountainDew.jpeg" = "mountain_dew.jpg"
    "Coke.jpg" = "coke.jpg"
    "sprite.jpg" = "sprite.jpg"
    "Royal.jpg" = "royal.jpg"
    "MineralWater.jpg" = "mineral_water.jpg"
}

$snacksSource = "D:\SCHOOL\VSCODE\LATEST CLICKSILOG\ClickSilog\Snacks and Drinks"
foreach ($key in $snacksMapping.Keys) {
    $source = Join-Path $snacksSource $key
    $dest = Join-Path $targetDir $snacksMapping[$key]
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "Copied $key" -ForegroundColor Cyan
    }
}

Write-Host "Images organized successfully!" -ForegroundColor Green
