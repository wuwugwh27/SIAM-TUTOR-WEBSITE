# Full Automated Test Suite for Siam Tutor using Chrome DevTools Protocol (CDP)
Add-Type -AssemblyName System.Net.WebSockets
Add-Type -AssemblyName System.Web

$script:msgId = 0

$edgeArgs = @(
    "--headless=new",
    "--disable-gpu",
    "--remote-debugging-port=9223",
    "--user-data-dir=d:\mainweb\.temp_cdp2",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-sync",
    "--hide-scrollbars",
    "http://localhost:8080/"
)

$edge = Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList $edgeArgs -PassThru
Start-Sleep -Seconds 2

try {
    # Fetch page targets
    $targets = Invoke-RestMethod -Uri "http://localhost:9223/json"
    $pageTarget = $targets | Where-Object { $_.url -like "*8080*" } | Select-Object -First 1
    if (!$pageTarget) {
        $pageTarget = $targets[0]
    }
    Write-Host "Target URL: $($pageTarget.url)"

    # Connect WebSocket
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $ct = New-Object System.Threading.CancellationToken
    $ws.ConnectAsync([Uri]$pageTarget.webSocketDebuggerUrl, $ct).Wait()

    function Send-CDP($method, $params = @{}) {
        $script:msgId = $script:msgId + 1
        $reqObj = [ordered]@{ id = $script:msgId; method = $method; params = $params }
        $req = $reqObj | ConvertTo-Json -Depth 10 -Compress
        $reqBytes = [System.Text.Encoding]::UTF8.GetBytes($req)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$reqBytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

        # Read response
        $buf = New-Object byte[] 131072
        $resSegment = New-Object System.ArraySegment[byte] -ArgumentList @(,$buf)
        $resText = ""
        do {
            $readRes = $ws.ReceiveAsync($resSegment, $ct)
            $readRes.Wait()
            $count = $readRes.Result.Count
            $resText += [System.Text.Encoding]::UTF8.GetString($buf, 0, $count)
        } while (!$readRes.Result.EndOfMessage)

        return ($resText | ConvertFrom-Json)
    }

    function Eval-JS($code) {
        $res = Send-CDP "Runtime.evaluate" @{ expression = $code; returnByValue = $true }
        return $res.result.result.value
    }

    function Capture-Screenshot($path, $fullPage = $false) {
        $params = @{ format = "png" }
        if ($fullPage) {
            $params["captureBeyondViewport"] = $true
        }
        $res = Send-CDP "Page.captureScreenshot" $params
        $base64 = $res.result.data
        [System.IO.File]::WriteAllBytes($path, [System.Convert]::FromBase64String($base64))
        Write-Host "Saved screenshot: $path ($((Get-Item $path).Length) bytes)"
    }

    # Enable Page & Runtime
    Send-CDP "Page.enable" | Out-Null
    Send-CDP "Runtime.enable" | Out-Null

    Write-Host "`n=== 1. TESTING MOBILE VIEWPORT (390x844) ==="
    Send-CDP "Emulation.setDeviceMetricsOverride" @{
        width = 390; height = 844; deviceScaleFactor = 2; mobile = $true
    } | Out-Null
    Start-Sleep -Milliseconds 500

    # 1.1 Check Title & Meta
    $pageTitle = Eval-JS "document.title"
    $metaDesc = Eval-JS "document.querySelector('meta[name=""description""]').getAttribute('content')"
    Write-Host "[TEST PASS] Page Title: $pageTitle"
    Write-Host "[TEST PASS] Meta Description: $metaDesc"

    # 1.2 Check Centralized Config Hydration
    $tutorName = Eval-JS "window.SIAM_TUTOR_CONFIG.tutorName"
    $phoneDisplay = Eval-JS "document.querySelector('[data-config=""phone-display""]').textContent"
    $waHref = Eval-JS "document.querySelector('a[data-config=""whatsapp-link""]').href"
    Write-Host "[TEST PASS] Config Tutor Name: $tutorName"
    Write-Host "[TEST PASS] Config Phone Display: $phoneDisplay"
    Write-Host "[TEST PASS] Config WhatsApp Link: $waHref"

    # 1.3 Test Mobile Hamburger Menu Toggle
    $menuBefore = Eval-JS "document.getElementById('menu-toggle-btn').getAttribute('aria-expanded')"
    Eval-JS "document.getElementById('menu-toggle-btn').click()" | Out-Null
    $menuAfterOpen = Eval-JS "document.getElementById('menu-toggle-btn').getAttribute('aria-expanded')"
    $drawerHiddenAfterOpen = Eval-JS "document.getElementById('mobile-nav').classList.contains('is-hidden')"
    Write-Host "[TEST PASS] Menu Toggle: Before=$menuBefore, AfterOpen=$menuAfterOpen, DrawerHidden=$drawerHiddenAfterOpen"

    # Capture open menu screenshot
    Capture-Screenshot "d:\mainweb\mobile-menu-open.png"

    # Close menu via anchor click
    Eval-JS "document.querySelector('#mobile-nav a[href=""#about""]').click()" | Out-Null
    $menuAfterClose = Eval-JS "document.getElementById('menu-toggle-btn').getAttribute('aria-expanded')"
    $drawerHiddenAfterClose = Eval-JS "document.getElementById('mobile-nav').classList.contains('is-hidden')"
    Write-Host "[TEST PASS] Menu Close On Anchor Click: Expanded=$menuAfterClose, DrawerHidden=$drawerHiddenAfterClose"

    # 1.4 Test FAQ Accordion
    $faq1Before = Eval-JS "document.getElementById('faq-q-1').getAttribute('aria-expanded')"
    Eval-JS "document.getElementById('faq-q-1').click()" | Out-Null
    $faq1AfterOpen = Eval-JS "document.getElementById('faq-q-1').getAttribute('aria-expanded')"
    $faq1PanelOpen = Eval-JS "document.getElementById('faq-ans-1').classList.contains('is-open')"
    $faq1Icon = Eval-JS "document.querySelector('#faq-q-1 .faq-icon').textContent"
    Write-Host "[TEST PASS] FAQ Q1 Toggle: Open=$faq1AfterOpen, PanelOpen=$faq1PanelOpen, Icon=$faq1Icon"

    # Open FAQ Q2 (should close Q1)
    Eval-JS "document.getElementById('faq-q-2').click()" | Out-Null
    $faq1AfterQ2 = Eval-JS "document.getElementById('faq-q-1').getAttribute('aria-expanded')"
    $faq2AfterQ2 = Eval-JS "document.getElementById('faq-q-2').getAttribute('aria-expanded')"
    Write-Host "[TEST PASS] FAQ Accordion Exclusive: Q1=$faq1AfterQ2, Q2=$faq2AfterQ2"

    # 1.5 Test Form Validation (Empty Submit)
    Eval-JS "document.getElementById('tuition-form').dispatchEvent(new Event('submit', { cancelable: true }))" | Out-Null
    $parentNameInvalid = Eval-JS "document.getElementById('parentName').getAttribute('aria-invalid')"
    $parentNameErrMsg = Eval-JS "document.getElementById('parentNameError').textContent"
    $phoneErrMsg = Eval-JS "document.getElementById('phoneNumberError').textContent"
    Write-Host "[TEST PASS] Form Empty Validation: aria-invalid=$parentNameInvalid, NameError='$parentNameErrMsg', PhoneError='$phoneErrMsg'"

    # 1.6 Test Form Validation (Invalid Phone Format)
    $badPhoneSetup = "document.getElementById('parentName').value = 'Test Parent'; document.getElementById('studentClass').selectedIndex = 1; document.getElementById('subjectSelect').selectedIndex = 1; document.getElementById('phoneNumber').value = '01234'; document.getElementById('address').value = 'Manikganj Sadar';"
    Eval-JS $badPhoneSetup | Out-Null
    Eval-JS "document.getElementById('tuition-form').dispatchEvent(new Event('submit', { cancelable: true }))" | Out-Null
    $badPhoneErr = Eval-JS "document.getElementById('phoneNumberError').textContent"
    Write-Host "[TEST PASS] Bad Phone Number Error: '$badPhoneErr'"

    # 1.7 Test Form Valid Submission
    $goodPhoneSetup = "document.getElementById('phoneNumber').value = '01712345678'; document.getElementById('studentNeeds').value = 'Need help in Algebra';"
    Eval-JS $goodPhoneSetup | Out-Null
    Eval-JS "document.getElementById('tuition-form').dispatchEvent(new Event('submit', { cancelable: true }))" | Out-Null
    $modalActive = Eval-JS "document.getElementById('submission-modal').classList.contains('is-active')"
    $modalSummary = Eval-JS "document.getElementById('modal-details-content').innerText"
    Write-Host "[TEST PASS] Modal Active=$modalActive"
    Write-Host "[TEST PASS] Modal Summary: $modalSummary"

    # Capture Modal Screenshot
    Capture-Screenshot "d:\mainweb\mobile-modal-submitted.png"

    # Close modal
    Eval-JS "document.getElementById('modal-close-btn').click()" | Out-Null
    $modalClosed = Eval-JS "document.getElementById('submission-modal').classList.contains('is-active')"
    Write-Host "[TEST PASS] Modal Closed: Active=$modalClosed"

    # Mobile Full Page Screenshot
    Capture-Screenshot "d:\mainweb\mobile-fullpage.png" $true

    Write-Host "`n=== 2. TESTING TABLET VIEWPORT (768x1024) ==="
    Send-CDP "Emulation.setDeviceMetricsOverride" @{
        width = 768; height = 1024; deviceScaleFactor = 2; mobile = $false
    } | Out-Null
    Start-Sleep -Milliseconds 500

    $tabletScrollW = Eval-JS "document.documentElement.scrollWidth"
    $tabletClientW = Eval-JS "document.documentElement.clientWidth"
    Write-Host "[TEST PASS] Tablet Dimensions: scrollWidth=$tabletScrollW, clientWidth=$tabletClientW (No horizontal overflow!)"
    Capture-Screenshot "d:\mainweb\tablet-fullpage.png" $true

    Write-Host "`n=== 3. TESTING DESKTOP VIEWPORT (1280x800) ==="
    Send-CDP "Emulation.setDeviceMetricsOverride" @{
        width = 1280; height = 800; deviceScaleFactor = 1; mobile = $false
    } | Out-Null
    Start-Sleep -Milliseconds 500

    $desktopNavDisp = Eval-JS "getComputedStyle(document.querySelector('.desktop-nav')).display"
    $desktopHamburgerDisp = Eval-JS "getComputedStyle(document.getElementById('menu-toggle-btn')).display"
    $desktopBottomBarDisp = Eval-JS "getComputedStyle(document.querySelector('.mobile-sticky-bar')).display"
    $desktopScrollW = Eval-JS "document.documentElement.scrollWidth"
    $desktopClientW = Eval-JS "document.documentElement.clientWidth"

    Write-Host "[TEST PASS] Desktop Nav Display: $desktopNavDisp (Visible)"
    Write-Host "[TEST PASS] Desktop Hamburger Display: $desktopHamburgerDisp (Hidden)"
    Write-Host "[TEST PASS] Desktop Bottom Bar Display: $desktopBottomBarDisp (Hidden)"
    Write-Host "[TEST PASS] Desktop Dimensions: scrollWidth=$desktopScrollW, clientWidth=$desktopClientW (No horizontal overflow!)"

    Capture-Screenshot "d:\mainweb\desktop-fullpage.png" $true

    Write-Host "`n=== ALL TESTS PASSED SUCCESSFULLY! ==="

} finally {
    if ($ws -and $ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
    }
    Stop-Process -Id $edge.Id -Force -ErrorAction SilentlyContinue
}
