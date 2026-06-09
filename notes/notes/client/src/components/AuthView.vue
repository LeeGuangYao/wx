<template>
  <div v-if="checking" class="auth-screen">
    <div class="auth-panel">
      <p class="auth-eyebrow">Private Notes</p>
      <h1>备忘录</h1>
      <p class="auth-copy">正在确认登录状态...</p>
    </div>
  </div>

  <form v-else class="auth-screen" @submit.prevent="$emit('login')">
    <div class="auth-panel">
      <p class="auth-eyebrow">Private Notes</p>
      <h1>备忘录</h1>
      <p class="auth-copy">登录后继续记录。</p>

      <label class="auth-field">
        <span>用户名</span>
        <input
          type="text"
          :value="username"
          autocomplete="username"
          placeholder="请输入用户名"
          required
          @input="$emit('update:username', $event.target.value.trim())"
        >
      </label>

      <label class="auth-field">
        <span>密码</span>
        <input
          type="password"
          :value="password"
          autocomplete="current-password"
          placeholder="请输入密码"
          required
          @input="$emit('update:password', $event.target.value)"
        >
      </label>

      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="primary-button auth-submit" type="submit" :disabled="busy">
        {{ busy ? '登录中...' : '登录' }}
      </button>
    </div>
  </form>
</template>

<script setup>
defineProps({
  checking: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  busy: {
    type: Boolean,
    default: false
  }
})

defineEmits(['login', 'update:username', 'update:password'])
</script>
