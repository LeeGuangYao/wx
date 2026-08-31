<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import type { WeddingConfig } from '@/types/wedding'
import { openWeddingNavigation } from '@/utils/navigation'

const props = defineProps<{ config: WeddingConfig }>()

const content = ref<HTMLElement | null>(null)
useReveal(content)

function navigate(): void {
  openWeddingNavigation(props.config.venue)
}
</script>

<template>
  <section class="details" aria-labelledby="details-title">
    <div ref="content" class="section-shell reveal details__content">
      <p class="eyebrow">{{ config.copy.detailsEyebrow }}</p>
      <div class="details__date-group">
        <h2 id="details-title">
          <time :datetime="config.dateISO">{{ config.dateLong }}</time>
          <span aria-hidden="true"> · </span>{{ config.weekday }}
        </h2>
        <p>{{ config.time }}</p>
      </div>
      <div class="details__divider" aria-hidden="true" />
      <div class="details__venue-group">
        <h3>{{ config.venue.name }}</h3>
        <address>{{ config.venue.address }}</address>
      </div>
      <button
        class="details__navigation"
        type="button"
        :aria-label="`在高德地图中搜索${config.venue.name}`"
        @click="navigate"
      >
        导航前往
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.details {
  display: grid;
  min-height: 96vh;
  min-height: 96svh;
  padding-block: clamp(96px, 16vh, 136px);
  background: var(--wedding-surface);
}

.details__content {
  place-self: center;
  text-align: center;
}

.details__date-group {
  margin-top: 34px;
}

.details__date-group h2,
.details__venue-group h3 {
  margin: 0;
  font-weight: 400;
}

.details__date-group h2 {
  font-size: clamp(24px, 6.7vw, 30px);
  line-height: 1.55;
}

.details__date-group p {
  margin: 12px 0 0;
  font-size: 17px;
}

.details__divider {
  width: 48px;
  height: 1px;
  margin: 42px auto;
  background: var(--wedding-line);
}

.details__venue-group h3 {
  font-size: 22px;
}

.details__venue-group address {
  margin-top: 12px;
  color: var(--wedding-muted);
  font-size: 15px;
  font-style: normal;
  line-height: 1.7;
}

.details__navigation {
  min-width: 160px;
  min-height: 44px;
  margin-top: 40px;
  border: 1px solid var(--wedding-text);
  border-radius: 8px;
  color: var(--wedding-text);
  background: transparent;
  cursor: pointer;
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.details__navigation:active {
  opacity: 0.72;
  transform: scale(0.98);
}

.details__navigation:focus-visible {
  outline: 2px solid var(--wedding-text);
  outline-offset: 4px;
}
</style>
