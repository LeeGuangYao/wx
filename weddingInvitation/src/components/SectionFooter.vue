<script setup lang="ts">
withDefaults(defineProps<{ page: number; total?: number; href: string; label: string; previousHref?: string; locked?: boolean }>(), {
  total: 5,
  locked: false,
})
</script>

<template>
  <div class="section-footer">
    <span :aria-label="`第 ${page} 页，共 ${total} 页`">{{ String(page).padStart(2, '0') }} <span class="section-footer__slash">/</span> {{ String(total).padStart(2, '0') }}</span>
    <nav v-if="!locked" class="section-footer__links" aria-label="请柬翻页">
      <a v-if="previousHref" class="page-turn page-turn--previous" :href="previousHref" aria-label="上一页">↑</a>
      <a class="page-turn" :href="href">
      {{ label }}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path :d="page === total ? 'M12 20V4m-6 6 6-6 6 6' : 'M12 4v16m-6-6 6 6 6-6'" stroke="currentColor" stroke-width="1.2" />
      </svg>
      </a>
    </nav>
    <span v-else class="section-footer__hint">拆开信封，开启请柬</span>
  </div>
</template>
