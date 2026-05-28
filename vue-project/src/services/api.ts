const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface ApiOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
}

export async function apiClient<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (auth) {
    const token = getToken()
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { message: response.ok ? '' : `请求失败 (${response.status})` }

  if (!response.ok) {
    const msg = data.message || `请求失败 (${response.status})`
    if ((response.status === 403 || response.status === 401) && (msg.includes('禁用') || msg.includes('disabled'))) {
      removeToken()
      localStorage.removeItem('user')
      alert('您的账号已被管理员禁用，如有疑问请联系管理员。')
      window.location.href = '/'
      throw new Error(msg)
    }
    throw new Error(msg)
  }

  return data as T
}
