<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig }>()

const content = ref<HTMLElement | null>(null)
useReveal(content)
</script>

<template>
  <section class="invitation" aria-labelledby="invitation-title">
    <div ref="content" class="section-shell reveal invitation__content">
      <p class="eyebrow">{{ config.copy.invitationEyebrow }}</p>
      <h2 id="invitation-title">{{ config.copy.invitationTitle }}</h2>
      <div class="invitation__copy">
        <template v-for="(line, index) in config.copy.invitationLines" :key="index">
          <p v-if="line">{{ line }}</p>
          <div v-else class="invitation__spacer" aria-hidden="true" />
        </template>
      </div>
      <p class="invitation__date">
        <time :datetime="config.dateISO">{{ config.dateSlash }}</time>
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.invitation {
  display: grid;
  min-height: 88vh;
  min-height: 88svh;
  padding-block: clamp(96px, 18vh, 144px);
  background: var(--wedding-bg);
}

.invitation__content {
  place-self: center;
  text-align: center;
}

h2 {
  margin: 28px 0 36px;
  font-size: clamp(28px, 7.2vw, 32px);
  font-weight: 400;
}

.invitation__copy p {
  margin: 0;
  font-size: clamp(15px, 4.1vw, 17px);
  line-height: 2;
}

.invitation__spacer {
  height: 20px;
}

.invitation__date {
  margin: 42px 0 0;
  color: var(--wedding-muted);
  font-family: var(--font-sans);
  font-size: 13px;
  letter-spacing: 0.14em;
}
</style>
