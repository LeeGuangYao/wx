<script setup lang="ts">
import type { WeddingPhoto } from '@/types/photo'

withDefaults(defineProps<{ photo: WeddingPhoto; sizes?: string; priority?: boolean }>(), {
  sizes: '(max-width: 560px) 100vw, 560px',
  priority: false,
})
</script>

<template>
  <picture class="wedding-photo">
    <source type="image/webp" :srcset="photo.srcSet" :sizes="sizes" />
    <img
      :src="photo.src"
      :alt="photo.alt"
      :width="photo.width"
      :height="photo.height"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      decoding="async"
      :style="{ objectPosition: photo.position ?? 'center' }"
    />
  </picture>
</template>

<style scoped>
.wedding-photo {
  display: block;
  overflow: hidden;
  background: var(--wedding-surface);
}

.wedding-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
