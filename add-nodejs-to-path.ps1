# Run this as Administrator
$CurrentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
$NodePath = "C:\Program Files\nodejs"

if ($CurrentPath -like "*$NodePath*") {
    Write-Host "Node.js is already in PATH"
} else {
    [System.Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$NodePath", "Machine")
    Write-Host "Node.js added to PATH! Close and reopen PowerShell."
}
