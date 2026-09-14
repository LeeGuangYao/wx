<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { WeddingPhoto } from '@/types/photo'

const props = withDefaults(defineProps<{
  photo: WeddingPhoto
  sizes?: string
  priority?: boolean
  delay?: number
  duration?: number
  motion?: 'reveal' | 'drift-left' | 'drift-right' | 'unveil-right' | 'unveil-up' | 'float-up' | 'settle-left' | 'settle-right' | 'soft-zoom' | 'cinematic' | 'fade'
  active?: boolean
  fit?: 'cover' | 'contain'
}>(), {
  sizes: '(max-width: 560px) 100vw, 560px',
  priority: false,
  delay: 0,
  motion: 'reveal',
  active: true,
  fit: 'cover',
})

const picture = ref<HTMLPictureElement | null>(null)
const image = ref<HTMLImageElement | null>(null)
const imageStyle = computed(() => ({
  objectPosition: props.photo.position ?? 'center',
  objectFit: props.fit,
  '--photo-motion-delay': `${Math.max(0, Number.isFinite(props.delay) ? props.delay : 0)}ms`,
  '--photo-motion-duration': props.duration !== undefined && Number.isFinite(props.duration) && props.duration > 0
    ? `${props.duration}ms`
    : undefined,
}))

let observer: IntersectionObserver | undefined
let motionPreference: MediaQueryList | undefined
let isLoaded = false
let isAboveThreshold = false
let isArmed = true
let motionDisabled = false
let documentVisible = true

function startIfReady(): void {
  if (!props.active || motionDisabled || !isArmed || !isLoaded || !isAboveThreshold || !documentVisible || motionPreference?.matches) return
  isArmed = false
  picture.value?.classList.remove('is-photo-settled')
  picture.value?.classList.add('is-photo-animating')
}

function handleLoad(): void {
  isLoaded = true
  startIfReady()
}

function showWithoutMotion(): void {
  motionDisabled = true
  observer?.disconnect()
  picture.value?.classList.remove('is-motion-ready', 'is-photo-animating', 'is-photo-settled')
}

function handleAnimationEnd(event: AnimationEvent): void {
  if (event.target !== image.value) return
  picture.value?.classList.remove('is-photo-animating')
  picture.value?.classList.add('is-photo-settled')
}

function resetForReentry(): void {
  isArmed = true
  picture.value?.classList.remove('is-photo-animating', 'is-photo-settled')
}

watch(() => props.active, active => {
  if (!active) resetForReentry()
  else startIfReady()
})

function handleMotionPreference(event: MediaQueryListEvent): void {
  const element = picture.value
  if (!element || motionDisabled) return

  if (event.matches) {
    isArmed = true
    element.classList.remove('is-motion-ready', 'is-photo-animating', 'is-photo-settled')
    return
  }

  element.classList.add('is-motion-ready')
  startIfReady()
}

function handleVisibilityChange(): void {
  documentVisible = !document.hidden
  picture.value?.classList.toggle('is-photo-paused', !documentVisible)
  if (documentVisible) startIfReady()
}

function addMotionPreferenceListener(): void {
  if (typeof motionPreference?.addEventListener === 'function') {
    motionPreference.addEventListener('change', handleMotionPreference)
  } else {
    motionPreference?.addListener(handleMotionPreference)
  }
}

function removeMotionPreferenceListener(): void {
  if (typeof motionPreference?.removeEventListener === 'function') {
    motionPreference.removeEventListener('change', handleMotionPreference)
  } else {
    motionPreference?.removeListener(handleMotionPreference)
  }
}

onMounted(() => {
  const element = picture.value
  const photo = image.value
  if (!element || !photo || !('IntersectionObserver' in window)) return

  documentVisible = !document.hidden
  motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  addMotionPreferenceListener()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  if (!motionPreference?.matches) element.classList.add('is-motion-ready')

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return
      if (!entry.isIntersecting) {
        isAboveThreshold = false
        resetForReentry()
        return
      }

      isAboveThreshold = entry.intersectionRatio >= 0.12
      startIfReady()
    },
    { threshold: [0, 0.12] },
  )
  observer.observe(element)

  if (photo.complete) {
    if (photo.naturalWidth > 0) handleLoad()
    else showWithoutMotion()
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  removeMotionPreferenceListener()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <picture
    ref="picture"
    class="wedding-photo"
    :class="[`is-motion-${props.motion}`, { 'is-photo-priority': props.priority, 'is-fit-contain': props.fit === 'contain' }]"
  >
    <source type="image/webp" :srcset="props.photo.srcSet" :sizes="props.sizes" />
    <img
      ref="image"
      :src="props.photo.src"
      :alt="props.photo.alt"
      :width="props.photo.width"
      :height="props.photo.height"
      :loading="props.priority ? 'eager' : 'lazy'"
      :fetchpriority="props.priority ? 'high' : 'auto'"
      decoding="async"
      :style="imageStyle"
      @load="handleLoad"
      @error="showWithoutMotion"
      @animationend="handleAnimationEnd"
    />
  </picture>
</template>

<style scoped>
.wedding-photo {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--wedding-surface);
}

.wedding-photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wedding-photo.is-motion-ready:not(.is-photo-animating):not(.is-photo-settled):not(.is-photo-priority) img {
  opacity: 0;
}

.wedding-photo.is-motion-ready:not(.is-photo-animating):not(.is-photo-settled).is-photo-priority img {
  transform: scale(1.04);
}

.wedding-photo.is-photo-animating:not(.is-photo-priority) img {
  animation: photo-reveal var(--photo-motion-duration, 2400ms) cubic-bezier(.25, .1, .25, 1) var(--photo-motion-delay) both;
}

.wedding-photo.is-photo-animating.is-photo-priority img {
  animation: photo-ken-burns 4800ms var(--ease-out) var(--photo-motion-delay) both;
}

.wedding-photo.is-motion-drift-left.is-photo-animating:not(.is-photo-priority) img {
  animation-name: photo-drift-left;
}

.wedding-photo.is-motion-drift-right.is-photo-animating:not(.is-photo-priority) img {
  animation-name: photo-drift-right;
}

.wedding-photo.is-photo-animating.is-photo-paused img {
  animation-play-state: paused;
}

/* Uncropped collages enter from a slightly smaller size, preserving every edge. */
.wedding-photo.is-fit-contain.is-photo-animating {
  overflow: visible;
}
.wedding-photo.is-fit-contain.is-photo-animating img {
  animation-name: photo-contained-reveal;
  animation-duration: var(--photo-motion-duration, 1400ms);
}
.wedding-photo.is-fit-contain.is-motion-drift-left.is-photo-animating img {
  animation-name: photo-contained-left;
}
.wedding-photo.is-fit-contain.is-motion-drift-right.is-photo-animating img {
  animation-name: photo-contained-right;
}
.wedding-photo.is-fit-contain.is-photo-priority:not(.is-photo-animating) img { transform: none; }

.wedding-photo.is-photo-animating.is-motion-unveil-right img { animation-name: photo-unveil-right; }
.wedding-photo.is-photo-animating.is-motion-unveil-up img { animation-name: photo-unveil-up; }
.wedding-photo.is-photo-animating.is-motion-float-up img { animation-name: photo-float-up; }
.wedding-photo.is-photo-animating.is-motion-settle-left img { animation-name: photo-settle-left; }
.wedding-photo.is-photo-animating.is-motion-settle-right img { animation-name: photo-settle-right; }
.wedding-photo.is-photo-animating.is-motion-soft-zoom img { animation-name: photo-soft-zoom; }
.wedding-photo.is-photo-animating.is-motion-cinematic img { animation-name: photo-cinematic; }
.wedding-photo.is-photo-animating.is-motion-fade img { animation-name: photo-fade; }

/* Keep the final framing when animationend removes the animation class. */
.wedding-photo.is-photo-settled.is-motion-cinematic img { transform: scale(1.025); }

@keyframes photo-unveil-right {
  from { opacity: 0; clip-path: inset(0 100% 0 0); }
  to { opacity: 1; clip-path: inset(0); }
}
@keyframes photo-unveil-up {
  from { opacity: 0; clip-path: inset(100% 0 0 0); }
  to { opacity: 1; clip-path: inset(0); }
}
@keyframes photo-float-up {
  from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.985); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-settle-left {
  from { opacity: 0; transform: translate3d(0, -10px, 0) rotate(-1.8deg) scale(.965); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-settle-right {
  from { opacity: 0; transform: translate3d(0, -10px, 0) rotate(1.8deg) scale(.965); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-soft-zoom {
  from { opacity: 0; transform: scale(.97); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-cinematic {
  from { opacity: 0; transform: scale(1); }
  60% { opacity: 1; }
  to { opacity: 1; transform: scale(1.025); }
}
@keyframes photo-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes photo-contained-reveal {
  from { opacity: 0; transform: translate3d(0, 6%, 0) scale(.96); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-contained-left {
  from { opacity: 0; transform: translate3d(-8%, 0, 0) scale(.96); }
  to { opacity: 1; transform: none; }
}
@keyframes photo-contained-right {
  from { opacity: 0; transform: translate3d(8%, 0, 0) scale(.96); }
  to { opacity: 1; transform: none; }
}

@keyframes photo-reveal {
  from {
    opacity: 0;
    transform: translate3d(0, 2%, 0) scale(1.06);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes photo-drift-left {
  from {
    opacity: 0;
    transform: translate3d(-2.5%, 0, 0) scale(1.06);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes photo-drift-right {
  from {
    opacity: 0;
    transform: translate3d(2.5%, 0, 0) scale(1.06);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes photo-ken-burns {
  from { transform: scale(1.04); }
  to { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .wedding-photo img {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
