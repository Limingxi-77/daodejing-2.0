<template>
  <div class="rich-text-editor" :class="{ 'border-primary': isFocused }">
    <div class="editor-toolbar">
      <button 
        type="button"
        @click="execCommand('bold')"
        :class="['toolbar-btn', { active: isFormatActive('bold') }]"
        title="粗体 (Ctrl+B)"
      >
        <i class="fas fa-bold"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('italic')"
        :class="['toolbar-btn', { active: isFormatActive('italic') }]"
        title="斜体 (Ctrl+I)"
      >
        <i class="fas fa-italic"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('underline')"
        :class="['toolbar-btn', { active: isFormatActive('underline') }]"
        title="下划线 (Ctrl+U)"
      >
        <i class="fas fa-underline"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('strikeThrough')"
        :class="['toolbar-btn', { active: isFormatActive('strikeThrough') }]"
        title="删除线"
      >
        <i class="fas fa-strikethrough"></i>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button 
        type="button"
        @click="toggleHeading"
        :class="['toolbar-btn', { active: isBlockActive('h2') }]"
        title="标题"
      >
        <i class="fas fa-heading"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('formatBlock', 'blockquote')"
        :class="['toolbar-btn', { active: isBlockActive('blockquote') }]"
        title="引用"
      >
        <i class="fas fa-quote-right"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('insertUnorderedList')"
        :class="['toolbar-btn', { active: isFormatActive('insertUnorderedList') }]"
        title="无序列表"
      >
        <i class="fas fa-list-ul"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('insertOrderedList')"
        :class="['toolbar-btn', { active: isFormatActive('insertOrderedList') }]"
        title="有序列表"
      >
        <i class="fas fa-list-ol"></i>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button 
        type="button"
        @click="insertLink"
        :class="['toolbar-btn', { active: hasLink }]"
        title="插入链接"
      >
        <i class="fas fa-link"></i>
      </button>
      <button 
        type="button"
        @click="insertImage"
        class="toolbar-btn"
        title="插入图片"
      >
        <i class="fas fa-image"></i>
      </button>
      <button 
        type="button"
        @click="insertCode"
        class="toolbar-btn"
        title="插入代码块"
      >
        <i class="fas fa-code"></i>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button 
        type="button"
        @click="execCommand('justifyLeft')"
        :class="['toolbar-btn', { active: isAlignActive('left') }]"
        title="左对齐"
      >
        <i class="fas fa-align-left"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('justifyCenter')"
        :class="['toolbar-btn', { active: isAlignActive('center') }]"
        title="居中"
      >
        <i class="fas fa-align-center"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('justifyRight')"
        :class="['toolbar-btn', { active: isAlignActive('right') }]"
        title="右对齐"
      >
        <i class="fas fa-align-right"></i>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button 
        type="button"
        @click="execCommand('undo')"
        class="toolbar-btn"
        title="撤销 (Ctrl+Z)"
      >
        <i class="fas fa-undo"></i>
      </button>
      <button 
        type="button"
        @click="execCommand('redo')"
        class="toolbar-btn"
        title="重做 (Ctrl+Y)"
      >
        <i class="fas fa-redo"></i>
      </button>
      <button 
        type="button"
        @click="clearFormat"
        class="toolbar-btn"
        title="清除格式"
      >
        <i class="fas fa-eraser"></i>
      </button>
    </div>
    
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></div>
    
    <div class="editor-footer">
      <div class="char-count" :class="{ 'text-red-500': charCount > maxLength }">
        {{ charCount }} / {{ maxLength }} 字符
      </div>
    </div>
    
    <div
      v-if="showLinkModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showLinkModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">插入链接</h3>
        <input
          v-model="linkUrl"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="请输入链接地址"
          @keyup.enter="confirmLink"
        >
        <div class="flex justify-end gap-2">
          <button
            @click="showLinkModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmLink"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
          >
            确定
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showImageModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">插入图片</h3>
        <input
          v-model="imageUrl"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="请输入图片地址"
        >
        <div class="flex justify-end gap-2">
          <button
            @click="showImageModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmImage"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  maxLength: 10000
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const charCount = ref(0)
const showLinkModal = ref(false)
const showImageModal = ref(false)
const linkUrl = ref('')
const imageUrl = ref('')
const hasLink = ref(false)
const savedSelection = ref<Range | null>(null)

const execCommand = (command: string, value: string = '') => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateContent()
}

const toggleHeading = () => {
  if (isBlockActive('h2')) {
    document.execCommand('formatBlock', false, 'p')
  } else {
    document.execCommand('formatBlock', false, 'h2')
  }
  editorRef.value?.focus()
  updateContent()
}

const isFormatActive = (command: string): boolean => {
  return document.queryCommandState(command)
}

const isBlockActive = (tag: string): boolean => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false
  
  let node = selection.anchorNode
  while (node && node !== editorRef.value) {
    if (node.nodeName === tag.toUpperCase()) return true
    node = node.parentNode
  }
  return false
}

const isAlignActive = (align: string): boolean => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false
  
  let node = selection.anchorNode
  while (node && node !== editorRef.value) {
    if (node instanceof HTMLElement) {
      const textAlign = window.getComputedStyle(node).textAlign
      if (textAlign === align) return true
    }
    node = node.parentNode
  }
  return false
}

const saveSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    savedSelection.value = selection.getRangeAt(0)
  }
}

const restoreSelection = () => {
  if (savedSelection.value) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(savedSelection.value)
  }
}

const insertLink = () => {
  saveSelection()
  const selection = window.getSelection()
  if (selection && selection.toString()) {
    linkUrl.value = ''
    showLinkModal.value = true
  } else {
    linkUrl.value = ''
    showLinkModal.value = true
  }
}

const confirmLink = () => {
  if (!linkUrl.value) return
  
  restoreSelection()
  editorRef.value?.focus()
  
  const selection = window.getSelection()
  if (selection && selection.toString()) {
    document.execCommand('createLink', false, linkUrl.value)
  } else {
    const linkHtml = `<a href="${linkUrl.value}" target="_blank">${linkUrl.value}</a>`
    document.execCommand('insertHTML', false, linkHtml)
  }
  
  showLinkModal.value = false
  linkUrl.value = ''
  updateContent()
}

const insertImage = () => {
  saveSelection()
  imageUrl.value = ''
  showImageModal.value = true
}

const confirmImage = () => {
  if (!imageUrl.value) return
  
  restoreSelection()
  editorRef.value?.focus()
  
  const imgHtml = `<img src="${imageUrl.value}" alt="图片" style="max-width: 100%; border-radius: 8px; margin: 8px 0;">`
  document.execCommand('insertHTML', false, imgHtml)
  
  showImageModal.value = false
  imageUrl.value = ''
  updateContent()
}

const insertCode = () => {
  const selection = window.getSelection()
  const code = selection?.toString() || '代码'
  const codeHtml = `<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code>${code}</code></pre>`
  document.execCommand('insertHTML', false, codeHtml)
  updateContent()
}

const clearFormat = () => {
  document.execCommand('removeFormat', false)
  document.execCommand('formatBlock', false, 'p')
  updateContent()
}

const handleInput = () => {
  updateContent()
}

const handleBlur = () => {
  isFocused.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
    }
  }
}

const updateContent = () => {
  if (!editorRef.value) return
  
  const html = editorRef.value.innerHTML
  const text = editorRef.value.innerText || ''
  
  charCount.value = text.length
  
  hasLink.value = editorRef.value.querySelectorAll('a').length > 0
  
  emit('update:modelValue', html)
}

watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    editorRef.value.innerHTML = newValue
    updateContent()
  }
})

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
    updateContent()
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.rich-text-editor.border-primary {
  border-color: #d4b483;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #4b5563;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.toolbar-btn.active {
  background: #d4b483;
  color: white;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 4px 4px;
}

.editor-content {
  min-height: 150px;
  max-height: 400px;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.6;
  outline: none;
}

.editor-content:empty::before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.editor-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.editor-content :deep(blockquote) {
  border-left: 3px solid #d4b483;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
  font-style: italic;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.editor-content :deep(a) {
  color: #d4b483;
  text-decoration: underline;
}

.editor-content :deep(a:hover) {
  color: #b8965f;
}

.editor-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
}

.editor-content :deep(pre) {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.editor-content :deep(code) {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.editor-footer {
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
}

:global(html.zen-mode) .rich-text-editor {
  border-color: #3f3f46;
}

:global(html.zen-mode) .editor-toolbar,
:global(html.zen-mode) .editor-footer {
  background: #2c2c2e;
  border-color: #3f3f46;
}

:global(html.zen-mode) .toolbar-btn {
  color: #9ca3af;
}

:global(html.zen-mode) .toolbar-btn:hover {
  background: #3f3f46;
  color: #d4b483;
}

:global(html.zen-mode) .editor-content {
  background: #1c1c1e;
  color: #d4b483;
}

:global(html.zen-mode) .editor-content:empty::before {
  color: #6b7280;
}
</style>
