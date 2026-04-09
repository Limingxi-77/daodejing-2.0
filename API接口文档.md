# 《道德经》AI互动解读者平台API实现代码

## 一、项目结构

```
daoism-api/
├── config/                 # 配置文件
│   ├── database.js         # 数据库配置
│   ├── app.js              # 应用配置
│   └── env.js              # 环境变量
├── controllers/            # 控制器
│   ├── userController.js
│   ├── conversationController.js
│   ├── interpretationController.js
│   ├── knowledgeGraphController.js
│   ├── contributionController.js
│   └── adminController.js
├── middleware/             # 中间件
│   ├── auth.js             # 认证中间件
│   ├── errorHandler.js     # 错误处理
│   ├── rateLimiter.js      # 限流
│   └── validator.js        # 请求验证
├── models/                 # 数据模型
│   ├── index.js            # 模型入口
│   ├── user.js
│   ├── conversation.js
│   └── ...
├── routes/                 # 路由
│   ├── index.js            # 路由入口
│   ├── userRoutes.js
│   ├── conversationRoutes.js
│   └── ...
├── services/               # 服务层
│   ├── userService.js
│   ├── aiService.js
│   └── ...
├── utils/                  # 工具函数
│   ├── logger.js
│   ├── apiResponse.js
│   └── ...
├── app.js                  # 应用入口
├── server.js               # 服务启动
└── package.json
```

## 二、核心配置

### 应用入口 (app.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { sequelize } = require('./models');

// 初始化应用
const app = express();

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(express.json()); // JSON解析
app.use(morgan('dev')); // 日志

// 路由
app.use('/api/v1', routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理
app.use(errorHandler);

// 数据库连接测试
sequelize.authenticate()
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

module.exports = app;
```

### 数据库配置 (config/database.js)

```javascript
const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    dialect: 'mysql',
    port: env.DB_PORT,
    logging: env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+08:00'
  }
);

module.exports = sequelize;
```

## 三、核心中间件

### 认证中间件 (middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');

// 验证JWT令牌
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        code: 401, 
        message: '未提供认证令牌' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        code: 401, 
        message: '用户不存在' 
      });
    }
    
    // 将用户信息添加到请求
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        code: 401, 
        message: '令牌已过期' 
      });
    }
    
    return res.status(401).json({ 
      code: 401, 
      message: '认证失败' 
    });
  }
};

// 角色权限验证
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未认证' 
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        code: 403, 
        message: '权限不足' 
      });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };
```

## 四、数据模型示例

### 用户模型 (models/user.js)

```javascript
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'user_id'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    fullName: {
      type: DataTypes.STRING(100),
      field: 'full_name'
    },
    role: {
      type: DataTypes.ENUM('anonymous', 'user', 'contributor', 'moderator', 'admin'),
      defaultValue: 'user'
    },
    avatarUrl: {
      type: DataTypes.STRING(255),
      field: 'avatar_url'
    },
    bio: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // 密码加密
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      }
    }
  });

  // 实例方法：验证密码
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  // 关联关系
  User.associate = (models) => {
    User.hasMany(models.Conversation, { foreignKey: 'user_id' });
    User.hasMany(models.UserContribution, { foreignKey: 'user_id' });
    User.hasOne(models.UserPreference, { foreignKey: 'user_id' });
  };

  return User;
};
```

## 五、控制器示例

### 用户控制器 (controllers/userController.js)

```javascript
const { User, UserPreference } = require('../models');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { Op } = require('sequelize');

// 用户注册
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: '用户名或邮箱已存在'
      });
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      passwordHash: password,
      fullName
    });
    
    // 创建用户偏好
    await UserPreference.create({
      userId: user.userId
    });
    
    // 生成JWT
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    // 生成刷新令牌
    const refreshToken = jwt.sign(
      { userId: user.userId },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      code: 201,
      message: '用户注册成功',
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// 用户登录
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({
      where: { 
        [Op.or]: [
          { username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 更新最后登录时间
    await user.update({ lastLoginAt: new Date() });
    
    // 生成令牌
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.userId },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        token,
        refreshToken,
        expiresIn: 7200
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户资料
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { 
        exclude: ['passwordHash', 'status'] 
      },
      include: [
        {
          model: UserPreference,
          attributes: ['notificationEnabled', 'defaultInterpretType', 'theme', 'language']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
```

## 六、路由配置

### 主路由文件 (routes/index.js)

```javascript
const express = require('express');
const router = express.Router();

// 导入路由模块
const userRoutes = require('./userRoutes');
const conversationRoutes = require('./conversationRoutes');
const interpretationRoutes = require('./interpretationRoutes');
const knowledgeGraphRoutes = require('./knowledgeGraphRoutes');
const contributionRoutes = require('./contributionRoutes');
const adminRoutes = require('./adminRoutes');

// 挂载路由
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/interpretations', interpretationRoutes);
router.use('/knowledge-graph', knowledgeGraphRoutes);
router.use('/contributions', contributionRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
```

### 用户路由 (routes/userRoutes.js)

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validator');

// 公开路由
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/refresh-token', userController.refreshToken);

// 需认证路由
router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);
router.get('/preferences', authenticate, userController.getPreferences);
router.patch('/preferences', authenticate, userController.updatePreferences);

// 管理员路由
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
router.patch('/:userId/permissions', authenticate, authorize(['admin']), userController.updatePermissions);

module.exports = router;
```

## 七、服务层示例

### AI解读服务 (services/interpretationService.js)

```javascript
const { Interpretation, InterpretationVisualization } = require('../models');
const { v4: uuidv4 } = require('uuid');
const aiClient = require('../clients/aiClient'); // AI服务客户端
const visualizationService = require('./visualizationService');

// 创建解读
const createInterpretation = async (userId, params) => {
  const { sourceType, sourceId, interpretType, depth, targetAudience } = params;
  
  // 获取原始文本
  let sourceContent = '';
  if (sourceType === 'chapter') {
    // 从章节获取内容
    sourceContent = await getChapterContent(sourceId);
  } else if (sourceType === 'concept') {
    // 从概念获取内容
    sourceContent = await getConceptDefinition(sourceId);
  } else {
    sourceContent = params.sourceContent;
  }
  
  // 调用AI生成解读
  const aiResponse = await aiClient.generateInterpretation({
    content: sourceContent,
    type: interpretType,
    depth,
    audience: targetAudience
  });
  
  // 保存解读记录
  const interpretation = await Interpretation.create({
    interpretationId: uuidv4(),
    userId,
    sourceType,
    sourceId,
    sourceContent,
    interpretType,
    depth,
    targetAudience,
    summary: aiResponse.summary,
    keyPoints: aiResponse.keyPoints,
    visualizationAvailable: aiResponse.visualizationAvailable
  });
  
  // 如果需要可视化，生成可视化内容
  if (aiResponse.visualizationAvailable) {
    await visualizationService.generateVisualization(
      interpretation.interpretationId,
      'concept_map',
      aiResponse.keyPoints
    );
  }
  
  return interpretation;
};

// 获取章节内容
const getChapterContent = async (chapterNumber) => {
  // 实现获取章节内容逻辑
};

// 获取概念定义
const getConceptDefinition = async (conceptId) => {
  // 实现获取概念定义逻辑
};

module.exports = {
  createInterpretation,
  getInterpretationById,
  getInterpretationVisualization
};
```

## 八、依赖配置

### package.json

```json
{
  "name": "daoism-api",
  "version": "1.0.0",
  "description": "《道德经》AI互动解读者API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "sequelize-cli db:migrate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.1",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1",
    "rate-limiter-flexible": "^2.4.1",
    "uuid": "^9.0.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3"
  }
}
```