<script setup lang="ts">
import type { WeddingConfig } from '@/types/wedding'

interface Props {
  config: WeddingConfig
  coverSrc: string
}

defineProps<Props>()
</script>

<template>
  <section id="cover" class="wedding-section hero" aria-labelledby="hero-title">
    <img
      class="hero__image"
      :src="coverSrc"
      :alt="`${config.couple.groom}与${config.couple.bride}的婚纱照`"
      fetchpriority="high"
      width="1500"
      height="2000"
    />
    <div class="hero__overlay" aria-hidden="true" />
    <div class="hero__masthead" aria-hidden="true">
      <span>婚礼邀请</span>
      <span>{{ config.dateShort }}</span>
    </div>
    <div class="hero__content">
      <p class="hero__eyebrow">{{ config.copy.heroEyebrow }}</p>
      <h1 id="hero-title" class="hero__names">
        <span>{{ config.couple.groom }}</span>
        <em aria-hidden="true">&amp;</em>
        <span>{{ config.couple.bride }}</span>
      </h1>
      <p class="hero__date">
        <time :datetime="config.dateISO">{{ config.dateShort }}</time>
      </p>
    </div>
    <div class="section-footer hero__footer">
      <span aria-label="第 1 页，共 4 页">01 / 04</span>
      <a class="page-turn" href="#invitation">向上滑动 · 开启请柬</a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  --hero-image-y: 50%;
  padding: 0;
  overflow: hidden;
  color: var(--wedding-text);
  background: #9fbdce;
  isolation: isolate;
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
  animation: hero-zoom 1.6s var(--ease-out) both;
}

.hero__overlay {
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(18, 35, 44, 0.12),
    transparent 14%,
    transparent 72%,
    rgba(18, 35, 44, 0.45)
  );
}

.hero__masthead {
  position: absolute;
  z-index: 2;
  top: max(24px, calc(12px + env(safe-area-inset-top)));
  right: var(--page-gutter);
  left: var(--page-gutter);
  display: flex;
  justify-content: space-between;
  color: #f8f9f5;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.2em;
}

.hero__content {
  z-index: 2;
  align-self: start;
  width: calc(100% - 40px);
  margin-inline: auto;
  padding-top: clamp(88px, 14vh, 148px);
  padding-top: clamp(88px, 14dvh, 148px);
  text-align: center;
}

.hero__content > * {
  opacity: 0;
  animation: hero-copy 700ms var(--ease-out) forwards;
}

.hero__eyebrow {
  margin: 0 0 20px;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.3em;
  animation-delay: 120ms;
}

.hero__names {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0;
  font-size: clamp(27px, 7.6vw, 36px);
  font-weight: 400;
  line-height: 1.3;
  white-space: nowrap;
  animation-delay: 240ms;
}

.hero__names em {
  font-family: var(--font-display);
  font-size: 0.8em;
  font-weight: 400;
}

.hero__date {
  margin: 20px 0 0;
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.24em;
  animation-delay: 360ms;
}

.hero__footer {
  z-index: 2;
  color: #fff;
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

@media (max-height: 520px) {
  .hero {
    --hero-image-y: 0%;
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
