<template>
  <div class="profile-page bg-[#f7f3ec] min-h-screen" data-testid="profile-page">
    <section class="profile-hero">
      <div class="container mx-auto px-4 md:px-8">
        <div v-if="isLoggedIn && user" class="profile-hero-grid">
          <div class="profile-avatar" aria-hidden="true">
            <img v-if="activeAvatarUrl" :src="activeAvatarUrl" alt="" class="profile-avatar-img">
            <span v-else>{{ avatarInitial }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm text-secondary font-semibold mb-2">个人中心</p>
            <h1 class="profile-title" data-testid="profile-display-name">{{ user.display_name || user.username }}</h1>
            <p class="profile-subtitle" data-testid="profile-email">{{ user.email }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-4">
              <span :class="['profile-tier', tierBadgeClass]" data-testid="profile-tier">{{ tierLabel }}</span>
              <span class="profile-meta">@{{ user.username }}</span>
              <span v-if="createdDateText" class="profile-meta">加入于 {{ createdDateText }}</span>
            </div>
          </div>
          <div class="profile-hero-actions">
            <router-link :to="{ name: 'Home' }" class="profile-action-button">
              <i class="fas fa-signature"></i>
              今日道签
            </router-link>
            <button type="button" class="profile-action-button profile-action-button-primary" @click="showPricingModal = true">
              <i class="fas fa-crown"></i>
              升级会员
            </button>
          </div>
        </div>

        <div v-else class="profile-login-prompt">
          <div class="profile-avatar mx-auto mb-5" aria-hidden="true">道</div>
          <h1 class="profile-title text-center mb-3">登录后查看个人中心</h1>
          <p class="profile-subtitle text-center max-w-xl mx-auto mb-6">
            登录后可以查看经验、境界、学习进度、修行账单和笔记概览。
          </p>
          <button type="button" class="profile-action-button profile-action-button-primary mx-auto" @click="authStore.openAuthModal('login')">
            <i class="fas fa-sign-in-alt"></i>
            登录
          </button>
        </div>
      </div>
    </section>

    <section v-if="isLoggedIn && user" class="py-10">
      <div class="container mx-auto px-4 md:px-8">
        <div class="profile-grid mb-8">
          <article class="profile-panel profile-avatar-panel">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <p class="profile-panel-label">头像审核</p>
                <h2 class="text-xl font-bold text-primary">上传头像</h2>
              </div>
              <span :class="['profile-pill', avatarStatusClass]" data-testid="profile-avatar-status">{{ avatarStatusText }}</span>
            </div>

            <div class="profile-avatar-review">
              <div class="profile-avatar-preview">
                <img v-if="selectedAvatarPreview || pendingAvatarUrl || activeAvatarUrl" :src="selectedAvatarPreview || pendingAvatarUrl || activeAvatarUrl" alt="头像预览">
                <span v-else>{{ avatarInitial }}</span>
              </div>
              <div class="min-w-0">
                <p class="profile-panel-help mb-3">
                  新头像提交后需要后台审核，通过后才会显示在导航和个人资料中。
                </p>
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  class="hidden"
                  data-testid="profile-avatar-input"
                  @change="handleAvatarFileChange"
                >
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="profile-action-button" data-testid="profile-avatar-select" @click="avatarInputRef?.click()">
                    <i class="fas fa-image"></i>选择图片
                  </button>
                  <button
                    type="button"
                    class="profile-action-button profile-action-button-primary"
                    data-testid="profile-avatar-submit"
                    :disabled="!selectedAvatarFile || avatarUploading"
                    @click="submitAvatar"
                  >
                    <i :class="avatarUploading ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>{{ avatarUploading ? '提交中' : '提交审核' }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="avatarMessage" :class="['profile-avatar-message', avatarMessageType]" data-testid="profile-avatar-message">
              {{ avatarMessage }}
            </p>
            <p v-else-if="user.avatar_status === 'pending'" class="profile-avatar-message info" data-testid="profile-avatar-message">
              头像已提交，等待后台审核。
            </p>
            <p v-else-if="user.avatar_status === 'rejected'" class="profile-avatar-message warn" data-testid="profile-avatar-message">
              头像未通过审核<span v-if="user.avatar_reject_reason">：{{ user.avatar_reject_reason }}</span>
            </p>
          </article>

          <article class="profile-panel profile-panel-emphasis">
            <div class="flex items-start justify-between gap-4 mb-5">
              <div>
                <p class="profile-panel-label">修行经验</p>
                <p class="profile-xp" data-testid="profile-xp">{{ formattedExp }} XP</p>
              </div>
              <div class="profile-realm-icon">
                <i :class="currentRealm.icon"></i>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-bold text-primary" data-testid="profile-current-realm">{{ currentRealm.name }}</span>
              <span class="text-dark/55">{{ nextRealm ? nextRealm.name : '最高境界' }}</span>
            </div>
            <div class="profile-progress-track">
              <div class="profile-progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <p class="profile-panel-help mt-3" data-testid="profile-next-realm-gap">
              <span v-if="nextRealm">还差 {{ formattedRemainingExp }} XP</span>
              <span v-else>已达最高境界</span>
            </p>
          </article>

          <article class="profile-panel">
            <p class="profile-panel-label">学习进度</p>
            <div class="profile-metric-row">
              <span class="profile-metric" data-testid="profile-learning-progress">{{ learnedText }}</span>
              <span class="profile-pill">{{ valueReport?.progress.percent ?? 0 }}%</span>
            </div>
            <p class="profile-panel-help">来自道学章节学习记录。</p>
            <router-link :to="{ name: 'LearningPath' }" class="profile-inline-link" data-testid="profile-action-learning">
              继续学习 <i class="fas fa-arrow-right"></i>
            </router-link>
          </article>

          <article class="profile-panel">
            <p class="profile-panel-label">学习笔记</p>
            <div class="profile-metric-row">
              <span class="profile-metric" data-testid="profile-notes-count">{{ notes.length }}</span>
              <span class="profile-pill">{{ notesLoading ? '同步中' : '已同步' }}</span>
            </div>
            <p class="profile-panel-help">保留最近的章节思考和关键词。</p>
            <div class="profile-note-list" data-testid="profile-recent-notes">
              <p v-if="recentNotes.length === 0" class="text-sm text-dark/45">暂无笔记</p>
              <p v-for="note in recentNotes" :key="note.id" class="profile-note-title">
                {{ note.title }}
              </p>
            </div>
          </article>
        </div>

        <ValueReportCard
          :data="valueReport"
          :loading="valueReportLoading"
          @refresh="reloadValueReport"
        />

        <section class="profile-actions-band" aria-label="常用操作">
          <router-link :to="{ name: 'AIInterpretation' }" class="profile-quick-action" data-testid="profile-action-ai">
            <i class="fas fa-robot"></i>
            <span>AI 解读</span>
          </router-link>
          <router-link :to="{ name: 'Inbox' }" class="profile-quick-action">
            <i class="fas fa-envelope"></i>
            <span>收件箱</span>
          </router-link>
          <router-link :to="{ name: 'Community' }" class="profile-quick-action">
            <i class="fas fa-users"></i>
            <span>共创社区</span>
          </router-link>
          <router-link :to="{ name: 'ResourceLibrary' }" class="profile-quick-action">
            <i class="fas fa-book"></i>
            <span>资源库</span>
          </router-link>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCultivationStore } from '@/stores/cultivation'
import ValueReportCard from '@/components/profile/ValueReportCard.vue'
import { clearValueReportCache, fetchValueReport, type ValueReport } from '@/services/valueReportService'
import { NoteService, type LearningNote } from '@/services/noteService'
import { uploadAvatar, validateAvatarFile } from '@/services/avatarService'

const authStore = useAuthStore()
const cultivationStore = useCultivationStore()

const { user, isLoggedIn, showPricingModal } = storeToRefs(authStore)
const { exp, currentRealm, nextRealm, progress } = storeToRefs(cultivationStore)

const valueReport = ref<ValueReport | null>(null)
const valueReportLoading = ref(false)
const notes = ref<LearningNote[]>([])
const notesLoading = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)
const selectedAvatarFile = ref<File | null>(null)
const selectedAvatarPreview = ref('')
const avatarUploading = ref(false)
const avatarMessage = ref('')
const avatarMessageType = ref<'info' | 'warn' | 'success'>('info')

const numberFormatter = new Intl.NumberFormat('zh-CN')

const tierLabel = computed(() => {
  const tier = user.value?.subscription?.tier || 'free'
  const map: Record<string, string> = { free: '布衣', pro: '居士', master: '宗师', team: '团队' }
  return map[tier] || tier
})

const tierBadgeClass = computed(() => {
  const tier = user.value?.subscription?.tier || 'free'
  const map: Record<string, string> = {
    free: 'bg-white/70 text-gray-600 border-gray-200',
    pro: 'bg-primary text-white border-primary',
    master: 'bg-amber-500 text-white border-amber-500',
    team: 'bg-blue-600 text-white border-blue-600'
  }
  return map[tier] || 'bg-white/70 text-gray-600 border-gray-200'
})

const avatarInitial = computed(() => {
  const source = user.value?.display_name || user.value?.username || '道'
  return source.trim().slice(0, 1).toUpperCase()
})

const activeAvatarUrl = computed(() => user.value?.avatar_url || '')
const pendingAvatarUrl = computed(() => user.value?.pending_avatar_url || '')

const avatarStatusText = computed(() => {
  const status = user.value?.avatar_status || 'none'
  const map: Record<string, string> = {
    none: activeAvatarUrl.value ? '已启用' : '未上传',
    pending: '待审核',
    approved: '已通过',
    rejected: '未通过'
  }
  return map[status] || '未上传'
})

const avatarStatusClass = computed(() => {
  const status = user.value?.avatar_status || 'none'
  const map: Record<string, string> = {
    none: 'bg-white/70 text-gray-600 border-gray-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  }
  return map[status] || map.none
})

const createdDateText = computed(() => {
  if (!user.value?.created_at) return ''
  return new Date(user.value.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedExp = computed(() => numberFormatter.format(exp.value))

const remainingExp = computed(() => {
  if (!nextRealm.value) return 0
  return Math.max(nextRealm.value.minExp - exp.value, 0)
})

const formattedRemainingExp = computed(() => numberFormatter.format(remainingExp.value))

const learnedText = computed(() => {
  const progressData = valueReport.value?.progress
  if (!progressData) return '0/81 章'
  return `${progressData.learned}/${progressData.total} 章`
})

const recentNotes = computed(() => {
  return [...notes.value]
    .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
    .slice(0, 3)
})

async function loadValueReport(force = false) {
  if (!isLoggedIn.value || !user.value?.id) {
    valueReport.value = null
    return
  }

  valueReportLoading.value = true
  try {
    valueReport.value = await fetchValueReport(user.value.id, { force })
  } catch {
    valueReport.value = null
  } finally {
    valueReportLoading.value = false
  }
}

async function loadNotes() {
  if (!isLoggedIn.value || !user.value?.id) {
    notes.value = []
    return
  }

  notesLoading.value = true
  try {
    notes.value = await NoteService.fetchUserNotes(user.value.id)
  } finally {
    notesLoading.value = false
  }
}

function reloadValueReport() {
  if (!user.value?.id) return
  clearValueReportCache(user.value.id)
  loadValueReport(true)
}

function handleAvatarFileChange(event: Event) {
  avatarMessage.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  selectedAvatarFile.value = null
  selectedAvatarPreview.value = ''
  if (!file) return

  const validationError = validateAvatarFile(file)
  if (validationError) {
    avatarMessage.value = validationError
    avatarMessageType.value = 'warn'
    input.value = ''
    return
  }

  selectedAvatarFile.value = file
  selectedAvatarPreview.value = URL.createObjectURL(file)
}

async function submitAvatar() {
  if (!selectedAvatarFile.value) return
  avatarUploading.value = true
  avatarMessage.value = ''
  try {
    const updated = await uploadAvatar(selectedAvatarFile.value)
    authStore.replaceUser(updated as unknown as Record<string, unknown>)
    avatarMessage.value = '头像已提交，等待后台审核。'
    avatarMessageType.value = 'success'
    selectedAvatarFile.value = null
    selectedAvatarPreview.value = ''
    if (avatarInputRef.value) avatarInputRef.value.value = ''
  } catch (error) {
    avatarMessage.value = error instanceof Error ? error.message : '头像提交失败'
    avatarMessageType.value = 'warn'
  } finally {
    avatarUploading.value = false
  }
}

watch(() => user.value?.id, userId => {
  if (!userId) return
  loadValueReport(false)
  loadNotes()
}, { immediate: true })

onMounted(() => {
  if (isLoggedIn.value && user.value?.id) {
    loadValueReport(false)
    loadNotes()
  }
})
</script>

<style scoped>
.profile-hero {
  padding: 3rem 0 2rem;
  background:
    linear-gradient(135deg, rgba(45, 90, 39, 0.1), rgba(212, 165, 116, 0.16)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 243, 236, 0.92));
  border-bottom: 1px solid rgba(139, 90, 43, 0.16);
}

.profile-hero-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1.5rem;
  align-items: center;
}

.profile-avatar {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d5a27;
  color: #fff;
  font-size: 2rem;
  font-weight: 800;
  box-shadow: 0 18px 40px rgba(45, 90, 39, 0.18);
  overflow: hidden;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-title {
  color: #2d5a27;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.05;
  font-weight: 800;
}

.profile-subtitle {
  color: rgba(31, 41, 55, 0.68);
  font-size: 1rem;
}

.profile-tier,
.profile-meta,
.profile-pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 700;
}

.profile-meta,
.profile-pill {
  border-color: rgba(139, 90, 43, 0.18);
  background: rgba(255, 255, 255, 0.7);
  color: rgba(31, 41, 55, 0.58);
}

.profile-hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(45, 90, 39, 0.2);
  background: rgba(255, 255, 255, 0.78);
  color: #2d5a27;
  font-weight: 800;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.profile-action-button:hover {
  transform: translateY(-1px);
  border-color: rgba(45, 90, 39, 0.45);
  background: #fff;
}

.profile-action-button-primary {
  background: #2d5a27;
  color: #fff;
}

.profile-action-button-primary:hover {
  background: #24491f;
}

.profile-login-prompt {
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

.profile-panel {
  min-height: 13rem;
  border: 1px solid rgba(139, 90, 43, 0.14);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.25rem;
  box-shadow: 0 14px 35px rgba(31, 41, 55, 0.06);
}

.profile-panel-emphasis {
  background:
    radial-gradient(circle at top right, rgba(212, 165, 116, 0.22), transparent 40%),
    #fff;
}

.profile-avatar-panel {
  background:
    radial-gradient(circle at top left, rgba(45, 90, 39, 0.12), transparent 42%),
    #fff;
}

.profile-avatar-review {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}

.profile-avatar-preview {
  width: 5rem;
  height: 5rem;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 90, 39, 0.1);
  color: #2d5a27;
  font-size: 1.6rem;
  font-weight: 900;
  border: 1px solid rgba(45, 90, 39, 0.16);
}

.profile-avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-message {
  margin-top: 1rem;
  border-radius: 0.5rem;
  padding: 0.65rem 0.8rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.profile-avatar-message.info {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.profile-avatar-message.warn {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.profile-avatar-message.success {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.profile-panel-label {
  color: rgba(31, 41, 55, 0.55);
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.profile-panel-help {
  color: rgba(31, 41, 55, 0.58);
  font-size: 0.875rem;
}

.profile-xp {
  color: #2d5a27;
  font-size: 2.5rem;
  line-height: 1;
  font-weight: 900;
}

.profile-realm-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 90, 39, 0.1);
  color: #2d5a27;
  font-size: 1.25rem;
}

.profile-progress-track {
  height: 0.6rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(45, 90, 39, 0.12);
}

.profile-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2d5a27, #d4a574);
  transition: width 0.4s ease;
}

.profile-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.profile-metric {
  color: #2d5a27;
  font-size: 2rem;
  line-height: 1;
  font-weight: 900;
}

.profile-inline-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  color: #2d5a27;
  font-weight: 800;
}

.profile-note-list {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.45rem;
}

.profile-note-title {
  color: rgba(31, 41, 55, 0.7);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-actions-band {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.profile-quick-action {
  min-height: 5.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.45rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 90, 43, 0.14);
  background: rgba(255, 255, 255, 0.82);
  color: #2d5a27;
  font-weight: 800;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.profile-quick-action:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 90, 39, 0.38);
  background: #fff;
}

.profile-quick-action i {
  font-size: 1.35rem;
}

@media (max-width: 900px) {
  .profile-hero-grid,
  .profile-grid,
  .profile-actions-band {
    grid-template-columns: 1fr;
  }

  .profile-hero-grid {
    text-align: center;
  }

  .profile-avatar,
  .profile-hero-actions {
    margin: 0 auto;
  }
}
</style>
