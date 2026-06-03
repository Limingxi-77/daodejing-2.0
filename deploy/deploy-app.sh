#!/bin/bash
# ============================================================
# 道德经 AI 平台 - 应用部署脚本
# 在 VM 初始化后运行，将项目部署到 /opt/daodejing
# ============================================================
set -euo pipefail

APP_DIR="/opt/daodejing"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- 读取数据库密码 ---
if [ -f /tmp/.daodejing_db_pass ]; then
  DB_PASS=$(cat /tmp/.daodejing_db_pass)
else
  echo "请输入数据库密码（setup-vm.sh 生成的那个）:"
  read -s DB_PASS
fi

echo "=== 1. 同步项目文件 ==="
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'vue-project/node_modules' \
  --exclude 'backend/node_modules' \
  --exclude '.env' \
  --exclude 'ppt-master' \
  --exclude '演示文档包' \
  --exclude '说明文档、脚本和PPT' \
  --exclude 'uploads/art' \
  --exclude 'uploads/avatars/pending' \
  "$DEPLOY_DIR/../" "$APP_DIR/"

echo "=== 2. 生成生产环境密钥 ==="
JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)
ADMIN_JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)
HADMIN_TOKEN=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -dc 'A-Za-z0-9' | head -c 16)

echo "=== 3. 写入后端 .env ==="
# 获取 VM 外部 IP
EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip 2>/dev/null || echo "YOUR_VM_IP")

cat > "$APP_DIR/backend/.env" << EOF
# === 生产环境配置 - 自动生成 ===
PORT=8000
NODE_ENV=production
CORS_ORIGIN=http://${EXTERNAL_IP}

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=daodejing
MYSQL_PASSWORD=${DB_PASS}
MYSQL_DATABASE=daodejing_platform

# JWT（已自动生成强密钥）
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
ADMIN_JWT_EXPIRES_IN=8h
HADMIN_INTERNAL_TOKEN=${HADMIN_TOKEN}

# 管理员账号（首次启动自动创建）
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=${ADMIN_PASSWORD}

# AI 服务（请替换为你的真实 Key）
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY_HERE

# 安全配置
RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=120
AI_RATE_LIMIT_MAX=30
TTS_RATE_LIMIT_MAX=20
LOGIN_RATE_LIMIT_MAX=10
LOGIN_FAILURE_LIMIT=5
LOGIN_LOCK_MS=900000
ENABLE_ACCESS_LOGS=true
SECURITY_STATE_DRIVER=mysql
EOF

echo "=== 4. 写入前端 .env ==="
cat > "$APP_DIR/vue-project/.env" << EOF
VITE_API_URL=http://${EXTERNAL_IP}
VITE_APP_NAME=道德经AI平台
VITE_APP_VERSION=2.0.0
EOF

echo "=== 5. 安装后端依赖 ==="
cd "$APP_DIR/backend"
npm install --omit=dev

echo "=== 6. 安装前端依赖并构建 ==="
cd "$APP_DIR/vue-project"
npm install
npm run build

echo "=== 7. 部署前端静态文件 ==="
sudo rm -rf /var/www/daodejing
sudo mkdir -p /var/www/daodejing
sudo cp -r "$APP_DIR/vue-project/dist/"* /var/www/daodejing/
# 复制 admin 静态文件
sudo mkdir -p /var/www/daodejing/hadmin
sudo cp -r "$APP_DIR/admin/hadmin/"* /var/www/daodejing/hadmin/ 2>/dev/null || true

echo "=== 8. 配置 Nginx ==="
sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/daodejing
sudo sed -i "s/YOUR_VM_IP/${EXTERNAL_IP}/g" /etc/nginx/sites-available/daodejing
sudo ln -sf /etc/nginx/sites-available/daodejing /etc/nginx/sites-enabled/daodejing
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 9. 配置 systemd 服务 ==="
sudo cp "$DEPLOY_DIR/daodejing-backend.service" /etc/systemd/system/
sudo sed -i "s|/opt/daodejing|${APP_DIR}|g" /etc/systemd/system/daodejing-backend.service
sudo systemctl daemon-reload
sudo systemctl enable daodejing-backend
sudo systemctl start daodejing-backend

echo "=== 10. 运行数据库迁移 ==="
sleep 3  # 等待后端启动
cd "$APP_DIR/backend"
node scripts/migrate.js || echo "迁移可能已执行过，继续..."

echo ""
echo "========================================================="
echo "  ✅ 部署完成！"
echo ""
echo "  🌐 前端地址: http://${EXTERNAL_IP}"
echo "  🔧 后端 API:  http://${EXTERNAL_IP}/api"
echo "  📊 管理后台:  http://${EXTERNAL_IP}/hadmin/login.html"
echo ""
echo "  管理员账号: admin"
echo "  管理员密码: ${ADMIN_PASSWORD}"
echo ""
echo "  ⚠️  请务必："
echo "  1. 保存以上管理员密码"
echo "  2. 编辑 /opt/daodejing/backend/.env"
echo "     替换 DEEPSEEK_API_KEY 为你的真实 Key"
echo "  3. 重启后端: sudo systemctl restart daodejing-backend"
echo "========================================================="
