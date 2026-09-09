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
  <section id="wedding-day" class="wedding-section details" aria-labelledby="details-title">
    <div ref="content" class="section-shell reveal details__content">
      <p class="eyebrow">{{ config.copy.detailsEyebrow }}</p>
      <div class="details__date-group">
        <h2 id="details-title" class="details__date">
          <time :datetime="config.dateISO" :aria-label="config.dateLong">
            {{ config.dateISO.slice(5, 7) }}<span aria-hidden="true"> / </span>{{ config.dateISO.slice(8, 10) }}
          </time>
        </h2>
        <p class="details__year">{{ config.dateISO.slice(0, 4) }}</p>
        <p class="details__time">{{ config.weekday }} · {{ config.time }}</p>
      </div>
      <div class="details__venue-group">
        <p class="details__venue-label">婚礼地点</p>
        <h3>{{ config.venue.name }}</h3>
        <address>{{ config.venue.address }}</address>
        <button
          class="details__navigation"
          type="button"
          :aria-label="`在高德地图中搜索${config.venue.name}`"
          @click="navigate"
        >
          {{ config.copy.navigationLabel }}
        </button>
      </div>
    </div>
    <div class="section-footer">
      <span aria-label="第 3 页，共 4 页">03 / 04</span>
      <a class="page-turn" href="#see-you">赴一场幸福之约</a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.details {
  background: var(--wedding-surface);
}

.details__content {
  place-self: center;
  text-align: center;
}

.details__date-group {
  margin-top: 30px;
}

.details__date-group h2,
.details__venue-group h3 {
  margin: 0;
  font-weight: 400;
}

.details__date-group h2 {
  font-family: var(--font-display);
  font-size: clamp(64px, 18vw, 84px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.details__date span {
  display: inline-block;
  margin-inline: 6px;
  color: #8ba6b3;
  font-size: 0.65em;
  vertical-align: 0.08em;
}

.details__year {
  margin: 14px 0 0;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.32em;
}

.details__time {
  margin: 24px 0 0;
  font-size: 16px;
  letter-spacing: 0.1em;
}

.details__venue-group {
  margin-top: 36px;
  padding: 28px 22px 22px;
  border: 1px solid var(--wedding-line);
  background: rgba(248, 249, 245, 0.72);
}

.details__venue-label {
  margin: 0 0 18px;
  color: var(--wedding-muted);
  font-size: 11px;
  letter-spacing: 0.24em;
}

.details__venue-group h3 {
  font-size: clamp(18px, 4.8vw, 21px);
  line-height: 1.5;
}

.details__venue-group address {
  margin-top: 14px;
  color: var(--wedding-muted);
  font-size: 13px;
  font-style: normal;
  line-height: 1.7;
}

.details__navigation {
  width: 100%;
  min-height: 48px;
  margin-top: 26px;
  border: 1px solid var(--wedding-deep);
  border-radius: 0;
  color: var(--wedding-bg);
  background: var(--wedding-deep);
  font-size: 14px;
  letter-spacing: 0.16em;
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

@media (max-height: 680px) {
  .details__date-group {
    margin-top: 20px;
  }

  .details__date-group h2 {
    font-size: 60px;
  }

  .details__time {
    margin-top: 18px;
  }

  .details__venue-group {
    margin-top: 24px;
    padding: 20px 18px 18px;
  }

  .details__navigation {
    margin-top: 20px;
  }
}
</style>
