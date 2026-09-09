Write-Host "=== TEST HTTP (PORT 80) ==="
try {
    $res = Invoke-WebRequest -Uri 'http://appstore.civer.cloud/' -UseBasicParsing
    Write-Host "HTTP Status: $($res.StatusCode)"
    if ($res.Content -match '<title>(.*?)</title>') {
        Write-Host "HTTP Title: $($matches[1])"
    }
} catch {
    Write-Host "HTTP Error: $($_.Exception.Message)"
}

Write-Host "`n=== TEST OTA MANIFEST (PORT 80) ==="
try {
    $ota = Invoke-RestMethod -Uri 'http://appstore.civer.cloud/api/v1/ota/manifest.json'
    Write-Host "OTA App ID: $($ota.releases.'civer-app-store'.appId)"
    Write-Host "OTA Version: $($ota.releases.'civer-app-store'.versionName) (Build $($ota.releases.'civer-app-store'.versionCode))"
    Write-Host "OTA Download URL: $($ota.releases.'civer-app-store'.downloadUrl)"
} catch {
    Write-Host "OTA Error: $($_.Exception.Message)"
}
