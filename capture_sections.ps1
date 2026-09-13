# Capture specific scroll positions for review
$sections = @(
    @{ Name = "desktop-subjects.png"; Width = 1280; Height = 900; ScrollY = 1100 },
    @{ Name = "desktop-methods.png"; Width = 1280; Height = 900; ScrollY = 1900 },
    @{ Name = "desktop-faq-contact.png"; Width = 1280; Height = 900; ScrollY = 3000 },
    @{ Name = "mobile-subjects.png"; Width = 500; Height = 900; ScrollY = 1200 },
    @{ Name = "mobile-faq-contact.png"; Width = 500; Height = 900; ScrollY = 2800 }
)

foreach ($sec in $sections) {
    # Generate temporary HTML with scroll offset
    $tmpHtml = "d:\mainweb\.temp_scroll.html"
    $scriptTag = "<script>window.addEventListener('load', () => { setTimeout(() => { window.scrollTo(0, $($sec.ScrollY)); }, 100); });</script>"
    $orig = Get-Content "d:\mainweb\index.html" -Raw -Encoding UTF8
    $modified = $orig -replace "</body>", "$scriptTag</body>"
    [System.IO.File]::WriteAllText($tmpHtml, $modified, [System.Text.Encoding]::UTF8)

    $outPath = Join-Path "d:\mainweb" $sec.Name
    Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @(
        "--headless=new",
        "--disable-gpu",
        "--window-size=$($sec.Width),$($sec.Height)",
        "--user-data-dir=d:\mainweb\.temp_scroll_user",
        "--screenshot=$outPath",
        "http://localhost:8080/.temp_scroll.html"
    ) -Wait

    Write-Host "Captured $($sec.Name)"
}

Remove-Item "d:\mainweb\.temp_scroll.html" -ErrorAction SilentlyContinue
