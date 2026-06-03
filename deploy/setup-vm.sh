#!/bin/bash
# ============================================================
# 道德经 AI 平台 - Google Cloud VM 初始化脚本
# 在 Ubuntu 22.04 LTS 上运行
# ============================================================
set -euo pipefail

echo "=== 1. 系统更新 ==="
sudo apt-get update -y && sudo apt-get upgrade -y

echo "=== 2. 安装 Node.js 20.x ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node: $(node -v) | npm: $(npm -v)"

echo "=== 3. 安装 MySQL Server ==="
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

echo "=== 4. 安装 Nginx ==="
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "=== 5. 安装其他工具 ==="
sudo apt-get install -y git unzip

echo "=== 6. 创建数据库和用户 ==="
# 生成随机密码
DB_PASS=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32)
sudo mysql -e "
  CREATE DATABASE IF NOT EXISTS daodejing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'daodejing'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL PRIVILEGES ON daodejing_platform.* TO 'daodejing'@'localhost';
  FLUSH PRIVILEGES;
"
echo ""
echo "========================================="
echo "  数据库密码（请务必保存）: ${DB_PASS}"
echo "========================================="
echo ""

# 保存密码到临时文件供后续脚本使用
echo "${DB_PASS}" > /tmp/.daodejing_db_pass

echo "=== 7. 配置防火墙（UFW）==="
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

echo "=== 8. 创建应用目录 ==="
sudo mkdir -p /opt/daodejing
sudo chown $USER:$USER /opt/daodejing

echo ""
echo "✅ VM 初始化完成！"
echo "下一步: 上传项目文件到 /opt/daodejing，然后运行 deploy-app.sh"
