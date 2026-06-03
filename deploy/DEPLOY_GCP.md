# 道德经 AI 平台 - Google Cloud 部署指南

## 前提条件

- Google Cloud 账号（有 2300 港币免费额度）
- 本项目源代码

---

## 第一步：安装 Google Cloud CLI

### Windows（推荐用 PowerShell）

```powershell
# 方法1：用官方安装包
# 访问 https://cloud.google.com/sdk/docs/install-sdk?hl=zh-cn
# 下载 Windows 安装包，双击安装

# 方法2：用 winget（如果有的话）
winget install Google.CloudSDK
```

### 安装后初始化

```bash
gcloud init
# 登录你的 Google 账号
# 选择或创建一个项目
```

---

## 第二步：创建 GCP 项目并启用计费

```bash
# 设置项目 ID（全局唯一，自己取一个）
export PROJECT_ID="daodejing-platform-$(date +%s)"
gcloud projects create $PROJECT_ID --name="道德经AI平台"

# 关联计费账号（免费额度会自动使用）
gcloud billing accounts list
# 找到你的计费账号 ID，类似 XXXXXX-XXXXXX-XXXXXX
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID

# 设置为当前项目
gcloud config set project $PROJECT_ID
```

---

## 第三步：创建 VM 实例

```bash
# 创建 e2-medium 实例（2 vCPU, 4GB RAM）
gcloud compute instances create daodejing-vm \
  --zone=asia-east2-a \
  --machine-type=e2-medium \
  --network-interface=network-tier=PREMIUM,subnet=default \
  --maintenance-policy=MIGRATE \
  --provisioning-model=STANDARD \
  --service-account=default \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --create-disk=auto-delete=yes,boot=yes,device-name=daodejing-vm,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts,mode=rw,size=20,type=projects/$PROJECT_ID/zones/asia-east2-a/diskTypes/pd-balanced \
  --no-shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --reservation-affinity=any

# 开放防火墙端口
gcloud compute firewall-rules create allow-http-https \
  --allow=tcp:80,tcp:443 \
  --target-tags=daodejing-vm \
  --description="Allow HTTP and HTTPS"
```

> **区域说明**: `asia-east2` 是香港区域，延迟最低。你也可以选 `asia-east1`（台湾）或 `asia-northeast1`（东京）。

---

## 第四步：上传项目文件

### 方法 A：用 gcloud 上传（推荐）

```bash
# 先在本地打包项目（排除 node_modules 等）
cd /path/to/daodejing-2.0-main
tar czf /tmp/daodejing-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='vue-project/node_modules' \
  --exclude='backend/node_modules' \
  --exclude='ppt-master' \
  --exclude='演示文档包' \
  --exclude='说明文档、脚本和PPT' \
  -C . .

# 上传到 VM
gcloud compute scp /tmp/daodejing-deploy.tar.gz daodejing-vm:/tmp/ --zone=asia-east2-a

# SSH 进入 VM
gcloud compute ssh daodejing-vm --zone=asia-east2-a
```

### 方法 B：用 Git 上传

```bash
# SSH 进入 VM 后
gcloud compute ssh daodejing-vm --zone=asia-east2-a

# 在 VM 上
sudo apt-get install -y git
git clone https://github.com/Limingxi-77/daodejing-2.0.git /opt/daodejing
```

---

## 第五步：在 VM 上部署

```bash
# SSH 进入 VM 后
gcloud compute ssh daodejing-vm --zone=asia-east2-a

# 如果是用 tar 上传的：
sudo mkdir -p /opt/daodejing
cd /opt/daodejing
sudo tar xzf /tmp/daodejing-deploy.tar.gz

# 运行初始化脚本
cd /opt/daodejing/deploy
chmod +x setup-vm.sh deploy-app.sh
sudo bash setup-vm.sh

# ⚠️ 记下输出的数据库密码！

# 运行部署脚本
bash deploy-app.sh
```

---

## 第六步：配置 DeepSeek API Key

```bash
# 编辑后端 .env
sudo nano /opt/daodejing/backend/.env

# 找到这行：
# DEEPSEEK_API_KEY=YOUR_DEEPSEEK_KEY_HERE
# 替换为你的真实 Key

# 重启后端服务
sudo systemctl restart daodejing-backend
```

---

## 第七步：验证部署

```bash
# 获取 VM 外部 IP
EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" \
  http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
echo "访问地址: http://$EXTERNAL_IP"

# 检查后端健康
curl http://localhost:8000/api/health

# 检查后端服务状态
sudo systemctl status daodejing-backend

# 查看后端日志
sudo journalctl -u daodejing-backend -f
```

---

## 常用运维命令

```bash
# 查看后端日志
sudo journalctl -u daodejing-backend -f --lines=100

# 重启后端
sudo systemctl restart daodejing-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查 MySQL 状态
sudo systemctl status mysql
```

---

## 预估费用

| 资源 | 规格 | 月费用 (USD) | 20天费用 |
|------|------|-------------|---------|
| Compute Engine | e2-medium (2 vCPU, 4GB) | ~$24.5 | ~$16.3 |
| SSD 磁盘 | 20GB | ~$3.4 | ~$2.3 |
| 网络流量 | 1GB 出站 | ~$0.12 | ~$0.08 |
| **合计** | | **~$28** | **~$19** |

> 2300 港币 ≈ 295 USD，完全够用。

---

## 可选：绑定域名 + HTTPS

如果有域名，可以用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 清理资源（避免持续计费）

部署完成后如果不再需要，记得删除资源：

```bash
# 删除 VM
gcloud compute instances delete daodejing-vm --zone=asia-east2-a

# 或者直接删除整个项目
gcloud projects delete $PROJECT_ID
```
