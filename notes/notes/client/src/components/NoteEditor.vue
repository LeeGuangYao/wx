<template>
  <section class="editor-pane">
    <template v-if="note && editor">
      <header class="editor-header">
        <div class="editor-title-wrap">
          <button v-if="isMobile" class="back-button" type="button" @click="$emit('back-notes')">返回</button>
          <div>
            <p class="eyebrow">{{ folderLabel }}</p>
            <h2>{{ note.title || '新建备忘录' }}</h2>
            <p class="pane-subtitle">最近更新 {{ formatDateTime(note.updated_at) }}</p>
          </div>
        </div>

        <div class="editor-actions">
          <span class="save-pill" :class="saveState">{{ saveStateLabel }}</span>
          <label class="folder-select">
            <span>分类</span>
            <select :value="folderValue" @change="handleFolderChange">
              <option value="">未分类</option>
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">
                {{ folder.name }}
              </option>
            </select>
          </label>
          <button class="danger-button" type="button" @click="$emit('delete-note')">删除</button>
        </div>
      </header>

      <div class="toolbar">
        <button type="button" title="加粗" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }"><b>B</b></button>
        <button type="button" title="斜体" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }"><i>I</i></button>
        <button type="button" title="删除线" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }"><s>S</s></button>
        <span class="toolbar-separator"></span>
        <button type="button" title="二级标题" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }">H2</button>
        <button type="button" title="三级标题" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }">H3</button>
        <span class="toolbar-separator"></span>
        <button type="button" title="项目列表" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }">列表</button>
        <button type="button" title="编号列表" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }">序号</button>
        <span class="toolbar-separator"></span>
        <button type="button" title="引用" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ active: editor.isActive('blockquote') }">引用</button>
        <button type="button" title="分割线" @click="editor.chain().focus().setHorizontalRule().run()">分割线</button>
        <span class="toolbar-separator"></span>
        <button type="button" title="左对齐" @click="editor.chain().focus().setTextAlign('left').run()" :class="{ active: editor.isActive({ textAlign: 'left' }) }">左</button>
        <button type="button" title="居中" @click="editor.chain().focus().setTextAlign('center').run()" :class="{ active: editor.isActive({ textAlign: 'center' }) }">中</button>
        <button type="button" title="右对齐" @click="editor.chain().focus().setTextAlign('right').run()" :class="{ active: editor.isActive({ textAlign: 'right' }) }">右</button>
      </div>

      <div class="editor-scroll">
        <div class="editor-paper" @click="focusEditor">
          <editor-content :editor="editor" />
        </div>
      </div>
    </template>

    <div v-else class="editor-empty">
      <div class="empty-state editor-empty-card">
        <h3>选择一条备忘录</h3>
        <p>也可以直接新建，把当前想法先放下来。</p>
        <button class="primary-button" type="button" @click="$emit('create-note')">新建备忘录</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  folders: {
    type: Array,
    default: () => []
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  saveState: {
    type: String,
    default: 'saved'
  },
  saveStateLabel: {
    type: String,
    default: '已保存'
  }
})

const emit = defineEmits([
  'back-notes',
  'content-change',
  'move-note',
  'delete-note',
  'create-note'
])

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '开始记录...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'left' })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    if (!props.note) return
    emit('content-change', editor.getHTML())
  }
})

const folderValue = computed(() => (
  props.note && props.note.folder_id != null ? String(props.note.folder_id) : ''
))

const folderLabel = computed(() => {
  if (!props.note || props.note.folder_id == null) return '未分类'
  return props.note.folder_name || '已归类'
})

watch(
  () => props.note && props.note.id,
  () => {
    if (!editor.value) return
    editor.value.commands.setContent(props.note ? props.note.content || '' : '', false)
    if (props.note) nextTick(() => editor.value && editor.value.commands.focus('end'))
  },
  { immediate: true }
)

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}Z`)
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function focusEditor() {
  if (editor.value) editor.value.commands.focus()
}

function handleFolderChange(event) {
  const value = event.target.value
  emit('move-note', value === '' ? null : Number(value))
}

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
})
</script>
