@echo off
REM Run this batch file as Administrator to add Node.js to PATH.
setx PATH "%PATH%;C:\Program Files\nodejs"
echo Node.js path updated. Close and reopen PowerShell, then run: node --version
pause
