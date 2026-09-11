<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useReveal } from '@/composables/useReveal'
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingPhoto as Photo } from '@/types/photo'
import type { WeddingConfig } from '@/types/wedding'
import { createWeddingNavigationUrl, openWeddingNavigation } from '@/utils/navigation'

const props = defineProps<{ config: WeddingConfig; photo: Photo }>()
const content = ref<HTMLElement | null>(null)
const navigationUrl = computed(() => createWeddingNavigationUrl(props.config.venue, navigator.userAgent, navigator.maxTouchPoints))
let cancelNavigation: (() => void) | undefined
useReveal(content)

function navigate(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  cancelNavigation?.()
  cancelNavigation = openWeddingNavigation(props.config.venue)
}

onBeforeUnmount(() => cancelNavigation?.())
</script>

<template>
  <section id="wedding-day" class="wedding-section details" aria-labelledby="details-title">
    <div ref="content" class="section-content reveal">
      <div class="details__heading">
        <p class="eyebrow">{{ config.copy.detailsEyebrow }}</p>
        <h2 id="details-title" class="section-heading">{{ config.copy.detailsTitle }}</h2>
      </div>
      <div class="details__date">
        <span class="details__date-large" aria-hidden="true">{{ config.dateISO.slice(5, 7) }}<em>/</em>{{ config.dateISO.slice(8, 10) }}</span>
        <div class="details__date-copy"><time :datetime="config.dateISO">{{ config.dateLong }}</time><span>{{ config.weekday }} · {{ config.time }}</span></div>
      </div>
      <WeddingPhoto class="details__photo" :photo="photo" sizes="(max-width: 560px) 88vw, 488px" />
      <dl class="details__info">
        <div class="details__row">
          <dt>婚礼时间<span>WHEN</span></dt>
          <dd><time :datetime="`${config.dateISO}T${config.time24}:00+08:00`">{{ config.time24 }}</time><span class="details__time-note">{{ config.time }}</span></dd>
        </div>
        <div class="details__row details__row--venue">
          <dt>婚礼地点<span>WHERE</span></dt>
          <dd>{{ config.venue.name }}<p class="details__address">{{ config.venue.address }}</p></dd>
        </div>
      </dl>
      <a class="details__navigation" :href="navigationUrl" :aria-label="`导航到${config.venue.name}`" @click="navigate">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>
        <span>{{ config.copy.navigationLabel }}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </div>
    <SectionFooter :page="3" href="#see-you" label="赴一场幸福之约" />
  </section>
</template>

<style scoped lang="scss">
.details {
  background: var(--wedding-bg);
}

.details__heading {
  text-align: center;
}

.details__heading .eyebrow {
  color: var(--wedding-muted);
}

.details__date {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 22px;
  margin: 24px 0;
}

.details__date-large {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  font-size: clamp(3.3rem, 14vw, 4.5rem);
  line-height: 1;
  font-variant-numeric: lining-nums;
}

.details__date-large em {
  padding: 0 10px;
  color: #84969a;
  font-size: .65em;
  font-weight: 400;
}

.details__date-copy {
  display: grid;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: .8125rem;
  line-height: 1.5;
}

.details__date-copy span {
  color: var(--wedding-muted);
}

.details__photo {
  width: 100%;
  aspect-ratio: 1600 / 591;
  margin-bottom: 8px;
}

.details__info {
  margin: 0;
}

.details__row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 14px;
  padding-block: 23px;
  border-bottom: 1px solid var(--wedding-line);
}

.details__row dt {
  font-size: .875rem;
  line-height: 1.5;
}

.details__row dt span {
  display: block;
  margin-top: 5px;
  font-family: var(--font-sans);
  font-size: .75rem;
  color: var(--wedding-muted);
  letter-spacing: .1em;
}

.details__row dd {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.details__row dd time {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1.25;
}

.details__time-note {
  display: inline-block;
  margin-left: 14px;
  font-size: .875rem;
  color: var(--wedding-muted);
}

.details__address {
  margin: 9px 0 0;
  font-size: .875rem;
  color: var(--wedding-muted);
  line-height: 1.9;
}

.details__navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 54px;
  margin-top: 24px;
  padding: 13px;
  border: 1px solid #cdbda9;
  background: #e8dfd2;
  color: #665342;
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: .875rem;
  line-height: 1.6;
  transition: background 200ms ease;
}

.details__navigation:hover {
  background: #ddd0bd;
}

.details__navigation svg {
  flex-shrink: 0;
}

.details__navigation > span:last-child {
  margin-left: auto;
  font-size: 1.3rem;
}

@media (max-width: 370px) {
  .details__date {
    gap: 14px;
  }
  .details__date-copy {
    font-size: .75rem;
  }
  .details__row {
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
