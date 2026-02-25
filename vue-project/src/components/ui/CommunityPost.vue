<!-- 社区帖子组件 - Vue版本 -->
<template>
  <div class="community-post">
    <div class="post-header">
      <div class="post-avatar">{{ avatarText }}</div>
      <div class="post-meta">
        <div class="post-author">{{ author }}</div>
        <div class="post-date">{{ formattedDate }}</div>
      </div>
    </div>
    <div class="post-content">
      {{ content }}
    </div>
    <div class="post-actions">
      <div class="post-action" @click="handleLike">
        <i :class="likeIconClass"></i>
        <span>{{ likes }}</span>
      </div>
      <div class="post-action" @click="handleComment">
        <i class="far fa-comment"></i>
        <span>{{ comments }}</span>
      </div>
      <div class="post-action" @click="handleShare">
        <i class="far fa-share"></i>
        <span>分享</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 组件属性定义
interface Props {
  author?: string
  date?: string | Date
  content?: string
  likes?: number
  comments?: number
  isLiked?: boolean
}

// 默认属性值
const props = withDefaults(defineProps<Props>(), {
  author: '张三',
  date: () => new Date(),
  content: '今天读到了第八章"上善若水"，深有感触。水善利万物而不争，处众人之所恶，故几于道。这种不争而胜的智慧，在当今竞争激烈的社会中尤为重要。',
  likes: 32,
  comments: 12,
  isLiked: false
})

// 响应式数据
const localIsLiked = ref(props.isLiked)
const localLikes = ref(props.likes)

// 计算属性
const avatarText = computed(() => props.author.charAt(0))
const formattedDate = computed(() => {
  const date = typeof props.date === 'string' ? new Date(props.date) : props.date
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const likeIconClass = computed(() => 
  localIsLiked.value ? 'fas fa-thumbs-up text-primary' : 'far fa-thumbs-up'
)

// 事件定义
const emit = defineEmits<{
  like: [liked: boolean]
  comment: []
  share: []
}>()

// 处理点赞
const handleLike = () => {
  localIsLiked.value = !localIsLiked.value
  localLikes.value = localIsLiked.value ? localLikes.value + 1 : localLikes.value - 1
  emit('like', localIsLiked.value)
}

// 处理评论
const handleComment = () => {
  emit('comment')
}

// 处理分享
const handleShare = () => {
  emit('share')
}
</script>

<style scoped>
/* 社区帖子组件样式 */
.community-post {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.post-avatar {
  width: 3rem;
  height: 3rem;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
  margin-right: 0.75rem;
}

.post-meta {
  flex: 1;
}

.post-author {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.post-date {
  font-size: 0.875rem;
  color: #6c757d;
}

.post-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 1.5rem;
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
}

.post-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.post-action:hover {
  color: #007bff;
}

.post-action i {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-post {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .post-avatar {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 0.5rem;
  }
  
  .post-actions {
    gap: 1rem;
  }
}
</style>