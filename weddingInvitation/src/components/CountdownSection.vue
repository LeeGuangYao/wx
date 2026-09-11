<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { WeddingConfig } from '@/types/wedding'



import { getCountdown } from '@/utils/countdown'

const props = defineProps<{ config: WeddingConfig }>()

// 显式使用北京时间，避免访客所在时区改变婚礼时刻。
const target = computed(() => Date.parse(`${props.config.dateISO}T${props.config.time24}:00+08:00`))
const remaining = ref(getCountdown(target.value))
const units = [
  { key: 'days', label: '天' },
  { key: 'hours', label: '时' },
  { key: 'minutes', label: '分' },
  { key: 'seconds', label: '秒' },
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
  <div id="countdown" class="countdown" aria-labelledby="countdown-title">
    <h3 id="countdown-title" class="countdown__heading">{{ config.copy.countdownTitle }}</h3>
    <div class="countdown__grid" role="timer" aria-live="off" aria-label="距离婚礼的剩余时间">
      <div v-for="unit in units" :key="unit.key" class="countdown__unit">
        <span class="countdown__number">{{ remaining[unit.key] }}</span>
        <span class="countdown__label">{{ unit.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.countdown {
  margin-top: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--wedding-line);
  text-align: center;
}
.countdown__heading {
  margin: 0 0 10px;
  color: var(--wedding-muted);
  font-size: .8125rem;
  font-weight: 400;
  letter-spacing: .08em;
}
.countdown__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.countdown__unit {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}
.countdown__unit + .countdown__unit {
  border-left: 1px solid var(--wedding-line);
}
.countdown__number {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 6.5vw, 2rem);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.countdown__label {
  color: var(--wedding-muted);
  font-size: .6875rem;
}
</style>
