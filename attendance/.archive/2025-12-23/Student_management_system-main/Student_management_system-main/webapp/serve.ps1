# Simple HTTP Server in PowerShell
# Serves web app frontend on http://localhost:8000

param(
    [int]$Port = 8000,
    [string]$Path = "."
)

$listener = New-Object Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Web App Server Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:$Port/" -ForegroundColor Yellow
Write-Host "Serving from: $(Resolve-Path $Path)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop..." -ForegroundColor Cyan
Write-Host ""

while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $urlPath = $request.RawUrl -replace '/', '\'
    if ($urlPath -eq '\') {
        $urlPath = '\index.html'
    }
    
    $filePath = Join-Path $Path $urlPath
    
    # Security: prevent directory traversal
    $fullPath = Resolve-Path $filePath -ErrorAction SilentlyContinue
    $basePath = Resolve-Path $Path -ErrorAction SilentlyContinue
    
    if ($fullPath -and $fullPath.Path.StartsWith($basePath.Path)) {
        if (Test-Path $filePath) {
            $file = Get-Item $filePath
            if ($file.PSIsContainer) {
                # Try index.html in directory
                $indexPath = Join-Path $filePath "index.html"
                if (Test-Path $indexPath) {
                    $filePath = $indexPath
                } else {
                    $response.StatusCode = 404
                    $content = "Directory listing not allowed"
                }
            }
            
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.StatusCode = 200
                
                # Set content type based on file extension
                $ext = [System.IO.Path]::GetExtension($filePath)
                $contentTypes = @{
                    '.html' = 'text/html; charset=utf-8'
                    '.css'  = 'text/css; charset=utf-8'
                    '.js'   = 'application/javascript; charset=utf-8'
                    '.json' = 'application/json'
                    '.png'  = 'image/png'
                    '.jpg'  = 'image/jpeg'
                    '.gif'  = 'image/gif'
                    '.svg'  = 'image/svg+xml'
                    '.woff' = 'font/woff'
                    '.woff2'= 'font/woff2'
                    '.ttf'  = 'font/ttf'
                    '.eot'  = 'application/vnd.ms-fontobject'
                }
                
                $response.ContentType = $contentTypes[$ext] ?? 'application/octet-stream'
                $response.OutputStream.Write($content, 0, $content.Length)
            }
        } else {
            $response.StatusCode = 404
            $content = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($content, 0, $content.Length)
        }
    } else {
        $response.StatusCode = 403
        $content = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
        $response.OutputStream.Write($content, 0, $content.Length)
    }
    
    $response.Close()
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $($request.HttpMethod) $($request.RawUrl) -> $($response.StatusCode)" -ForegroundColor Cyan
}
