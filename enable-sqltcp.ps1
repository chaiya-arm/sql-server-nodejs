# enable-sqltcp.ps1
# Enable SQL Server (SQLEXPRESS) TCP/IP, set static port 1433, restart service.
# Self-elevates to admin (a UAC prompt will appear -> click Yes).

$ErrorActionPreference = 'Stop'

# If not admin: relaunch self elevated, then exit this instance.
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Requesting Administrator rights... (click Yes on the UAC prompt)" -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    return
}

Write-Host "=== Configuring TCP/IP for SQLEXPRESS ===" -ForegroundColor Cyan
$tcp = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"

Set-ItemProperty -Path $tcp            -Name Enabled          -Value 1
Set-ItemProperty -Path "$tcp\IPAll"    -Name TcpPort          -Value "1433"
Set-ItemProperty -Path "$tcp\IPAll"    -Name TcpDynamicPorts  -Value ""
Write-Host "  - TCP/IP enabled, static port set to 1433" -ForegroundColor Green

Write-Host "=== Restarting SQL Server (SQLEXPRESS) ===" -ForegroundColor Cyan
Restart-Service 'MSSQL$SQLEXPRESS' -Force
Write-Host "  - Service restarted" -ForegroundColor Green

Start-Sleep -Seconds 2
$ok = (Test-NetConnection -ComputerName 127.0.0.1 -Port 1433 -WarningAction SilentlyContinue).TcpTestSucceeded
if ($ok) {
    Write-Host "`n*** SUCCESS! SQL Server is now listening on port 1433 ***" -ForegroundColor Green
} else {
    Write-Host "`n!!! Port 1433 not responding yet - re-run this script or tell Claude" -ForegroundColor Red
}
Write-Host "`nPress Enter to close this window..."
Read-Host
