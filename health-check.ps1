$ErrorActionPreference = 'Stop'

function Write-Step {
  param(
    [string]$Message
  )
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Pass {
  param(
    [string]$Message
  )
  Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Warn {
  param(
    [string]$Message
  )
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
  param(
    [string]$Message
  )
  Write-Host "[FAIL] $Message" -ForegroundColor Red
}

$hadFailure = $false

Write-Step "Checking required files"
$requiredFiles = @(
  'package.json',
  'vite.config.js',
  'index.html',
  'styles.css',
  'app.js'
)

foreach ($file in $requiredFiles) {
  if (Test-Path $file) {
    Write-Pass "$file found"
  }
  else {
    Write-Fail "$file missing"
    $hadFailure = $true
  }
}

Write-Step "Checking Node and npm"
try {
  $nodeVersion = node --version
  $npmVersion = npm --version
  Write-Pass "Node: $nodeVersion"
  Write-Pass "npm: $npmVersion"
}
catch {
  Write-Fail "Node or npm is not available in PATH"
  $hadFailure = $true
}

Write-Step "Running production build"
try {
  npm run build | Out-Host
  if ($LASTEXITCODE -eq 0) {
    Write-Pass "Build completed"
  }
  else {
    Write-Fail "Build failed with exit code $LASTEXITCODE"
    $hadFailure = $true
  }
}
catch {
  Write-Fail "Build command failed to execute"
  $hadFailure = $true
}

Write-Step "Checking local hostname resolution"
try {
  $addresses = [System.Net.Dns]::GetHostAddresses('sasquatchwilderness') | Select-Object -ExpandProperty IPAddressToString
  if ($addresses.Count -gt 0) {
    Write-Pass "sasquatchwilderness resolves to: $($addresses -join ', ')"
  }
  else {
    Write-Warn "sasquatchwilderness resolved with no addresses"
  }
}
catch {
  Write-Warn "Could not resolve sasquatchwilderness. Check your hosts file setup."
}

Write-Step "Checking local HTTPS endpoint"
try {
  $response = Invoke-WebRequest -Uri 'https://sasquatchwilderness/' -UseBasicParsing -TimeoutSec 8
  if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
    Write-Pass "https://sasquatchwilderness/ reachable (HTTP $($response.StatusCode))"
  }
  else {
    Write-Warn "https://sasquatchwilderness/ returned HTTP $($response.StatusCode)"
  }
}
catch {
  Write-Warn "Could not reach https://sasquatchwilderness/. Start the dev server with npm run dev before this check."
}

Write-Step "Done"
if ($hadFailure) {
  Write-Host "Health check completed with failures." -ForegroundColor Red
  exit 1
}

Write-Host "Health check completed successfully." -ForegroundColor Green
exit 0
