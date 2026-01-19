# Script para probar el build de Docker localmente antes de Coolify
# Este script simula lo que Coolify hará en producción

Write-Host "🐳 Prueba de Build Docker para Coolify" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker detectado" -ForegroundColor Green

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Advertencia: No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "Crea un archivo .env basado en .env.example para pruebas locales" -ForegroundColor Yellow
    Write-Host ""
}

# Limpiar contenedores e imágenes anteriores
Write-Host "🧹 Limpiando builds anteriores..." -ForegroundColor Yellow
docker stop fashionstore-test 2>$null
docker rm fashionstore-test 2>$null
docker rmi fashionstore:test 2>$null

Write-Host ""
Write-Host "📦 Construyendo imagen Docker..." -ForegroundColor Cyan
Write-Host "Esto puede tardar varios minutos la primera vez..." -ForegroundColor Gray
Write-Host ""

# Build de la imagen
$buildStart = Get-Date
docker build -t fashionstore:test .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el build de Docker" -ForegroundColor Red
    Write-Host "Revisa los mensajes de error arriba" -ForegroundColor Yellow
    exit 1
}

$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds

Write-Host ""
Write-Host "✅ Build completado en $([math]::Round($buildTime, 2)) segundos" -ForegroundColor Green
Write-Host ""

# Preguntar si se quiere ejecutar el contenedor
$runContainer = Read-Host "¿Quieres ejecutar el contenedor para probarlo? (s/n)"

if ($runContainer -eq "s" -or $runContainer -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando contenedor..." -ForegroundColor Cyan
    Write-Host ""
    
    # Leer variables de entorno desde .env si existe
    $envArgs = @()
    if (Test-Path ".env") {
        Write-Host "📋 Cargando variables de entorno desde .env..." -ForegroundColor Gray
        Get-Content .env | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $envArgs += "-e"
                $envArgs += "$($matches[1])=$($matches[2])"
            }
        }
    } else {
        Write-Host "⚠️  No se encontró .env, usando variables por defecto" -ForegroundColor Yellow
        $envArgs = @(
            "-e", "NODE_ENV=production",
            "-e", "HOST=0.0.0.0",
            "-e", "PORT=3000",
            "-e", "PUBLIC_SITE_URL=http://localhost:3000"
        )
    }
    
    # Ejecutar contenedor
    docker run -d `
        --name fashionstore-test `
        -p 3000:3000 `
        @envArgs `
        fashionstore:test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Error al iniciar el contenedor" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Contenedor iniciado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Información:" -ForegroundColor Cyan
    Write-Host "   - URL: http://localhost:3000" -ForegroundColor White
    Write-Host "   - Health Check: http://localhost:3000/health" -ForegroundColor White
    Write-Host "   - Contenedor: fashionstore-test" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
    Write-Host "   Ver logs:    docker logs -f fashionstore-test" -ForegroundColor Gray
    Write-Host "   Detener:     docker stop fashionstore-test" -ForegroundColor Gray
    Write-Host "   Eliminar:    docker rm fashionstore-test" -ForegroundColor Gray
    Write-Host "   Entrar:      docker exec -it fashionstore-test sh" -ForegroundColor Gray
    Write-Host ""
    
    # Esperar un momento y verificar estado
    Write-Host "⏳ Esperando que el contenedor inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    $status = docker ps --filter "name=fashionstore-test" --format "{{.Status}}"
    if ($status) {
        Write-Host "✅ Estado del contenedor: $status" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Abre tu navegador en: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  El contenedor puede haber fallado. Revisa los logs:" -ForegroundColor Yellow
        Write-Host "   docker logs fashionstore-test" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "✅ Build completado. No se inició el contenedor." -ForegroundColor Green
    Write-Host ""
    Write-Host "Para ejecutarlo manualmente:" -ForegroundColor Cyan
    Write-Host "   docker run -d -p 3000:3000 --env-file .env fashionstore:test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 ¡Proceso completado!" -ForegroundColor Green
Write-Host ""
