#!/bin/bash

# Docker Hub 推送腳本
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定預設值
DOCKER_USERNAME=""
IMAGE_NAME="personal-finance-manager"
TAG=${2:-latest}

# 顯示使用方法
show_usage() {
    echo -e "${BLUE}使用方法:${NC}"
    echo -e "  $0 <docker-username> [tag]"
    echo -e ""
    echo -e "${BLUE}範例:${NC}"
    echo -e "  $0 your-username latest"
    echo -e "  $0 your-username v1.0.0"
    echo -e ""
    echo -e "${BLUE}說明:${NC}"
    echo -e "  docker-username: 你的 Docker Hub 用戶名"
    echo -e "  tag: 映像標籤 (預設: latest)"
}

# 檢查參數
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ 錯誤: 請提供 Docker Hub 用戶名${NC}"
    show_usage
    exit 1
fi

DOCKER_USERNAME=$1

echo -e "${BLUE}🐳 Docker Hub 推送設定${NC}"
echo -e "用戶名: ${YELLOW}${DOCKER_USERNAME}${NC}"
echo -e "映像名: ${YELLOW}${IMAGE_NAME}${NC}"
echo -e "標籤: ${YELLOW}${TAG}${NC}"
echo ""

# 檢查 Docker 是否可用
if ! sudo docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon 未運行或無權限${NC}"
    echo -e "${YELLOW}請執行以下步驟:${NC}"
    echo -e "1. sudo systemctl start docker"
    echo -e "2. sudo usermod -aG docker $USER"
    echo -e "3. 登出並重新登入"
    exit 1
fi

# 檢查是否已登入 Docker Hub
echo -e "${BLUE}🔐 檢查 Docker Hub 登入狀態...${NC}"
if ! sudo docker system info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️ 未登入 Docker Hub${NC}"
    echo -e "${BLUE}正在登入 Docker Hub...${NC}"
    
    # 提示登入
    echo -e "${YELLOW}請輸入你的 Docker Hub 密碼或存取令牌:${NC}"
    if ! sudo docker login --username "$DOCKER_USERNAME"; then
        echo -e "${RED}❌ Docker Hub 登入失敗${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 已登入 Docker Hub${NC}"
fi

# 建置映像
echo -e "\n${BLUE}🏗️ 建置 Docker 映像...${NC}"
cd ..  # 回到專案根目錄

if ! sudo docker build -f docker/Dockerfile -t "${IMAGE_NAME}:${TAG}" .; then
    echo -e "${RED}❌ 建置失敗${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 建置完成${NC}"

# 標記映像用於推送
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"
echo -e "\n${BLUE}🏷️ 標記映像: ${FULL_IMAGE_NAME}${NC}"

if ! sudo docker tag "${IMAGE_NAME}:${TAG}" "$FULL_IMAGE_NAME"; then
    echo -e "${RED}❌ 映像標記失敗${NC}"
    exit 1
fi

# 推送到 Docker Hub
echo -e "\n${BLUE}🚀 推送映像到 Docker Hub...${NC}"
echo -e "${YELLOW}這可能需要幾分鐘時間，請稍候...${NC}"

if ! sudo docker push "$FULL_IMAGE_NAME"; then
    echo -e "${RED}❌ 推送失敗${NC}"
    echo -e "${YELLOW}可能原因:${NC}"
    echo -e "1. 網路連線問題"
    echo -e "2. Docker Hub 權限不足"
    echo -e "3. 儲存庫不存在"
    exit 1
fi

echo -e "${GREEN}✅ 推送成功!${NC}"

# 顯示映像資訊
echo -e "\n${BLUE}📊 映像資訊:${NC}"
sudo docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# 提供使用指令
echo -e "\n${BLUE}🎯 使用指令:${NC}"
echo -e "${YELLOW}拉取映像:${NC}"
echo -e "  sudo docker pull $FULL_IMAGE_NAME"
echo -e ""
echo -e "${YELLOW}運行容器:${NC}"
echo -e "  sudo docker run -d --name finance-app -p 3000:3000 --env-file .env $FULL_IMAGE_NAME"
echo -e ""
echo -e "${YELLOW}使用 Docker Compose:${NC}"
echo -e "  # 在 docker-compose.yml 中使用:"
echo -e "  # image: $FULL_IMAGE_NAME"
echo -e ""
echo -e "${YELLOW}Docker Hub 連結:${NC}"
echo -e "  https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"

echo -e "\n${GREEN}🎉 Docker Hub 推送完成!${NC}"