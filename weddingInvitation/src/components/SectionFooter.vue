<script setup lang="ts">
defineProps<{ page: number; href: string; label: string }>()
</script>

<template>
  <div class="section-footer">
    <span :aria-label="`第 ${page} 页，共 4 页`">0{{ page }} <span class="section-footer__slash">/</span> 04</span>
    <a class="page-turn" :href="href">
      {{ label }}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path :d="page === 4 ? 'M12 20V4m-6 6 6-6 6 6' : 'M12 4v16m-6-6 6 6 6-6'" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </a>
  </div>
</template>
