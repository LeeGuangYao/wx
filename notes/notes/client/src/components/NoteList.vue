<template>
  <section class="note-list-pane">
    <header class="pane-header note-list-header">
      <button v-if="isMobile" class="back-button" type="button" @click="$emit('back-folders')">返回</button>
      <div>
        <p class="eyebrow">Notes</p>
        <h2>{{ title }}</h2>
        <p class="pane-subtitle">{{ notes.length }} 条备忘录</p>
      </div>
      <button class="icon-button" type="button" title="新建备忘录" @click="$emit('create-note')">+</button>
    </header>

    <div class="search-box">
      <input
        type="search"
        :value="searchQuery"
        placeholder="搜索标题或内容"
        @input="$emit('update:searchQuery', $event.target.value)"
      >
    </div>

    <div class="notes-scroll">
      <button
        v-for="note in notes"
        :key="note.id"
        class="note-card"
        :class="{ active: currentNoteId === note.id }"
        type="button"
        @click="$emit('select-note', note)"
      >
        <div class="note-card-top">
          <span class="note-title">{{ note.title || '新建备忘录' }}</span>
          <span class="note-date">{{ formatDate(note.updated_at) }}</span>
        </div>
        <p class="note-preview">{{ preview(note) }}</p>
      </button>

      <div v-if="notes.length === 0" class="empty-state">
        <h3>{{ searchQuery ? '没有匹配的内容' : '这个分类还是空的' }}</h3>
        <p>{{ searchQuery ? '换个关键词试试看。' : '新建一条备忘录，先把事情放进来。' }}</p>
        <button v-if="!searchQuery" class="primary-button" type="button" @click="$emit('create-note')">新建备忘录</button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '所有备忘录'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  currentNoteId: {
    type: Number,
    default: null
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'back-folders',
  'create-note',
  'select-note',
  'update:searchQuery'
])

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}Z`)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()

  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function preview(note) {
  return stripHtml(note.content) || '空白内容，点开后开始记录。'
}
</script>
