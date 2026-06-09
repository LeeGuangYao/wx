<template>
  <AuthView
    v-if="authChecking || !authenticated"
    :checking="authChecking"
    :username="loginUsername"
    :password="loginPassword"
    :error="loginError"
    :busy="loginBusy"
    @login="login"
    @update:username="loginUsername = $event"
    @update:password="loginPassword = $event"
  />

  <div v-else class="app-shell">
    <div class="workspace" :class="`mobile-${mobileView}`">
      <FolderSidebar
        class="workspace-pane folder-pane"
        :folders="folders"
        :active-folder-id="activeFolderId"
        :total-count="notes.length"
        :uncategorized-count="uncategorizedCount"
        :folder-count-map="folderCountMap"
        @select-folder="selectFolder"
        @create-folder="openCreateFolder"
        @rename-folder="openRenameFolder"
        @delete-folder="openDeleteFolder"
        @logout="logout"
      />

      <NoteList
        class="workspace-pane notes-pane"
        :notes="filteredNotes"
        :title="activeFolderLabel"
        :search-query="searchQuery"
        :current-note-id="currentNote ? currentNote.id : null"
        :is-mobile="isMobile"
        @back-folders="mobileView = 'folders'"
        @create-note="createNote"
        @select-note="selectNote"
        @update:searchQuery="searchQuery = $event"
      />

      <NoteEditor
        class="workspace-pane editor-pane-wrap"
        :note="currentNote"
        :folders="folders"
        :is-mobile="isMobile"
        :save-state="saveState"
        :save-state-label="saveStateLabel"
        @back-notes="mobileView = 'notes'"
        @content-change="queueSave"
        @move-note="moveCurrentNote"
        @delete-note="deleteNote"
        @create-note="createNote"
      />
    </div>

    <div v-if="folderDialog.mode" class="modal-backdrop" @click.self="closeFolderDialog">
      <form class="modal-panel" @submit.prevent="confirmFolderDialog">
        <h2>{{ folderDialogTitle }}</h2>
        <p class="modal-copy">{{ folderDialogCopy }}</p>

        <label v-if="folderDialog.mode !== 'delete'" class="modal-field">
          <span>分类名称</span>
          <input v-model.trim="folderDialog.name" type="text" maxlength="40" autofocus>
        </label>

        <p v-if="folderDialog.error" class="modal-error">{{ folderDialog.error }}</p>

        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="closeFolderDialog">取消</button>
          <button
            :class="folderDialog.mode === 'delete' ? 'danger-button' : 'primary-button'"
            type="submit"
            :disabled="folderDialog.busy"
          >
            {{ folderDialog.busy ? '处理中...' : folderDialogConfirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AuthView from './components/AuthView.vue'
import FolderSidebar from './components/FolderSidebar.vue'
import NoteEditor from './components/NoteEditor.vue'
import NoteList from './components/NoteList.vue'

const NOTES_API = '/api/notes'
const FOLDERS_API = '/api/folders'

const folders = ref([])
const notes = ref([])
const currentNote = ref(null)
const activeFolderId = ref('all')
const searchQuery = ref('')
const mobileView = ref('folders')
const isMobile = ref(window.innerWidth <= 768)
const saveState = ref('saved')
const authChecking = ref(true)
const authenticated = ref(false)
const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginBusy = ref(false)
const folderDialog = ref({
  mode: '',
  id: null,
  name: '',
  error: '',
  busy: false
})

let saveTimer = null

const saveStateLabel = computed(() => {
  if (saveState.value === 'saving') return '保存中...'
  if (saveState.value === 'error') return '保存失败'
  return '已保存'
})

const folderCountMap = computed(() => {
  return notes.value.reduce((map, note) => {
    if (note.folder_id != null) {
      const key = String(note.folder_id)
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, {})
})

const uncategorizedCount = computed(() => (
  notes.value.filter((note) => note.folder_id == null).length
))

const activeFolderLabel = computed(() => {
  if (activeFolderId.value === 'all') return '所有备忘录'
  if (activeFolderId.value === 'uncategorized') return '未分类'

  const folder = folders.value.find((item) => item.id === activeFolderId.value)
  return folder ? folder.name : '分类'
})

const scopedNotes = computed(() => (
  notes.value.filter((note) => noteMatchesFolder(note, activeFolderId.value))
))

const filteredNotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return scopedNotes.value

  return scopedNotes.value.filter((note) => (
    (note.title || '').toLowerCase().includes(q) ||
    stripHtml(note.content || '').toLowerCase().includes(q)
  ))
})

const folderDialogTitle = computed(() => {
  if (folderDialog.value.mode === 'create') return '新建分类'
  if (folderDialog.value.mode === 'rename') return '重命名分类'
  return '删除分类'
})

const folderDialogCopy = computed(() => {
  if (folderDialog.value.mode === 'delete') {
    return '删除分类不会删除里面的备忘录，这些备忘录会移动到未分类。'
  }
  return '用一个短名称整理同类备忘录。'
})

const folderDialogConfirmLabel = computed(() => {
  if (folderDialog.value.mode === 'create') return '创建'
  if (folderDialog.value.mode === 'rename') return '保存'
  return '删除'
})

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function noteMatchesFolder(note, folderId) {
  if (folderId === 'all') return true
  if (folderId === 'uncategorized') return note.folder_id == null
  return note.folder_id === folderId
}

function resetWorkspace() {
  clearTimeout(saveTimer)
  folders.value = []
  notes.value = []
  currentNote.value = null
  activeFolderId.value = 'all'
  searchQuery.value = ''
  mobileView.value = 'folders'
  saveState.value = 'saved'
}

function markLoggedOut(message = '') {
  authenticated.value = false
  loginPassword.value = ''
  loginError.value = message
  resetWorkspace()
}

async function readJson(res) {
  try {
    return await res.json()
  } catch (_err) {
    return { code: res.status || 500, message: '请求失败', data: null }
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options)
  const json = await readJson(res)

  if (res.status === 401 || json.code === 401) {
    markLoggedOut('登录已过期，请重新登录')
    throw new Error('unauthorized')
  }

  return { res, json }
}

async function checkSession() {
  authChecking.value = true
  try {
    const res = await fetch('/api/auth/session')
    const json = await readJson(res)

    if (json.code === 0 && json.data && json.data.authenticated) {
      authenticated.value = true
      loginError.value = ''
      await fetchWorkspace()
    } else {
      markLoggedOut('')
    }
  } catch (_err) {
    authenticated.value = false
    loginError.value = '无法连接服务'
  } finally {
    authChecking.value = false
  }
}

async function login() {
  if (loginBusy.value) return

  loginBusy.value = true
  loginError.value = ''

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value
      })
    })
    const json = await readJson(res)

    if (!res.ok || json.code !== 0 || !json.data || !json.data.authenticated) {
      loginError.value = json.message || '登录失败'
      return
    }

    authenticated.value = true
    loginPassword.value = ''
    await fetchWorkspace()
  } catch (_err) {
    loginError.value = '无法连接服务'
  } finally {
    loginBusy.value = false
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch (_err) {
    // The local session should still be cleared even if the request fails.
  }
  markLoggedOut('')
}

async function fetchWorkspace() {
  await Promise.all([fetchFolders(), fetchNotes()])
}

async function fetchFolders() {
  try {
    const { json } = await apiFetch(FOLDERS_API)
    if (json.code === 0) folders.value = json.data
  } catch (err) {
    if (err.message !== 'unauthorized') loginError.value = '无法加载分类'
  }
}

async function fetchNotes() {
  try {
    const { json } = await apiFetch(NOTES_API)
    if (json.code === 0) {
      notes.value = json.data
      if (currentNote.value) {
        currentNote.value = notes.value.find((note) => note.id === currentNote.value.id) || null
      }
    }
  } catch (err) {
    if (err.message !== 'unauthorized') loginError.value = '无法加载备忘录'
  }
}

function selectFolder(folderId) {
  activeFolderId.value = folderId
  searchQuery.value = ''

  if (currentNote.value && !noteMatchesFolder(currentNote.value, folderId)) {
    currentNote.value = null
  }

  mobileView.value = 'notes'
}

function selectNote(note) {
  currentNote.value = note
  saveState.value = 'saved'
  mobileView.value = 'editor'
}

function upsertCurrentNote(note) {
  currentNote.value = note
  notes.value = [note, ...notes.value.filter((item) => item.id !== note.id)]
}

async function createNote() {
  const folderId = typeof activeFolderId.value === 'number' ? activeFolderId.value : null

  try {
    const { json } = await apiFetch(NOTES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '', folder_id: folderId })
    })

    if (json.code === 0) {
      upsertCurrentNote(json.data)
      saveState.value = 'saved'
      mobileView.value = 'editor'
      if (folderId == null && activeFolderId.value !== 'all') activeFolderId.value = 'uncategorized'
    }
  } catch (err) {
    if (err.message !== 'unauthorized') saveState.value = 'error'
  }
}

function queueSave(content) {
  if (!currentNote.value) return

  clearTimeout(saveTimer)
  saveState.value = 'saving'
  saveTimer = setTimeout(() => {
    saveNote(content)
  }, 1000)
}

async function saveNote(content) {
  if (!currentNote.value) return

  try {
    const { json } = await apiFetch(`${NOTES_API}/${currentNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })

    if (json.code === 0) {
      upsertCurrentNote(json.data)
      saveState.value = 'saved'
    } else {
      saveState.value = 'error'
    }
  } catch (err) {
    if (err.message === 'unauthorized') return
    saveState.value = 'error'
  }
}

async function moveCurrentNote(folderId) {
  if (!currentNote.value) return

  try {
    const { json } = await apiFetch(`${NOTES_API}/${currentNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_id: folderId })
    })

    if (json.code === 0) {
      upsertCurrentNote(json.data)
      activeFolderId.value = folderId == null ? 'uncategorized' : folderId
      saveState.value = 'saved'
    } else {
      saveState.value = 'error'
    }
  } catch (err) {
    if (err.message !== 'unauthorized') saveState.value = 'error'
  }
}

async function deleteNote() {
  if (!currentNote.value) return
  const id = currentNote.value.id

  try {
    const { json } = await apiFetch(`${NOTES_API}/${id}`, { method: 'DELETE' })
    if (json.code === 0) {
      notes.value = notes.value.filter((note) => note.id !== id)
      currentNote.value = null
      saveState.value = 'saved'
      mobileView.value = 'notes'
    }
  } catch (err) {
    if (err.message !== 'unauthorized') saveState.value = 'error'
  }
}

function openCreateFolder() {
  folderDialog.value = {
    mode: 'create',
    id: null,
    name: '',
    error: '',
    busy: false
  }
}

function openRenameFolder(folder) {
  folderDialog.value = {
    mode: 'rename',
    id: folder.id,
    name: folder.name,
    error: '',
    busy: false
  }
}

function openDeleteFolder(folder) {
  folderDialog.value = {
    mode: 'delete',
    id: folder.id,
    name: folder.name,
    error: '',
    busy: false
  }
}

function closeFolderDialog(force = false) {
  if (folderDialog.value.busy && !force) return
  folderDialog.value = {
    mode: '',
    id: null,
    name: '',
    error: '',
    busy: false
  }
}

async function confirmFolderDialog() {
  const dialog = folderDialog.value
  dialog.error = ''

  if (dialog.mode !== 'delete' && !dialog.name.trim()) {
    dialog.error = '分类名称不能为空'
    return
  }

  dialog.busy = true

  try {
    if (dialog.mode === 'create') {
      const { json } = await apiFetch(FOLDERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dialog.name })
      })

      if (json.code !== 0) throw new Error(json.message || '创建失败')
      await fetchFolders()
      activeFolderId.value = json.data.id
      mobileView.value = 'notes'
      closeFolderDialog(true)
      return
    }

    if (dialog.mode === 'rename') {
      const { json } = await apiFetch(`${FOLDERS_API}/${dialog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dialog.name })
      })

      if (json.code !== 0) throw new Error(json.message || '保存失败')
      await fetchFolders()
      closeFolderDialog(true)
      return
    }

    if (dialog.mode === 'delete') {
      const { json } = await apiFetch(`${FOLDERS_API}/${dialog.id}`, {
        method: 'DELETE'
      })

      if (json.code !== 0) throw new Error(json.message || '删除失败')
      await fetchWorkspace()
      if (activeFolderId.value === dialog.id) activeFolderId.value = 'uncategorized'
      if (currentNote.value && currentNote.value.folder_id === dialog.id) {
        currentNote.value = { ...currentNote.value, folder_id: null, folder_name: null }
      }
      closeFolderDialog(true)
    }
  } catch (err) {
    if (err.message !== 'unauthorized') dialog.error = err.message || '操作失败'
    dialog.busy = false
  }
}

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkSession()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(saveTimer)
})
</script>
