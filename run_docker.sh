#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 开始部署 EastMoney 智能终端 ===${NC}"

# 1. 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "Docker 未安装，请先安装 Docker。"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose 未安装，请先安装。"
    exit 1
fi

# 2. 确保必要的目录结构存在
echo -e "${GREEN}--> 检查并创建目录结构...${NC}"
mkdir -p reports/commodities
mkdir -p reports/sentiment
mkdir -p config
mkdir -p data

# 3. 初始化数据库文件（避免 Docker 创建为目录）
if [ ! -f "data/funds.db" ]; then
    if [ -d "data/funds.db" ]; then
        echo "Removing erroneous directory 'data/funds.db'..."
        rm -rf data/funds.db
    fi
    echo "Creating empty database file in data/funds.db..."
    touch data/funds.db
fi

# 清理旧的根目录 funds.db（如果存在且不再使用）
if [ -e "funds.db" ]; then
    echo "Note: Legacy 'funds.db' found in root. Migration to 'data/funds.db' is handled by volume mapping if you manually moved data."
    # Optional: mv funds.db data/funds.db if data/funds.db is empty
fi

# 4. 构建并启动容器
echo -e "${GREEN}--> 构建并启动容器...${NC}"
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# 5. 显示状态
echo -e "${GREEN}--> 部署完成！容器状态：${NC}"
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo -e "${GREEN}=== 服务已上线 ===${NC}"
echo "域名访问: http://valpha.luminaBrain.cn"
