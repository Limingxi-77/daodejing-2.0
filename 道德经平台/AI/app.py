from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import sys
import importlib.util

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 加载配置文件
def load_config():
    try:
        # 动态导入config模块
        config_path = os.path.join(os.path.dirname(__file__), 'config.py')
        spec = importlib.util.spec_from_file_location("config", config_path)
        config_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(config_module)
        return config_module
    except Exception as e:
        print(f"配置文件加载失败: {e}")
        return None

# 获取配置
config = load_config()

# AI API配置 - 支持多个免费API提供商
AI_CONFIGS = []

# 根据配置文件更新API配置
if config:
    # DeepSeek配置
    if hasattr(config, 'DEEPSEEK_ENABLED') and config.DEEPSEEK_ENABLED and hasattr(config, 'DEEPSEEK_API_KEY'):
        AI_CONFIGS.append({
            'name': 'deepseek',
            'api_url': 'https://api.deepseek.com/v1/chat/completions',
            'model': 'deepseek-chat',
            'api_key': config.DEEPSEEK_API_KEY,
            'max_tokens': 1000,
            'enabled': True
        })
        print("✅ DeepSeek API已启用")
    
    # OpenRouter配置
    if hasattr(config, 'OPENROUTER_ENABLED') and config.OPENROUTER_ENABLED and hasattr(config, 'OPENROUTER_API_KEY'):
        AI_CONFIGS.append({
            'name': 'openrouter',
            'api_url': 'https://openrouter.ai/api/v1/chat/completions',
            'model': 'google/gemini-2.0-flash-lite-preview-02-05:free',
            'api_key': config.OPENROUTER_API_KEY,
            'max_tokens': 1000,
            'enabled': True
        })
        print("✅ OpenRouter API已启用")

    # 魔塔社区配置
    if hasattr(config, 'MOTAI_ENABLED') and config.MOTAI_ENABLED and hasattr(config, 'MOTAI_API_KEY'):
        AI_CONFIGS.append({
            'name': 'motai',
            'api_url': config.MOTAI_API_URL if hasattr(config, 'MOTAI_API_URL') else 'https://api.mo-tai.com/v1/chat/completions',
            'model': config.MOTAI_MODEL if hasattr(config, 'MOTAI_MODEL') else 'mo-tai-pro',
            'api_key': config.MOTAI_API_KEY,
            'max_tokens': 1000,
            'enabled': True
        })
        print("✅ 魔塔社区API已启用")
    
    # 阿里通义千问配置
    if hasattr(config, 'TONGYI_ENABLED') and config.TONGYI_ENABLED and hasattr(config, 'TONGYI_API_KEY'):
        AI_CONFIGS.append({
            'name': 'tongyi',
            'api_url': config.TONGYI_API_URL if hasattr(config, 'TONGYI_API_URL') else 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            'model': config.TONGYI_MODEL if hasattr(config, 'TONGYI_MODEL') else 'qwen-turbo',
            'api_key': config.TONGYI_API_KEY,
            'max_tokens': 1000,
            'enabled': True
        })
        print("✅ 通义千问API已启用")

# 如果没有配置任何API，使用默认配置（禁用状态）
if not AI_CONFIGS:
    AI_CONFIGS = [
        {
            'name': 'deepseek',
            'api_url': 'https://api.deepseek.com/v1/chat/completions',
            'model': 'deepseek-chat',
            'api_key': 'sk-',
            'max_tokens': 1000,
            'enabled': False
        },
        {
            'name': 'openrouter',
            'api_url': 'https://openrouter.ai/api/v1/chat/completions',
            'model': 'google/gemini-2.0-flash-lite-preview-02-05:free',
            'api_key': 'sk-or-v1-',
            'max_tokens': 1000,
            'enabled': False
        }
    ]
    print("⚠️  未启用任何API，将使用本地备用回答")

# 本地备用回答生成（当所有API都不可用时使用）
LOCAL_RESPONSES = [
    "这是一个很好的问题！基于我的理解：",
    "关于这个问题，我认为：",
    "让我来帮您分析这个问题：",
    "根据常见知识："
]

def generate_local_response(question):
    """生成本地备用回答"""
    import random
    import re
    
    # 简单的问题类型识别
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['什么', '什么是', '解释', '定义']):
        response = "这是一个关于概念解释的问题。"
    elif any(word in question_lower for word in ['如何', '怎样', '方法', '步骤']):
        response = "这是一个关于操作方法的问题。"
    elif any(word in question_lower for word in ['为什么', '原因', '为何']):
        response = "这是一个关于原因分析的问题。"
    else:
        response = "这是一个需要深入思考的问题。"
    
    # 添加随机开场白
    opener = random.choice(LOCAL_RESPONSES)
    
    return f"{opener} {response}\n\n由于AI服务配置问题，目前只能提供基础回答。请配置有效的API密钥以获得完整AI回答功能。"

@app.route('/api/ai/ask', methods=['POST'])
def ask_ai():
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': '问题不能为空'}), 400
        
        # 检查是否有可用的API配置
        enabled_apis = [config for config in AI_CONFIGS if config.get('enabled') and config.get('api_key') and len(config['api_key']) > 10]
        
        if not enabled_apis:
            # 没有可用的API配置，使用本地备用回答
            local_answer = generate_local_response(question)
            return jsonify({
                'answer': local_answer,
                'model': 'local-backup',
                'warning': '未配置有效的API密钥，使用本地备用回答'
            })
        
        # 尝试所有可用的API，直到有一个成功
        print(f"可用的API配置: {[config['name'] for config in enabled_apis]}")
        for ai_config in enabled_apis:
            try:
                print(f"尝试使用 {ai_config['name']} API...")
                
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {ai_config["api_key"]}',
                }
                
                # 添加特定的头部信息
                if ai_config['name'] == 'openrouter':
                    headers.update({
                        'HTTP-Referer': 'http://localhost:8000',
                        'X-Title': 'AI问答系统'
                    })
                elif ai_config['name'] == 'tongyi':
                    # 通义千问使用不同的认证方式
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {ai_config["api_key"]}',
                        'X-DashScope-Async': 'enable'
                    }
                
                # 根据不同的API提供商构建不同的payload
                if ai_config['name'] == 'tongyi':
                    # 通义千问使用OpenAI兼容格式
                    payload = {
                        'model': ai_config['model'],
                        'messages': [
                            {
                                'role': 'system',
                                'content': '你是一个 helpful assistant。请用中文回答用户的问题，回答要准确、详细、有帮助。'
                            },
                            {
                                'role': 'user',
                                'content': question
                            }
                        ],
                        'max_tokens': ai_config['max_tokens'],
                        'temperature': 0.7,
                        'stream': False
                    }
                else:
                    # 其他API的通用payload格式
                    payload = {
                        'model': ai_config['model'],
                        'messages': [
                            {
                                'role': 'system',
                                'content': '你是一个 helpful assistant。请用中文回答用户的问题，回答要准确、详细、有帮助。'
                            },
                            {
                                'role': 'user',
                                'content': question
                            }
                        ],
                        'max_tokens': ai_config['max_tokens'],
                        'temperature': 0.7,
                        'stream': False
                    }
                
                response = requests.post(
                    ai_config['api_url'],
                    headers=headers,
                    json=payload,
                    timeout=30  # 30秒超时
                )
                
                print(f"{ai_config['name']} API响应状态码: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"{ai_config['name']} API调用失败: {response.status_code} - {response.text}")
                    continue  # 尝试下一个API
                
                result = response.json()
                
                # 处理不同的API响应格式
                if ai_config['name'] == 'tongyi':
                    # 通义千问的响应格式
                    if 'output' in result and 'text' in result['output']:
                        answer = result['output']['text']
                    elif 'choices' in result and len(result['choices']) > 0:
                        answer = result['choices'][0]['message']['content']
                    else:
                        print(f"无法解析通义千问API响应格式: {result}")
                        continue  # 尝试下一个API
                elif 'choices' in result and len(result['choices']) > 0:
                    answer = result['choices'][0]['message']['content']
                elif 'output' in result:
                    answer = result['output']
                elif 'text' in result:
                    answer = result['text']
                else:
                    print(f"无法解析{ai_config['name']} API响应格式: {result}")
                    continue  # 尝试下一个API
                
                print(f"{ai_config['name']} API调用成功!")
                return jsonify({
                    'answer': answer,
                    'model': ai_config['model'],
                    'provider': ai_config['name']
                })
                
            except requests.exceptions.Timeout:
                print(f"{ai_config['name']} API请求超时")
                continue  # 尝试下一个API
            except requests.exceptions.ConnectionError:
                print(f"{ai_config['name']} API网络连接错误")
                continue  # 尝试下一个API
            except Exception as e:
                print(f"{ai_config['name']} API调用异常: {str(e)}")
                continue  # 尝试下一个API
        
        # 所有API都失败了，使用本地备用回答
        local_answer = generate_local_response(question)
        return jsonify({
            'answer': local_answer,
            'model': 'local-backup',
            'warning': '所有AI服务暂时不可用，使用本地备用回答'
        })
    
    except Exception as e:
        local_answer = generate_local_response(question)
        return jsonify({
            'answer': local_answer,
            'model': 'local-backup',
            'warning': f'服务器内部错误: {str(e)}'
        })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'AI问答后端'})

if __name__ == '__main__':
    print("启动AI问答后端服务...")
    print("服务地址: http://localhost:8000")
    print("API端点: http://localhost:8000/api/ai/ask")
    print("健康检查: http://localhost:8000/health")
    app.run(host='127.0.0.1', port=8000, debug=True)