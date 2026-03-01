# PowerShell script to start dev servers for all services and client

$serviceCommands = @{
    "api-gateway" = "npm run dev"
    "auth-service" = "npm run dev"
    "book-service" = "npm run dev"
    "config-server" = "npm run dev"
    "my-app" = "npm run dev"
}

foreach ($service in $serviceCommands.Keys) {
    Write-Host "Starting dev server for $service..."
    $command = "cd '$PSScriptRoot\$service'; $($serviceCommands[$service])"
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $command
}

Write-Host "All dev servers started in separate windows."