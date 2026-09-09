<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig; coverSrc: string }>()

const content = ref<HTMLElement | null>(null)
useReveal(content)
</script>

<template>
  <section id="see-you" class="wedding-section closing" aria-labelledby="closing-title">
    <div ref="content" class="section-shell reveal closing__content">
      <img
        class="closing__photo"
        :src="coverSrc"
        :alt="`${config.couple.groom}与${config.couple.bride}的婚纱照`"
        loading="lazy"
        width="1500"
        height="2000"
      />
      <h2 id="closing-title">{{ config.copy.closingTitle }}</h2>
      <p class="closing__names">
        {{ config.couple.groom }} <span aria-hidden="true">&amp;</span> {{ config.couple.bride }}
      </p>
      <p class="eyebrow closing__eyebrow">{{ config.copy.closingEyebrow }}</p>
      <p class="closing__date">
        <time :datetime="config.dateISO">{{ config.dateShort }}</time>
      </p>
    </div>
    <div class="section-footer closing__footer">
      <span aria-label="第 4 页，共 4 页">04 / 04</span>
      <a class="page-turn" href="#cover">回到封面</a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.closing {
  color: var(--wedding-bg);
  background: var(--wedding-deep);
}

.closing__content {
  place-self: center;
  text-align: center;
}

.closing__photo {
  width: min(56vw, 236px);
  height: min(36vh, 300px);
  height: min(36dvh, 300px);
  margin: 0 auto 36px;
  border: 6px solid var(--wedding-bg);
  object-fit: cover;
  object-position: center 45%;
}

h2 {
  margin: 0;
  font-size: clamp(27px, 7vw, 31px);
  font-weight: 400;
  letter-spacing: 0.1em;
}

.closing__names {
  margin: 22px 0 30px;
  font-size: 16px;
  letter-spacing: 0.08em;
}

.closing__names span {
  margin-inline: 6px;
  font-family: var(--font-display);
  font-style: italic;
}

.closing__eyebrow {
  color: #bacdd4;
  font-size: 9px;
}

.closing__date {
  margin: 14px 0 0;
  color: #bacdd4;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.16em;
}

.closing__footer {
  color: #bacdd4;
}

@media (max-height: 680px) {
  .closing__photo {
    height: 31vh;
    height: 31dvh;
    margin-bottom: 24px;
  }

  .closing__names {
    margin-block: 18px 24px;
  }
}
</style>
