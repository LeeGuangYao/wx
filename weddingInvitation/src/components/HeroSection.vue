<script setup lang="ts">
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingConfig } from '@/types/wedding'
import type { WeddingPhoto as Photo } from '@/types/photo'

defineProps<{ config: WeddingConfig; photo: Photo }>()
</script>

<template>
  <section id="cover" class="wedding-section hero" aria-labelledby="hero-title">
    <div class="hero__masthead">
      <span>婚 礼 邀 请</span>
      <time :datetime="config.dateISO">{{ config.dateSlash }}</time>
    </div>
    <div class="hero__frame">
      <WeddingPhoto class="hero__image" :photo="photo" priority />
      <div class="hero__shade" aria-hidden="true" />
      <div class="hero__heading">
        <p class="eyebrow">{{ config.copy.heroEyebrow }}</p>
        <p class="hero__announcement">{{ config.copy.invitationTitle }}</p>
        <p class="hero__script" aria-hidden="true">The Wedding</p>
      </div>
      <div class="hero__content">
        <h1 id="hero-title" class="hero__names">
          <span>{{ config.couple.groom }}</span>
          <em aria-hidden="true">&amp;</em>
          <span>{{ config.couple.bride }}</span>
        </h1>
        <p class="hero__date"><time :datetime="config.dateISO">{{ config.dateShort }}</time><span> {{ config.weekday }}</span></p>
      </div>
    </div>
    <SectionFooter :page="1" href="#countdown" label="向上滑动 · 开启请柬" />
  </section>
</template>

<style scoped lang="scss">
.hero {
  padding: 0 14px;
}

.hero__masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 62px;
  padding: max(18px, env(safe-area-inset-top)) 8px 18px;
  font-family: var(--font-sans);
  font-size: .75rem;
  letter-spacing: .12em;
}

.hero__frame {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 540px;
  isolation: isolate;
  overflow: hidden;
  background: #adc8d9;
}

.hero__image, .hero__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.hero__image {
  animation: arrive 1.4s var(--ease-out) both;
}

.hero__shade {
  background: linear-gradient(180deg, rgba(210, 231, 243, .12) 10%, transparent 40%, transparent 62%, rgba(11, 30, 39, .78));
}

.hero__heading {
  // 为宽屏裁切后靠近上方的人脸留出空间。
  padding: clamp(48px, 7svh, 76px) 12px 0;
  text-align: center;
}

.hero__heading .eyebrow {
  font-size: .75rem;
  letter-spacing: .22em;
}

.hero__announcement {
  margin: 12px 0 4px;
  font-size: clamp(2rem, 8.5vw, 2.75rem);
  line-height: 1.2;
  letter-spacing: .16em;
}

.hero__script {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 7vw, 2.25rem);
  font-style: italic;
  line-height: 1.15;
}

.hero__content {
  padding: 170px 16px 32px;
  color: #fff;
  text-align: center;
}

.hero__names {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  font-size: clamp(1.7rem, 7vw, 2.15rem);
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: .06em;
}

.hero__names em {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: .8em;
}

.hero__date {
  margin: 14px 0 0;
  font-family: var(--font-sans);
  font-size: .8125rem;
  line-height: 1.7;
  letter-spacing: .12em;
}

.hero__date span {
  margin-left: 12px;
}

.hero :deep(.section-footer) {
  margin-inline: 8px;
  border: 0;
}

@keyframes arrive {
  from {
    transform: scale(1.025);
  }
  to {
    transform: scale(1);
  }
}

@media (min-width: 480px) {
  .hero__frame {
    min-height: 640px;
  }
}
</style>
