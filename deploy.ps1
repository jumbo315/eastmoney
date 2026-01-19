# 构建和部署脚本 (Windows PowerShell)

$ErrorActionPreference = "Stop"

$IMAGE_NAME = "eastmoney-app"
$IMAGE_TAG = "latest"
$CONTAINER_NAME = "eastmoney-container"
$PORT = "9000"

Write-Host "🚀 开始构建 Docker 镜像..." -ForegroundColor Green
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

Write-Host "✅ 镜像构建完成!" -ForegroundColor Green

Write-Host "🛑 停止并删除旧容器..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null

Write-Host "🎯 启动新容器..." -ForegroundColor Green
$currentPath = (Get-Location).Path
docker run -d `
  --name $CONTAINER_NAME `
  -p "${PORT}:9000" `
  -v "${currentPath}/data:/app/data" `
  -v "${currentPath}/reports:/app/reports" `
  -v "${currentPath}/config:/app/config" `
  -v "${currentPath}/.env:/app/.env" `
  -e TZ=Asia/Shanghai `
  --restart unless-stopped `
  ${IMAGE_NAME}:${IMAGE_TAG}

Write-Host "✅ 容器已启动!" -ForegroundColor Green
Write-Host "📍 访问地址: http://localhost:${PORT}" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 查看日志: docker logs -f ${CONTAINER_NAME}" -ForegroundColor Gray
Write-Host "🔍 查看状态: docker ps | Select-String ${CONTAINER_NAME}" -ForegroundColor Gray
