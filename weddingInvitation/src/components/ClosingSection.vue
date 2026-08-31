<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig }>()

const content = ref<HTMLElement | null>(null)
useReveal(content)
</script>

<template>
  <section class="closing" aria-labelledby="closing-title">
    <div ref="content" class="section-shell reveal closing__content">
      <h2 id="closing-title">{{ config.copy.closingTitle }}</h2>
      <p class="closing__names">
        {{ config.couple.groom }} <span aria-hidden="true">&amp;</span> {{ config.couple.bride }}
      </p>
      <p class="eyebrow closing__eyebrow">{{ config.copy.closingEyebrow }}</p>
      <p class="closing__date">
        <time :datetime="config.dateISO">{{ config.dateShort }}</time>
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.closing {
  display: grid;
  min-height: 72vh;
  padding-top: 72px;
  padding-bottom: max(40px, env(safe-area-inset-bottom));
  background: var(--wedding-bg);
}

@supports (min-height: 100svh) {
  .closing {
    min-height: 72svh;
  }
}

.closing__content {
  place-self: center;
  text-align: center;
}

h2 {
  margin: 0;
  font-size: clamp(27px, 7vw, 31px);
  font-weight: 400;
}

.closing__names {
  margin: 34px 0;
  font-size: 18px;
}

.closing__eyebrow {
  color: var(--wedding-muted);
}

.closing__date {
  margin: 18px 0 0;
  color: var(--wedding-muted);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.16em;
}
</style>
