#!/bin/bash

# Script para probar el build de Docker localmente antes de Coolify
# Este script simula lo que Coolify hará en producción

echo "🐳 Prueba de Build Docker para Coolify"
echo "======================================"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado o no está en el PATH"
    echo "Instala Docker desde: https://www.docker.com/get-docker"
    exit 1
fi

echo "✅ Docker detectado"

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró archivo .env"
    echo "Crea un archivo .env basado en .env.example para pruebas locales"
    echo ""
fi

# Limpiar contenedores e imágenes anteriores
echo "🧹 Limpiando builds anteriores..."
docker stop fashionstore-test 2>/dev/null
docker rm fashionstore-test 2>/dev/null
docker rmi fashionstore:test 2>/dev/null

echo ""
echo "📦 Construyendo imagen Docker..."
echo "Esto puede tardar varios minutos la primera vez..."
echo ""

# Build de la imagen
build_start=$(date +%s)
docker build -t fashionstore:test .

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error en el build de Docker"
    echo "Revisa los mensajes de error arriba"
    exit 1
fi

build_end=$(date +%s)
build_time=$((build_end - build_start))

echo ""
echo "✅ Build completado en $build_time segundos"
echo ""

# Preguntar si se quiere ejecutar el contenedor
read -p "¿Quieres ejecutar el contenedor para probarlo? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo ""
    echo "🚀 Iniciando contenedor..."
    echo ""
    
    # Ejecutar contenedor
    if [ -f ".env" ]; then
        echo "📋 Cargando variables de entorno desde .env..."
        docker run -d \
            --name fashionstore-test \
            -p 3000:3000 \
            --env-file .env \
            fashionstore:test
    else
        echo "⚠️  No se encontró .env, usando variables por defecto"
        docker run -d \
            --name fashionstore-test \
            -p 3000:3000 \
            -e NODE_ENV=production \
            -e HOST=0.0.0.0 \
            -e PORT=3000 \
            -e PUBLIC_SITE_URL=http://localhost:3000 \
            fashionstore:test
    fi
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Error al iniciar el contenedor"
        exit 1
    fi
    
    echo ""
    echo "✅ Contenedor iniciado correctamente"
    echo ""
    echo "📊 Información:"
    echo "   - URL: http://localhost:3000"
    echo "   - Health Check: http://localhost:3000/health"
    echo "   - Contenedor: fashionstore-test"
    echo ""
    echo "📝 Comandos útiles:"
    echo "   Ver logs:    docker logs -f fashionstore-test"
    echo "   Detener:     docker stop fashionstore-test"
    echo "   Eliminar:    docker rm fashionstore-test"
    echo "   Entrar:      docker exec -it fashionstore-test sh"
    echo ""
    
    # Esperar un momento y verificar estado
    echo "⏳ Esperando que el contenedor inicie..."
    sleep 5
    
    status=$(docker ps --filter "name=fashionstore-test" --format "{{.Status}}")
    if [ -n "$status" ]; then
        echo "✅ Estado del contenedor: $status"
        echo ""
        echo "🌐 Abre tu navegador en: http://localhost:3000"
    else
        echo "⚠️  El contenedor puede haber fallado. Revisa los logs:"
        echo "   docker logs fashionstore-test"
    fi
else
    echo ""
    echo "✅ Build completado. No se inició el contenedor."
    echo ""
    echo "Para ejecutarlo manualmente:"
    echo "   docker run -d -p 3000:3000 --env-file .env fashionstore:test"
fi

echo ""
echo "🎉 ¡Proceso completado!"
echo ""
