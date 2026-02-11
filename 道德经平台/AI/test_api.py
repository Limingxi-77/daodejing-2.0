import requests
import json

# 测试DeepSeek API连接
DEEPSEEK_API_KEY = "sk-a19b67ee4188411d90d773b1cb3d0e69"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
}

payload = {
    'model': 'deepseek-chat',
    'messages': [
        {
            'role': 'system',
            'content': '你是一个 helpful assistant。请用中文回答用户的问题，回答要准确、详细、有帮助。'
        },
        {
            'role': 'user',
            'content': '你好，请简单介绍一下你自己'
        }
    ],
    'max_tokens': 100,
    'temperature': 0.7,
    'stream': False
}

print("正在测试DeepSeek API连接...")
print(f"API URL: {DEEPSEEK_API_URL}")
print(f"使用密钥: {DEEPSEEK_API_KEY[:10]}...")

try:
    response = requests.post(
        DEEPSEEK_API_URL,
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"\n响应状态码: {response.status_code}")
    print(f"响应内容: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        if 'choices' in result and len(result['choices']) > 0:
            answer = result['choices'][0]['message']['content']
            print(f"\n✅ API测试成功！")
            print(f"AI回答: {answer}")
        else:
            print("❌ API响应格式不正确")
            print(f"完整响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    else:
        print(f"❌ API请求失败: {response.status_code}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ 网络请求错误: {e}")
except Exception as e:
    print(f"❌ 其他错误: {e}")