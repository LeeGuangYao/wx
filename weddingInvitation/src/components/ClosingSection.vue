<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingPhoto as Photo } from '@/types/photo'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig; photos: readonly [Photo, Photo, Photo] }>()
const content = ref<HTMLElement | null>(null)
useReveal(content)
</script>

<template>
  <section id="see-you" class="wedding-section closing" aria-labelledby="closing-title">
    <div ref="content" class="section-content reveal closing__content">
      <p class="eyebrow">With love, always</p>
      <div class="closing__gallery">
        <WeddingPhoto class="closing__photo closing__photo--main" :photo="photos[0]" sizes="(max-width: 560px) 50vw, 280px" />
        <WeddingPhoto class="closing__photo" :photo="photos[1]" sizes="(max-width: 560px) 34vw, 190px" />
        <WeddingPhoto class="closing__photo" :photo="photos[2]" sizes="(max-width: 560px) 34vw, 190px" />
      </div>
      <p class="closing__script" aria-hidden="true">You are invited.</p>
      <h2 id="closing-title" class="section-heading">{{ config.copy.closingTitle }}</h2>
      <div class="closing__invitation">
        <template v-for="(line, index) in config.copy.invitationLines" :key="index">
          <p v-if="line">{{ line }}</p>
          <div v-else class="closing__spacer" aria-hidden="true" />
        </template>
      </div>
      <p class="closing__names">{{ config.couple.groom }}<span aria-hidden="true">&amp;</span>{{ config.couple.bride }}</p>
      <p class="closing__date"><time :datetime="config.dateISO">{{ config.dateShort }}</time></p>
    </div>
    <SectionFooter :page="4" href="#cover" label="回到封面" />
  </section>
</template>

<style scoped lang="scss">
.closing {
  background: #e5eceb;
}

.closing__content {
  text-align: center;
}

.closing__content > .eyebrow {
  text-align: left;
  color: var(--wedding-muted);
}

.closing__gallery {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: clamp(240px, 32svh, 320px);
  margin: 22px 0 28px;
}

.closing__photo {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.closing__photo--main {
  grid-row: span 2;
}

.closing__script {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 9vw, 2.8rem);
  font-style: italic;
  line-height: 1.2;
}

.closing .section-heading {
  margin-top: 10px;
  font-size: clamp(1.7rem, 7vw, 2rem);
}

.closing__invitation {
  margin-top: 20px;
  font-size: 1rem;
  line-height: 1.9;
  letter-spacing: .04em;
}

.closing__invitation p {
  margin: 0;
}

.closing__spacer {
  height: 10px;
}

.closing__names {
  margin: 22px 0 0;
  font-size: 1rem;
  letter-spacing: .08em;
}

.closing__names span {
  margin-inline: 12px;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--wedding-muted);
}

.closing__date {
  margin: 10px 0 0;
  color: var(--wedding-muted);
  font-family: var(--font-sans);
  font-size: .75rem;
  letter-spacing: .16em;
}

@media (max-height: 720px) {
  .closing__gallery {
    height: 230px;
    margin-block: 18px 22px;
  }
}
</style>
