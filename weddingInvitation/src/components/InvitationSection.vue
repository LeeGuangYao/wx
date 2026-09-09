<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig }>()

const content = ref<HTMLElement | null>(null)
useReveal(content)
</script>

<template>
  <section id="invitation" class="wedding-section invitation" aria-labelledby="invitation-title">
    <div ref="content" class="section-shell reveal invitation__content">
      <p class="eyebrow">{{ config.copy.invitationEyebrow }}</p>
      <p class="invitation__flourish" aria-hidden="true">&amp;</p>
      <h2 id="invitation-title">{{ config.copy.invitationTitle }}</h2>
      <div class="invitation__copy">
        <template v-for="(line, index) in config.copy.invitationLines" :key="index">
          <p v-if="line">{{ line }}</p>
          <div v-else class="invitation__spacer" aria-hidden="true" />
        </template>
      </div>
      <p class="invitation__names">
        {{ config.couple.groom }} <span aria-hidden="true">&amp;</span> {{ config.couple.bride }}
      </p>
      <p class="invitation__date">
        <time :datetime="config.dateISO">{{ config.dateSlash }}</time>
      </p>
    </div>
    <div class="section-footer">
      <span aria-label="第 2 页，共 4 页">02 / 04</span>
      <a class="page-turn" href="#wedding-day">婚礼时间与地点</a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.invitation {
  background: var(--wedding-bg);
}

.invitation::before {
  position: absolute;
  inset: 20px 16px 72px;
  border: 1px solid var(--wedding-line);
  content: '';
  pointer-events: none;
}

.invitation__content {
  place-self: center;
  text-align: center;
}

.invitation__flourish {
  margin: 24px 0 0;
  color: #9eb6c0;
  font-family: var(--font-display);
  font-size: 80px;
  font-style: italic;
  line-height: 1;
}

h2 {
  margin: 18px 0 30px;
  font-size: clamp(29px, 8vw, 36px);
  font-weight: 400;
  letter-spacing: 0.12em;
}

.invitation__copy p {
  margin: 0;
  font-size: clamp(15px, 4vw, 17px);
  line-height: 2.1;
  letter-spacing: 0.07em;
}

.invitation__spacer {
  height: 18px;
}

.invitation__names {
  margin: 30px 0 0;
  font-size: 16px;
  letter-spacing: 0.1em;
}

.invitation__names span {
  margin-inline: 8px;
  color: var(--wedding-muted);
  font-family: var(--font-display);
  font-style: italic;
}

.invitation__date {
  margin: 16px 0 0;
  color: var(--wedding-muted);
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.2em;
}

@media (max-height: 680px) {
  .invitation::before {
    inset-block: 14px 60px;
  }

  .invitation__flourish {
    margin-top: 16px;
    font-size: 52px;
  }

  h2 {
    margin-block: 14px 20px;
  }

  .invitation__names {
    margin-top: 20px;
  }
}
</style>
