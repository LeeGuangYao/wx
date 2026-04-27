<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ hidden: mobileEditing }">
      <div class="sidebar-header">
        <p class="sidebar-eyebrow">Workspace</p>
        <div class="sidebar-heading">
          <div>
            <h1 class="app-title">备忘录</h1>
            <p class="sidebar-subtitle">共 {{ notes.length }} 条，按最近更新排序</p>
          </div>
          <button class="btn-new desktop-only" @click="createNote">新建</button>
        </div>
      </div>
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索标题或内容">
      </div>
      <div class="note-list">
        <button
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-item"
          :class="{ active: currentNote && currentNote.id === note.id }"
          type="button"
          @click="selectNote(note)"
        >
          <div class="note-item-row">
            <div class="note-item-title">{{ note.title || '新建备忘录' }}</div>
            <span class="note-item-date">{{ formatDate(note.updated_at) }}</span>
          </div>
          <div class="note-item-preview">{{ getPreview(note) }}</div>
        </button>
        <div v-if="filteredNotes.length === 0" class="empty-list">
          <p>{{ searchQuery ? '没有匹配的备忘录' : '还没有内容，先写第一条。' }}</p>
          <button v-if="!searchQuery" class="btn-secondary" @click="createNote">立即新建</button>
        </div>
      </div>
      <div class="sidebar-footer">
        <button class="btn-new" @click="createNote">新建</button>
      </div>
    </aside>

    <main class="editor-area" :class="{ hidden: !mobileEditing && isMobile }">
      <div class="editor-shell">
        <div class="editor-header">
          <div class="editor-heading">
            <button v-if="isMobile" class="btn-back" @click="goBack">&larr; 返回</button>
            <div>
              <p class="editor-eyebrow">{{ currentNote ? '正在编辑' : '准备记录' }}</p>
              <h2 class="editor-title">{{ currentNote ? currentNote.title || '新建备忘录' : '选择一条备忘录' }}</h2>
              <p class="editor-meta">
                {{ currentNote ? `最近更新 ${formatDateTime(currentNote.updated_at)}` : '从左开始写，保持自然的阅读与记录节奏。' }}
              </p>
            </div>
          </div>
          <div class="editor-actions">
            <span v-if="currentNote" class="save-indicator" :class="saveState">{{ saveStateLabel }}</span>
            <button v-if="currentNote" class="btn-delete" @click="deleteNote">删除</button>
          </div>
        </div>
        <div class="toolbar-wrap" v-if="currentNote && editor">
          <div class="toolbar">
            <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
            <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
            <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"><s>S</s></button>
            <span class="toolbar-sep"></span>
            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
            <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
            <span class="toolbar-sep"></span>
            <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">列表</button>
            <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }">序号</button>
            <span class="toolbar-sep"></span>
            <button @click="editor.chain().focus().setHorizontalRule().run()">分割线</button>
            <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ active: editor.isActive('blockquote') }">引用</button>
            <span class="toolbar-sep"></span>
            <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ active: editor.isActive({ textAlign: 'left' }) }">左</button>
            <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ active: editor.isActive({ textAlign: 'center' }) }">中</button>
            <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ active: editor.isActive({ textAlign: 'right' }) }">右</button>
          </div>
        </div>
        <div class="editor-stage" v-if="currentNote && editor">
          <div class="editor-content" @click="focusEditor">
            <editor-content :editor="editor" />
          </div>
        </div>
        <div class="editor-placeholder" v-else>
          <div class="placeholder-card">
            <p class="placeholder-eyebrow">Blank Page</p>
            <h3>选择一条备忘录，或者直接新建</h3>
            <p>左侧负责查找和切换，右侧负责沉浸式书写，整个布局会始终保持左起阅读流。</p>
            <button class="btn-new placeholder-btn" @click="createNote">新建第一条</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'

const API = '/api/notes'

const notes = ref([])
const currentNote = ref(null)
const searchQuery = ref('')
const mobileEditing = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const saveState = ref('saved')

let saveTimer = null

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '开始记录...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'left' })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    if (!currentNote.value) return
    clearTimeout(saveTimer)
    saveState.value = 'saving'
    saveTimer = setTimeout(() => {
      saveNote(editor.getHTML())
    }, 1000)
  }
})

const saveStateLabel = computed(() => {
  if (saveState.value === 'saving') return '保存中...'
  if (saveState.value === 'error') return '保存失败'
  return '已保存'
})

const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value
  const q = searchQuery.value.toLowerCase()
  return notes.value.filter(n =>
    (n.title || '').toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q)
  )
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'Z')
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'Z')
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPreview(note) {
  const preview = stripHtml(note.content)
  return preview || '空白内容，点开后开始记录。'
}

function upsertCurrentNote(note) {
  currentNote.value = note
  notes.value = [note, ...notes.value.filter(item => item.id !== note.id)]
}

async function fetchNotes() {
  const res = await fetch(API)
  const json = await res.json()
  if (json.code === 0) notes.value = json.data
}

async function createNote() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '' })
  })
  const json = await res.json()
  if (json.code === 0) {
    upsertCurrentNote(json.data)
    selectNote(json.data)
  }
}

async function saveNote(content) {
  if (!currentNote.value) return
  const res = await fetch(`${API}/${currentNote.value.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })
  const json = await res.json()
  if (json.code === 0) {
    upsertCurrentNote(json.data)
    saveState.value = 'saved'
  } else {
    saveState.value = 'error'
  }
}

async function deleteNote() {
  if (!currentNote.value) return
  const id = currentNote.value.id
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  const json = await res.json()
  if (json.code === 0) {
    notes.value = notes.value.filter(n => n.id !== id)
    currentNote.value = null
    mobileEditing.value = false
    if (editor.value) editor.value.commands.setContent('')
  }
}

function selectNote(note) {
  currentNote.value = note
  mobileEditing.value = true
  saveState.value = 'saved'
  if (editor.value) {
    editor.value.commands.setContent(note.content || '', false)
    nextTick(() => editor.value.commands.focus('end'))
  }
}

function goBack() {
  mobileEditing.value = false
}

function focusEditor() {
  if (editor.value) editor.value.commands.focus()
}

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  fetchNotes()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(saveTimer)
})
</script>
