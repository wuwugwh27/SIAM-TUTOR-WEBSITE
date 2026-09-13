$process = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @("--headless=new", "--disable-gpu", "--window-size=390,844", "--dump-dom", "http://localhost:8080/") -NoNewWindow -PassThru -RedirectStandardOutput "d:\mainweb\dump.html"
$process.WaitForExit()
Write-Host "Dumped DOM length: $((Get-Item 'd:\mainweb\dump.html').Length)"
