# PowerShell script to start dev servers for all services and client

$services = @("api-gateway", "auth-service", "book-service", "config-server", "my-app")

foreach ($service in $services) {
    Write-Host "Starting dev server for $service..."
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\$service'; npm run dev"
}

Write-Host "All dev servers started in separate windows."