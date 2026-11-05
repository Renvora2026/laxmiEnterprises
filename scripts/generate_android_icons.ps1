Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$srcPath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    $srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcImg, 0, 0, $width, $height)
    
    $parentDir = Split-Path -Parent $destPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
    Write-Host "Generated $destPath ($width x $height)"
}

# Android mipmap launcher icons
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png" 48 48
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png" 72 72
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" 96 96
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" 144 144
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" 192 192

# Android launch/splash cover images
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/drawable/launch_image.png" 256 256
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/android/app/src/main/res/drawable-v21/launch_image.png" 256 256

# Flutter app assets
Resize-Image "public/logo.png" "laxmi_enterprises_mobile/assets/images/logo.png" 512 512

