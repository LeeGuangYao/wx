<script setup lang="ts">
import type { WeddingConfig } from '@/types/wedding'

interface Props {
  config: WeddingConfig
  coverSrc: string
}

defineProps<Props>()
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <img
      class="hero__image"
      :src="coverSrc"
      :alt="`${config.couple.groom}与${config.couple.bride}的婚纱照`"
      fetchpriority="high"
    />
    <div class="hero__overlay" aria-hidden="true" />
    <div class="hero__content">
      <p class="hero__eyebrow">{{ config.copy.heroEyebrow }}</p>
      <h1 id="hero-title" class="hero__names">
        {{ config.couple.groom }} <span aria-hidden="true">&amp;</span> {{ config.couple.bride }}
      </h1>
      <p class="hero__date">
        <time :datetime="config.dateISO">{{ config.dateShort }}</time>
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  --hero-image-y: 40%;
  position: relative;
  display: grid;
  min-height: 100vh;
  overflow: hidden;
  color: #fff;
  isolation: isolate;
}

@supports (min-height: 100svh) {
  .hero {
    min-height: 100svh;
  }
}

.hero__image,
.hero__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__image {
  object-fit: cover;
  object-position: center var(--hero-image-y);
  animation: hero-zoom 1.2s var(--ease-out) both;
}

.hero__overlay {
  z-index: 1;
  background: var(--wedding-overlay);
}

.hero__content {
  z-index: 2;
  align-self: end;
  width: min(calc(100% - 48px), 360px);
  margin-inline: auto;
  padding-bottom: max(52px, calc(32px + env(safe-area-inset-bottom)));
  text-align: center;
}

.hero__content > * {
  opacity: 0;
  animation: hero-copy 700ms var(--ease-out) forwards;
}

.hero__eyebrow {
  margin: 0 0 18px;
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.22em;
  animation-delay: 120ms;
}

.hero__names {
  margin: 0;
  font-size: clamp(28px, 8vw, 34px);
  font-weight: 400;
  line-height: 1.3;
  white-space: nowrap;
  animation-delay: 240ms;
}

.hero__date {
  margin: 18px 0 0;
  font-family: var(--font-sans);
  font-size: 14px;
  letter-spacing: 0.14em;
  animation-delay: 360ms;
}

@keyframes hero-zoom {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1);
  }
}

@keyframes hero-copy {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__image,
  .hero__content > * {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>
