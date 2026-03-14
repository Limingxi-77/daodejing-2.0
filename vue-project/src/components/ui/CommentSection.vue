<template>
  <div class="comment-section">
    <div class="comment-header">
      <h3 class="text-lg font-bold text-dark">
        <i class="fas fa-comments mr-2 text-primary"></i>
        评论 ({{ totalComments }})
      </h3>
    </div>
    
    <div class="comment-input-area">
      <div class="flex gap-3">
        <div class="avatar-placeholder">
          {{ userAvatarText }}
        </div>
        <div class="flex-1">
          <textarea
            v-model="newComment"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            :placeholder="isLoggedIn ? '写下您的评论...' : '登录后即可评论'"
            rows="3"
            :disabled="!isLoggedIn"
          ></textarea>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-gray-400">{{ newComment.length }} / 500</span>
            <button
              @click="submitComment"
              :disabled="!isLoggedIn || !newComment.trim() || submitting"
              class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin mr-1"></i>
              {{ submitting ? '发布中...' : '发布评论' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="comments-list">
      <div v-if="comments.length === 0" class="empty-comments">
        <i class="fas fa-comment-slash text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">暂无评论，来抢沙发吧~</p>
      </div>
      
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="flex gap-3">
          <img
            :src="comment.user.avatar || `https://picsum.photos/id/${comment.user.avatarId || 1}/40/40`"
            :alt="comment.user.username"
            class="w-10 h-10 rounded-full object-cover shrink-0"
          >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-dark">{{ comment.user.username }}</span>
              <span v-if="comment.user.isAuthor" class="author-badge">作者</span>
              <span class="text-xs text-gray-400">{{ formatTime(comment.createdAt) }}</span>
            </div>
            
            <div class="comment-content">{{ comment.content }}</div>
            
            <div class="comment-actions">
              <button
                @click="toggleLike(comment.id)"
                :class="['action-btn', { liked: comment.isLiked }]"
              >
                <i :class="comment.isLiked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                <span v-if="comment.likes > 0">{{ comment.likes }}</span>
              </button>
              
              <button @click="showReplyInput(comment)" class="action-btn">
                <i class="far fa-comment"></i>
                <span>回复</span>
              </button>
              
              <button @click="reportComment(comment.id)" class="action-btn text-gray-400 hover:text-red-500">
                <i class="fas fa-exclamation-circle"></i>
              </button>
            </div>
            
            <div v-if="replyingTo === comment.id" class="reply-input mt-3">
              <textarea
                v-model="replyContent"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                :placeholder="`回复 ${comment.user.username}...`"
                rows="2"
              ></textarea>
              <div class="flex justify-end gap-2 mt-2">
                <button
                  @click="cancelReply"
                  class="px-3 py-1 text-sm text-gray-500 hover:text-dark"
                >
                  取消
                </button>
                <button
                  @click="submitReply(comment.id)"
                  :disabled="!replyContent.trim()"
                  class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  回复
                </button>
              </div>
            </div>
            
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list mt-3">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
              >
                <div class="flex gap-2">
                  <img
                    :src="reply.user.avatar || `https://picsum.photos/id/${reply.user.avatarId || 1}/32/32`"
                    :alt="reply.user.username"
                    class="w-8 h-8 rounded-full object-cover shrink-0"
                  >
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-dark text-sm">{{ reply.user.username }}</span>
                      <span v-if="reply.replyTo" class="text-xs text-gray-400">
                        回复 <span class="text-primary">@{{ reply.replyTo }}</span>
                      </span>
                      <span class="text-xs text-gray-400">{{ formatTime(reply.createdAt) }}</span>
                    </div>
                    <div class="text-sm text-gray-600">{{ reply.content }}</div>
                    <div class="comment-actions text-xs">
                      <button
                        @click="toggleLike(reply.id, comment.id)"
                        :class="['action-btn', { liked: reply.isLiked }]"
                      >
                        <i :class="reply.isLiked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                        <span v-if="reply.likes > 0">{{ reply.likes }}</span>
                      </button>
                      <button @click="showReplyInput(comment, reply.user.username)" class="action-btn">
                        <i class="far fa-comment"></i>
                        <span>回复</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                v-if="comment.replies.length < comment.totalReplies"
                @click="loadMoreReplies(comment.id)"
                class="text-sm text-primary hover:underline mt-2"
              >
                查看更多 {{ comment.totalReplies - comment.replies.length }} 条回复
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="hasMore" class="load-more">
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
        {{ loading ? '加载中...' : '加载更多评论' }}
      </button>
    </div>
    
    <ReportModal
      v-if="showReportModal"
      :target-id="reportTargetId"
      target-type="comment"
      @close="showReportModal = false"
      @submit="handleReportSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import ReportModal from './ReportModal.vue'

interface CommentUser {
  id: string
  username: string
  avatar?: string
  avatarId?: number
  isAuthor?: boolean
}

interface Reply {
  id: string
  user: CommentUser
  content: string
  likes: number
  isLiked: boolean
  replyTo?: string
  createdAt: Date | string
}

interface Comment {
  id: string
  user: CommentUser
  content: string
  likes: number
  isLiked: boolean
  createdAt: Date | string
  replies: Reply[]
  totalReplies: number
}

interface Props {
  postId: string | number
}

defineProps<Props>()

const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)

const comments = ref<Comment[]>([])
const newComment = ref('')
const replyContent = ref('')
const replyingTo = ref<string | null>(null)
const replyToUser = ref<string | null>(null)
const submitting = ref(false)
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const totalComments = ref(0)

const showReportModal = ref(false)
const reportTargetId = ref('')

const userAvatarText = computed(() => {
  return user.value?.display_name?.charAt(0) || user.value?.username?.charAt(0) || '?'
})

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const submitComment = async () => {
  if (!isLoggedIn.value || !newComment.value.trim()) return
  
  submitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const comment: Comment = {
    id: Date.now().toString(),
    user: {
      id: user.value!.id,
      username: user.value!.display_name || user.value!.username,
      avatar: user.value!.avatar_url
    },
    content: newComment.value,
    likes: 0,
    isLiked: false,
    createdAt: new Date(),
    replies: [],
    totalReplies: 0
  }
  
  comments.value.unshift(comment)
  totalComments.value++
  newComment.value = ''
  
  submitting.value = false
}

const showReplyInput = (comment: Comment, replyTo?: string) => {
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }
  
  replyingTo.value = comment.id
  replyToUser.value = replyTo || null
  replyContent.value = replyTo ? `@${replyTo} ` : ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyToUser.value = null
  replyContent.value = ''
}

const submitReply = async (commentId: string) => {
  if (!replyContent.value.trim()) return
  
  const comment = comments.value.find(c => c.id === commentId)
  if (!comment) return
  
  const reply: Reply = {
    id: Date.now().toString(),
    user: {
      id: user.value!.id,
      username: user.value!.display_name || user.value!.username,
      avatar: user.value!.avatar_url
    },
    content: replyContent.value,
    likes: 0,
    isLiked: false,
    replyTo: replyToUser.value || undefined,
    createdAt: new Date()
  }
  
  comment.replies.push(reply)
  comment.totalReplies++
  
  cancelReply()
}

const toggleLike = (commentId: string, parentCommentId?: string) => {
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }
  
  if (parentCommentId) {
    const parent = comments.value.find(c => c.id === parentCommentId)
    const reply = parent?.replies.find(r => r.id === commentId)
    if (reply) {
      reply.isLiked = !reply.isLiked
      reply.likes += reply.isLiked ? 1 : -1
    }
  } else {
    const comment = comments.value.find(c => c.id === commentId)
    if (comment) {
      comment.isLiked = !comment.isLiked
      comment.likes += comment.isLiked ? 1 : -1
    }
  }
}

const reportComment = (commentId: string) => {
  reportTargetId.value = commentId
  showReportModal.value = true
}

const handleReportSubmit = () => {
  showReportModal.value = false
}

const loadMore = async () => {
  loading.value = true
  currentPage.value++
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockComments: Comment[] = [
    {
      id: Date.now().toString(),
      user: { id: '1', username: '道友' + Math.floor(Math.random() * 100), avatarId: Math.floor(Math.random() * 50) },
      content: '感谢分享，受益匪浅！',
      likes: Math.floor(Math.random() * 20),
      isLiked: false,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
      replies: [],
      totalReplies: 0
    }
  ]
  
  comments.value.push(...mockComments)
  
  if (currentPage.value >= 3) {
    hasMore.value = false
  }
  
  loading.value = false
}

const loadMoreReplies = async (commentId: string) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (!comment) return
  
  const mockReplies: Reply[] = [
    {
      id: Date.now().toString(),
      user: { id: '1', username: '回复者' + Math.floor(Math.random() * 100), avatarId: Math.floor(Math.random() * 50) },
      content: '同意楼上的观点！',
      likes: Math.floor(Math.random() * 10),
      isLiked: false,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 3)
    }
  ]
  
  comment.replies.push(...mockReplies)
}

const loadComments = async () => {
  loading.value = true
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  comments.value = [
    {
      id: '1',
      user: { id: '1', username: '张明', avatarId: 10 },
      content: '这篇文章写得很好，对"上善若水"的解读很深刻。水善利万物而不争，这种境界确实值得我们学习。',
      likes: 23,
      isLiked: false,
      createdAt: new Date(Date.now() - 3600000),
      replies: [
        {
          id: '1-1',
          user: { id: '2', username: '李华', avatarId: 15 },
          content: '确实，水的特性最接近道。',
          likes: 5,
          isLiked: false,
          replyTo: '张明',
          createdAt: new Date(Date.now() - 1800000)
        }
      ],
      totalReplies: 2
    },
    {
      id: '2',
      user: { id: '3', username: '王芳', avatarId: 20, isAuthor: true },
      content: '感谢大家的讨论，我会继续分享更多关于《道德经》的感悟。',
      likes: 15,
      isLiked: false,
      createdAt: new Date(Date.now() - 7200000),
      replies: [],
      totalReplies: 0
    }
  ]
  
  totalComments.value = 5
  loading.value = false
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.comment-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-input-area {
  margin-bottom: 24px;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4b483, #b8965f);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  shrink: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
}

.comment-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.author-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #d4b483;
  color: white;
  border-radius: 4px;
}

.comment-content {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #d4b483;
}

.action-btn.liked {
  color: #d4b483;
}

.replies-list {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.reply-item {
  padding: 8px 0;
}

.reply-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

:global(html.zen-mode) .comment-section {
  background: #2c2c2e;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .border-gray-200,
:global(html.zen-mode) .border-primary {
  border-color: #3f3f46;
}

:global(html.zen-mode) .replies-list {
  background: #1c1c1e;
}
</style>
