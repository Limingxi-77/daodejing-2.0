"""
AI问答系统配置文件
用户可以在这里配置自己的API密钥
"""

# 在这里配置您的API密钥
# 获取免费API密钥的网站：
# 1. OpenRouter: https://openrouter.ai/keys
# 2. DeepSeek: https://platform.deepseek.com/
# 3. 魔塔社区: https://www.mo-tai.com/

# DeepSeek API配置
DEEPSEEK_API_KEY = "sk-a19b67ee4188411d90d773b1cb3d0e69"  # 替换为您的DeepSeek API密钥
DEEPSEEK_ENABLED = True  # 设置为True启用DeepSeek

# OpenRouter API配置  
OPENROUTER_API_KEY = "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"  # 替换为您的OpenRouter API密钥
OPENROUTER_ENABLED = True  # 设置为True启用OpenRouter

# 魔塔社区API配置
MOTAI_API_KEY = "ms-235b324b-d104-4015-ad3d-b2ed1c78a10f"  # 请在此处填写您的魔塔社区API密钥
MOTAI_API_URL = "https://api.mo-tai.com/v1/chat/completions"  # 魔塔社区API地址
MOTAI_MODEL = "mo-tai-pro"  # 魔塔社区模型名称
MOTAI_ENABLED = False  # 设置为False禁用魔塔社区API

# 阿里通义千问API配置
TONGYI_API_KEY = "sk-5914a6a943a74c788b6ef5e0a3bfe8bf"  # 请在此处填写您的通义千问API密钥
TONGYI_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"  # 通义千问API地址（OpenAI兼容模式）
TONGYI_MODEL = "qwen-turbo"  # 通义千问模型名称
TONGYI_ENABLED = True  # 设置为True启用通义千问API

# 本地服务器配置
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 5000
SERVER_DEBUG = True