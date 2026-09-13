# Launch Edge headless with remote debugging port 9222
$edgeProcess = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @(
    "--headless=new",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    "--user-data-dir=d:\mainweb\.temp_cdp",
    "http://localhost:8080/"
) -PassThru

Start-Sleep -Seconds 2

try {
    # Check CDP endpoint
    $pages = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $page = $pages[0]
    Write-Host "Page connected: $($page.title) - $($page.url)"
    Write-Host "WebSocket Debugger URL: $($page.webSocketDebuggerUrl)"
} finally {
    Stop-Process -Id $edgeProcess.Id -Force -ErrorAction SilentlyContinue
}
