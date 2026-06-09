<template>
  <aside class="folder-sidebar">
    <header class="pane-header">
      <div>
        <p class="eyebrow">iCloud</p>
        <h1>备忘录</h1>
      </div>
      <button class="icon-button" type="button" title="新建分类" @click="$emit('create-folder')">+</button>
    </header>

    <nav class="folder-nav" aria-label="备忘录分类">
      <button
        class="folder-row"
        :class="{ active: activeFolderId === 'all' }"
        type="button"
        @click="$emit('select-folder', 'all')"
      >
        <span class="folder-glyph">□</span>
        <span class="folder-name">所有备忘录</span>
        <span class="folder-count">{{ totalCount }}</span>
      </button>

      <button
        class="folder-row"
        :class="{ active: activeFolderId === 'uncategorized' }"
        type="button"
        @click="$emit('select-folder', 'uncategorized')"
      >
        <span class="folder-glyph">□</span>
        <span class="folder-name">未分类</span>
        <span class="folder-count">{{ uncategorizedCount }}</span>
      </button>

      <div class="folder-section-title">我的分类</div>
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="folder-row folder-row-custom"
        :class="{ active: activeFolderId === folder.id }"
      >
        <button class="folder-main" type="button" @click="$emit('select-folder', folder.id)">
          <span class="folder-glyph">□</span>
          <span class="folder-name">{{ folder.name }}</span>
          <span class="folder-count">{{ folderCount(folder) }}</span>
        </button>
        <span class="folder-actions">
          <button class="mini-button" type="button" title="重命名" @click="$emit('rename-folder', folder)">改</button>
          <button class="mini-button danger" type="button" title="删除分类" @click="$emit('delete-folder', folder)">删</button>
        </span>
      </div>

      <div v-if="folders.length === 0" class="folder-empty">
        还没有自定义分类。
      </div>
    </nav>

    <footer class="folder-footer">
      <button class="secondary-button" type="button" @click="$emit('logout')">退出登录</button>
    </footer>
  </aside>
</template>

<script setup>
const props = defineProps({
  folders: {
    type: Array,
    default: () => []
  },
  activeFolderId: {
    type: [String, Number],
    default: 'all'
  },
  totalCount: {
    type: Number,
    default: 0
  },
  uncategorizedCount: {
    type: Number,
    default: 0
  },
  folderCountMap: {
    type: Object,
    default: () => ({})
  }
})

defineEmits([
  'select-folder',
  'create-folder',
  'rename-folder',
  'delete-folder',
  'logout'
])

function folderCount(folder) {
  return props.folderCountMap[String(folder.id)] || 0
}
</script>
