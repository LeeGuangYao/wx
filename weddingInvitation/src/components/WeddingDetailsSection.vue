<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import SectionFooter from '@/components/SectionFooter.vue'
import CountdownSection from '@/components/CountdownSection.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingPhoto as Photo } from '@/types/photo'
import type { WeddingConfig } from '@/types/wedding'
import { createWeddingNavigationUrl, openWeddingNavigation } from '@/utils/navigation'

const props = defineProps<{ config: WeddingConfig; photo: Photo; active: boolean }>()
const navigationUrl = computed(() => createWeddingNavigationUrl(props.config.venue, navigator.userAgent, navigator.maxTouchPoints))
let cancelNavigation: (() => void) | undefined

function navigate(event: MouseEvent): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  cancelNavigation?.()
  cancelNavigation = openWeddingNavigation(props.config.venue)
}

onBeforeUnmount(() => cancelNavigation?.())
</script>

<template>
  <section id="wedding-day" class="wedding-section details" aria-labelledby="details-title">
    <div class="details__scroll" data-page-scroll>
    <div class="section-content">
      <h2 id="details-title" class="section-heading details__heading" data-page-title tabindex="-1">{{ config.copy.detailsTitle }}</h2>
      <p class="section-description details__description">{{ config.copy.detailsDescription }}</p>
      <div class="details__date">
        <span class="details__date-large" aria-hidden="true">{{ config.dateISO.slice(5, 7) }}<em>/</em>{{ config.dateISO.slice(8, 10) }}</span>
        <div class="details__date-copy"><time :datetime="config.dateISO">{{ config.dateLong }}</time><span>{{ config.weekday }}</span></div>
      </div>
      <WeddingPhoto class="details__photo" :photo="photo" :active="active" fit="contain" motion="fade" :duration="1100" sizes="(max-width: 560px) 88vw, 488px" />
      <CountdownSection :config="config" />
      <dl class="details__info">
        <div class="details__row">
          <dt>时间</dt>
          <dd><time :datetime="`${config.dateISO}T${config.time24}:00+08:00`">{{ config.time24 }}</time><span class="details__time-note">北京时间</span></dd>
        </div>
        <div class="details__row">
          <dt>地点</dt>
          <dd>{{ config.venue.name }}<p class="details__address">{{ config.venue.address }}</p></dd>
        </div>
      </dl>
      <a id="navigation" class="details__navigation" :href="navigationUrl" :aria-label="`导航到${config.venue.name}`" @click="navigate">
        <span>{{ config.copy.navigationLabel }}</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path d="m5 19 14-14M5 5h14v14" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </a>
    </div>
    </div>
    <SectionFooter :page="5" href="#cover" previous-href="#our-forever" label="回到封面" />
  </section>
</template>

<style scoped lang="scss">
.details {
  background: var(--wedding-bg);
}
.details__scroll { display: flex; flex: 1; min-height: 0; flex-direction: column; }
.details .section-content { flex-shrink: 0; padding-block: 4px 18px; }
.details__description { text-align: center; }
.details__heading {
  margin-top: 0;
  text-align: center;
}
.details__date {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin: 16px 0;
}
.details__date-large {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 12vw, 3.8rem);
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
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: baseline;
  gap: 14px;
  padding-block: 12px;
  border-bottom: 1px solid var(--wedding-line);
}
.details__row dt {
  color: var(--wedding-muted);
  font-size: .875rem;
  line-height: 1.5;
}
.details__row dd {
  margin: 0;
  font-size: 1rem;
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
  font-size: .75rem;
  color: var(--wedding-muted);
}
.details__address {
  margin: 6px 0 0;
  color: var(--wedding-muted);
  font-size: .875rem;
  line-height: 1.6;
}
.details__navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 48px;
  margin-top: 14px;
  padding: 13px 20px;
  border: 1px solid #cdbda9;
  background: #e8dfd2;
  color: var(--wedding-text);
  font-size: 1rem;
  text-decoration: none;
  letter-spacing: .1em;
  transition: background 200ms ease;
}
.details__navigation:hover {
  background: #ddd0bd;
}
.details__navigation svg {
  flex-shrink: 0;
}
@media (max-height: 740px) {
  .details__date { margin-block: 10px; }
  .details__date-large { font-size: 2.75rem; }
  .details__row { padding-block: 8px; }
  .details__navigation { margin-top: 10px; padding-block: 10px; }
  .details__heading { font-size: 1.65rem; }
}
</style>
