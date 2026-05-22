require('dotenv').config()

const profile = String(process.argv[2] || process.env.SMOKE_PROFILE || 'basic').trim().toLowerCase()
const baseUrl = (process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8000}`).replace(/\/$/, '')
const userEmail = process.env.SMOKE_USER_EMAIL || ''
const userPassword = process.env.SMOKE_USER_PASSWORD || ''
const adminUsername = process.env.SMOKE_ADMIN_USERNAME || process.env.ADMIN_BOOTSTRAP_USERNAME || ''
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD || ''
const hadminToken = process.env.SMOKE_HADMIN_TOKEN || process.env.HADMIN_INTERNAL_TOKEN || ''
const resourceKeyword = process.env.SMOKE_RESOURCE_KEYWORD || '集成验收资源'
const resourceTitle = process.env.SMOKE_RESOURCE_TITLE || '集成验收资源 - 道德经'
const resourceCategorySlug = process.env.SMOKE_RESOURCE_CATEGORY_SLUG || 'learning'

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { response, data }
}

function jsonHeaders(headers = {}) {
  return {
    'Content-Type': 'application/json',
    ...headers
  }
}

function bearerHeaders(token, headers = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...headers
  }
}

function internalHeaders(headers = {}) {
  return {
    'x-hadmin-token': hadminToken,
    'x-hadmin-admin-id': 'smoke-hadmin',
    'x-hadmin-admin-name': 'Smoke hAdmin',
    ...headers
  }
}

function formatErrorMessage(data, status) {
  if (typeof data === 'string') return `${status}: ${data}`
  return `${status}: ${data?.message || data?.code || 'unexpected response'}`
}

async function assertCheck(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error.message}`)
    throw error
  }
}

function ensureRequired(label, value) {
  if (!value) {
    throw new Error(`Missing required environment value: ${label}`)
  }
}

function assertSuccess(response, data, label) {
  if (!response.ok || data?.success === false) {
    throw new Error(`${label} failed: ${formatErrorMessage(data, response.status)}`)
  }
}

async function loginUser() {
  ensureRequired('SMOKE_USER_EMAIL', userEmail)
  ensureRequired('SMOKE_USER_PASSWORD', userPassword)

  const { response, data } = await request('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email: userEmail, password: userPassword })
  })

  if (!response.ok || !data?.token) {
    throw new Error(`User login failed: ${formatErrorMessage(data, response.status)}`)
  }

  return data.token
}

async function loginAdmin() {
  ensureRequired('SMOKE_ADMIN_USERNAME/ADMIN_BOOTSTRAP_USERNAME', adminUsername)
  ensureRequired('SMOKE_ADMIN_PASSWORD/ADMIN_BOOTSTRAP_PASSWORD', adminPassword)

  const { response, data } = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ username: adminUsername, password: adminPassword })
  })

  if (!response.ok || !data?.token) {
    throw new Error(`Admin login failed: ${formatErrorMessage(data, response.status)}`)
  }

  return data.token
}

async function fetchAdminCategoryId(adminToken) {
  const { response, data } = await request('/api/admin/resources/categories', {
    headers: bearerHeaders(adminToken)
  })
  assertSuccess(response, data, 'Admin resource category list')
  if (!Array.isArray(data?.data)) {
    throw new Error('Admin resource category list returned invalid payload')
  }

  const target = data.data.find(category => category.slug === resourceCategorySlug) || data.data[0]
  if (!target?.id) {
    throw new Error(`Missing resource category for slug: ${resourceCategorySlug}`)
  }
  return target.id
}

async function runBasicChecks() {
  let smokeUserToken = ''

  await assertCheck('health endpoint', async () => {
    const { response, data } = await request('/api/health')
    if (!response.ok || !data?.success) {
      throw new Error(`Unexpected health response: ${formatErrorMessage(data, response.status)}`)
    }
  })

  await assertCheck('ready endpoint', async () => {
    const { response, data } = await request('/api/health/ready')
    if (!response.ok || !data?.success) {
      throw new Error(`Unexpected ready response: ${formatErrorMessage(data, response.status)}`)
    }
  })

  await assertCheck('resource list endpoint', async () => {
    const { response, data } = await request('/api/resources')
    if (!response.ok || !Array.isArray(data?.data)) {
      throw new Error(`Unexpected resources response: ${formatErrorMessage(data, response.status)}`)
    }
  })

  if (userEmail && userPassword) {
    await assertCheck('user login endpoint', async () => {
      smokeUserToken = await loginUser()
    })

    await assertCheck('community list endpoint', async () => {
      const { response, data } = await request('/api/community/posts', {
        headers: bearerHeaders(smokeUserToken)
      })
      if (!response.ok || !Array.isArray(data?.data)) {
        throw new Error(`Unexpected community response: ${formatErrorMessage(data, response.status)}`)
      }
    })

    await assertCheck('tts task list endpoint', async () => {
      const { response, data } = await request('/api/tts/tasks', {
        headers: bearerHeaders(smokeUserToken)
      })
      if (!response.ok || !Array.isArray(data?.data)) {
        throw new Error(`Unexpected TTS task response: ${formatErrorMessage(data, response.status)}`)
      }
    })
  } else {
    console.log('! Skip authenticated smoke checks: missing SMOKE_USER_EMAIL or SMOKE_USER_PASSWORD')
  }

  if (hadminToken) {
    await assertCheck('hAdmin internal metrics endpoint', async () => {
      const { response, data } = await request('/api/admin/internal/metrics', {
        headers: internalHeaders()
      })
      if (!response.ok || !data?.requests) {
        throw new Error(`Unexpected internal metrics response: ${formatErrorMessage(data, response.status)}`)
      }
    })
  } else {
    console.log('! Skip hAdmin internal metrics smoke check: missing SMOKE_HADMIN_TOKEN/HADMIN_INTERNAL_TOKEN')
  }
}

async function runIntegrationChecks() {
  ensureRequired('SMOKE_HADMIN_TOKEN/HADMIN_INTERNAL_TOKEN', hadminToken)

  const userToken = await loginUser()
  const adminToken = await loginAdmin()
  const uniqueSuffix = Date.now()
  const communityTitle = `integration-community-${uniqueSuffix}`
  const ttsText = `integration-tts-${uniqueSuffix}`
  const adminResourceTitle = `${resourceTitle}-${uniqueSuffix}`
  let communityPostId = ''
  let ttsTaskId = ''
  let adminResourceId = ''

  await assertCheck('user auth me endpoint', async () => {
    const { response, data } = await request('/api/auth/me', {
      headers: bearerHeaders(userToken)
    })
    assertSuccess(response, data, 'User auth me')
    if (data?.user?.email !== userEmail) {
      throw new Error(`Unexpected auth user email: ${data?.user?.email || 'unknown'}`)
    }
  })

  await assertCheck('community create persists to frontend business backend', async () => {
    const createResult = await request('/api/community/posts', {
      method: 'POST',
      headers: jsonHeaders(bearerHeaders(userToken)),
      body: JSON.stringify({
        title: communityTitle,
        content: 'Integration smoke validates Express business write path.',
        tags: ['integration', 'smoke']
      })
    })
    assertSuccess(createResult.response, createResult.data, 'Community create')
    communityPostId = createResult.data?.post?.id || ''
    if (!communityPostId) {
      throw new Error('Community create did not return post id')
    }

    const listResult = await request(`/api/community/posts?keyword=${encodeURIComponent(communityTitle)}`, {
      headers: bearerHeaders(userToken)
    })
    assertSuccess(listResult.response, listResult.data, 'Community search after create')
    if (!Array.isArray(listResult.data?.data) || !listResult.data.data.some(post => post.id === communityPostId)) {
      throw new Error('Created community post not found in subsequent list query')
    }
  })

  await assertCheck('tts task create persists to frontend business backend', async () => {
    const createResult = await request('/api/tts/tasks', {
      method: 'POST',
      headers: jsonHeaders(bearerHeaders(userToken)),
      body: JSON.stringify({
        text: ttsText,
        voice: 'longxiaochun',
        speed: 1,
        volume: 1
      })
    })
    assertSuccess(createResult.response, createResult.data, 'TTS task create')
    ttsTaskId = createResult.data?.task?.id || ''
    if (!ttsTaskId) {
      throw new Error('TTS create did not return task id')
    }

    const listResult = await request('/api/tts/tasks', {
      headers: bearerHeaders(userToken)
    })
    assertSuccess(listResult.response, listResult.data, 'TTS task list after create')
    if (!Array.isArray(listResult.data?.data) || !listResult.data.data.some(task => task.id === ttsTaskId)) {
      throw new Error('Created TTS task not found in subsequent list query')
    }
  })

  await assertCheck('admin auth me endpoint', async () => {
    const { response, data } = await request('/api/admin/auth/me', {
      headers: bearerHeaders(adminToken)
    })
    assertSuccess(response, data, 'Admin auth me')
    if (data?.admin?.username !== adminUsername) {
      throw new Error(`Unexpected admin username: ${data?.admin?.username || 'unknown'}`)
    }
  })

  await assertCheck('admin resource management writes shared database', async () => {
    const categoryId = await fetchAdminCategoryId(adminToken)

    const listBefore = await request('/api/admin/resources', {
      headers: bearerHeaders(adminToken)
    })
    assertSuccess(listBefore.response, listBefore.data, 'Admin resource list')
    if (!Array.isArray(listBefore.data?.data)) {
      throw new Error('Admin resource list returned invalid payload')
    }

    const createResult = await request('/api/admin/resources', {
      method: 'POST',
      headers: jsonHeaders(bearerHeaders(adminToken)),
      body: JSON.stringify({
        categoryId,
        title: adminResourceTitle,
        summary: `${resourceKeyword} backend integration summary`,
        content: 'Created by integration smoke through admin management API.',
        resourceType: 'article',
        tags: [resourceKeyword, 'integration', 'admin'],
        status: 'published',
        sortOrder: 1000
      })
    })
    assertSuccess(createResult.response, createResult.data, 'Admin resource create')
    adminResourceId = createResult.data?.resource?.id || ''
    if (!adminResourceId) {
      throw new Error('Admin resource create did not return resource id')
    }

    const updateResult = await request(`/api/admin/resources/${adminResourceId}`, {
      method: 'PATCH',
      headers: jsonHeaders(bearerHeaders(adminToken)),
      body: JSON.stringify({
        summary: `${resourceKeyword} backend integration summary updated`,
        status: 'published'
      })
    })
    assertSuccess(updateResult.response, updateResult.data, 'Admin resource update')

    const publicResult = await request(`/api/resources?keyword=${encodeURIComponent(adminResourceTitle)}`)
    assertSuccess(publicResult.response, publicResult.data, 'Public resource query after admin write')
    if (!Array.isArray(publicResult.data?.data) || !publicResult.data.data.some(resource => resource.id === adminResourceId)) {
      throw new Error('Admin-created resource not visible from public resource API')
    }
  })

  await assertCheck('admin metrics and alerts endpoints', async () => {
    const metricsResult = await request('/api/admin/metrics', {
      headers: bearerHeaders(adminToken)
    })
    assertSuccess(metricsResult.response, metricsResult.data, 'Admin metrics')
    if (typeof metricsResult.data?.requests?.total !== 'number') {
      throw new Error('Admin metrics missing request counters')
    }

    const alertsResult = await request('/api/admin/alerts', {
      headers: bearerHeaders(adminToken)
    })
    assertSuccess(alertsResult.response, alertsResult.data, 'Admin alerts')
    if (!Array.isArray(alertsResult.data?.data)) {
      throw new Error('Admin alerts returned invalid payload')
    }
  })

  await assertCheck('hAdmin internal moderation updates community post status', async () => {
    const moderationResult = await request(`/api/admin/internal/community/posts/${communityPostId}/status`, {
      method: 'POST',
      headers: jsonHeaders(internalHeaders()),
      body: JSON.stringify({
        status: 'hidden',
        reason: 'integration smoke moderation'
      })
    })
    assertSuccess(moderationResult.response, moderationResult.data, 'hAdmin community moderation')
    if (moderationResult.data?.post?.status !== 'hidden') {
      throw new Error(`Unexpected moderated community status: ${moderationResult.data?.post?.status || 'unknown'}`)
    }

    const listResult = await request(`/api/community/posts?keyword=${encodeURIComponent(communityTitle)}`, {
      headers: bearerHeaders(userToken)
    })
    assertSuccess(listResult.response, listResult.data, 'Community list after moderation')
    if (Array.isArray(listResult.data?.data) && listResult.data.data.some(post => post.id === communityPostId)) {
      throw new Error('Hidden community post is still visible in published list')
    }
  })

  await assertCheck('hAdmin internal TTS callback updates task status', async () => {
    const callbackResult = await request(`/api/admin/internal/tts/tasks/${ttsTaskId}`, {
      method: 'POST',
      headers: jsonHeaders(internalHeaders()),
      body: JSON.stringify({
        status: 'completed',
        audioUrl: 'https://example.com/integration-smoke.mp3',
        metadata: { source: 'integration-smoke', syncedBy: 'hadmin' }
      })
    })
    assertSuccess(callbackResult.response, callbackResult.data, 'hAdmin TTS callback')
    if (callbackResult.data?.task?.status !== 'completed') {
      throw new Error(`Unexpected TTS task status: ${callbackResult.data?.task?.status || 'unknown'}`)
    }

    const listResult = await request('/api/tts/tasks', {
      headers: bearerHeaders(userToken)
    })
    assertSuccess(listResult.response, listResult.data, 'TTS task list after callback')
    const updatedTask = Array.isArray(listResult.data?.data)
      ? listResult.data.data.find(task => task.id === ttsTaskId)
      : null
    if (!updatedTask || updatedTask.status !== 'completed') {
      throw new Error('Completed TTS task not reflected in frontend task list')
    }
  })

  await assertCheck('hAdmin internal metrics endpoint', async () => {
    const { response, data } = await request('/api/admin/internal/metrics', {
      headers: internalHeaders()
    })
    assertSuccess(response, data, 'hAdmin internal metrics')
    if (typeof data?.requests?.total !== 'number') {
      throw new Error('Internal metrics missing request counters')
    }
  })
}

async function run() {
  console.log(`Running smoke profile: ${profile}`)

  if (profile !== 'basic' && profile !== 'integration') {
    throw new Error(`Unsupported smoke profile: ${profile}`)
  }

  await runBasicChecks()

  if (profile === 'integration') {
    await runIntegrationChecks()
  }

  console.log(`Smoke checks completed (${profile})`)
}

run().catch(() => {
  process.exit(1)
})
