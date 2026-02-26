# PowerShell script to install dependencies for all services and client

$services = @("api-gateway", "auth-service", "book-service", "config-server", "my-app")

foreach ($service in $services) {
    Write-Host "Installing dependencies for $service..."
    Set-Location "$PSScriptRoot\$service"
    npm install
    Set-Location $PSScriptRoot
}

Write-Host "All installations completed."