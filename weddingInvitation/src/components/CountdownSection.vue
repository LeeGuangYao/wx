<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { WeddingConfig } from '@/types/wedding'
import type { WeddingPhoto as Photo } from '@/types/photo'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import SectionFooter from '@/components/SectionFooter.vue'
import { getCountdown } from '@/utils/countdown'

const props = defineProps<{ config: WeddingConfig; photos: readonly [Photo, Photo] }>()

// 显式使用北京时间，避免访客所在时区改变婚礼时刻。
const target = computed(() => Date.parse(`${props.config.dateISO}T${props.config.time24}:00+08:00`))
const remaining = ref(getCountdown(target.value))
const units = [
  { key: 'days', label: '天', english: 'DAYS' },
  { key: 'hours', label: '时', english: 'HOURS' },
  { key: 'minutes', label: '分', english: 'MINUTES' },
  { key: 'seconds', label: '秒', english: 'SECONDS' },
] as const
let timer: ReturnType<typeof setInterval> | undefined

function updateCountdown(): void {
  const now = Date.now()
  remaining.value = getCountdown(target.value, now)
  if (now >= target.value) clearInterval(timer)
}

function handleVisibilityChange(): void {
  if (!document.hidden) updateCountdown()
}

onMounted(() => {
  updateCountdown()
  if (Date.now() < target.value) timer = setInterval(updateCountdown, 1000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section id="countdown" class="wedding-section countdown" aria-labelledby="countdown-title">
    <div class="section-content countdown__content">
      <p class="eyebrow countdown__eyebrow">Every moment, with you</p>
      <div class="countdown__photos">
        <figure class="countdown__photo countdown__photo--first">
          <WeddingPhoto :photo="photos[0]" sizes="(max-width: 560px) 48vw, 270px" />
          <figcaption>相伴的每一刻</figcaption>
        </figure>
        <figure class="countdown__photo countdown__photo--second">
          <WeddingPhoto :photo="photos[1]" sizes="(max-width: 560px) 42vw, 235px" />
          <figcaption>都想与你珍藏</figcaption>
        </figure>
      </div>
      <div class="countdown__heading">
        <p class="countdown__script" aria-hidden="true">Counting down to forever.</p>
        <h2 id="countdown-title" class="section-heading">{{ config.copy.countdownTitle }}</h2>
      </div>
      <p class="countdown__prefix">{{ config.copy.countdownPrefix }}</p>
      <div class="countdown__grid" role="timer" aria-live="off" aria-label="距离婚礼的剩余时间">
        <div v-for="unit in units" :key="unit.key" class="countdown__unit">
          <div class="countdown__number">{{ remaining[unit.key] }}</div>
          <div class="countdown__label">{{ unit.label }} <span>{{ unit.english }}</span></div>
        </div>
      </div>
      <p class="countdown__date"><time :datetime="`${config.dateISO}T${config.time24}:00+08:00`">{{ config.dateShort }} · {{ config.time24 }}</time><span>北京时间</span></p>
    </div>
    <SectionFooter :page="2" href="#wedding-day" label="婚礼时间与地点" />
  </section>
</template>

<style scoped lang="scss">
.countdown {
  --wedding-line: #cbd7d8;
  color: var(--wedding-text);
  background: #edf3f3;
  text-align: center;
}

.countdown__eyebrow {
  color: var(--wedding-muted);
  text-align: left;
  letter-spacing: .15em;
}

.countdown__photos {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: start;
  gap: 18px;
  margin-top: 24px;
}

.countdown__photo {
  min-width: 0;
  margin: 0;
  text-align: left;
}

.countdown__photo .wedding-photo {
  width: 100%;
  aspect-ratio: 3 / 4;
}

.countdown__photo--second {
  margin-top: 36px;
}

.countdown__photo figcaption {
  margin-top: 10px;
  font-size: .75rem;
  color: var(--wedding-muted);
  letter-spacing: .12em;
}

.countdown__heading {
  margin-top: 26px;
}

.countdown__script {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 6.5vw, 2rem);
  font-style: italic;
}

.countdown .section-heading {
  margin-top: 10px;
  font-size: clamp(1.55rem, 6.5vw, 2rem);
}

.countdown__prefix {
  margin: 18px 0 14px;
  color: var(--wedding-muted);
  font-size: .875rem;
}

.countdown__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-block: 16px 18px;
  border-block: 1px solid var(--wedding-line);
}

.countdown__unit + .countdown__unit {
  border-left: 1px solid var(--wedding-line);
}

.countdown__number {
  font-family: var(--font-display);
  font-size: clamp(2rem, 10vw, 3.1rem);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.countdown__label {
  margin-top: 10px;
  font-size: .75rem;
  color: var(--wedding-muted);
}

.countdown__label span {
  display: block;
  margin-top: 4px;
  font-family: var(--font-sans);
  font-size: .75rem;
  letter-spacing: .04em;
}

.countdown__date {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0 0;
  color: var(--wedding-muted);
  font-family: var(--font-sans);
  font-size: .75rem;
  letter-spacing: .06em;
}

@media (max-height: 720px) {
  .countdown__photos {
    max-width: 310px;
    margin-inline: auto;
    gap: 14px;
  }
  .countdown__heading {
    margin-top: 20px;
  }
}
</style>
