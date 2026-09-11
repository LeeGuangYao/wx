<script setup lang="ts">
import InvitationEnvelope from '@/components/InvitationEnvelope.vue'
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingConfig } from '@/types/wedding'
import type { WeddingPhoto as Photo } from '@/types/photo'

defineProps<{ config: WeddingConfig; photo: Photo; active: boolean; opening: boolean; opened: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <section id="cover" class="wedding-section hero" aria-labelledby="hero-title">
    <WeddingPhoto class="hero__image" :photo="photo" :active="active" priority />
    <div class="hero__veil" aria-hidden="true" />
    <div class="hero__scroll" data-page-scroll>
      <header class="hero__heading">
        <p class="hero__masthead">THE WEDDING OF</p>
        <h1 id="hero-title" class="hero__announcement" data-page-title tabindex="-1">{{ config.copy.invitationTitle }}</h1>
        <p class="section-description">{{ config.copy.heroDescription }}</p>
        <InvitationEnvelope :opening="opening" :opened="opened" @open="$emit('open')" />
      </header>
      <div class="hero__caption">
        <p class="hero__names">{{ config.couple.groom }}<em aria-hidden="true">&amp;</em>{{ config.couple.bride }}</p>
        <p class="hero__date"><time :datetime="config.dateISO">{{ config.dateShort }}</time></p>
      </div>
    </div>
    <SectionFooter :page="1" href="#our-album" label="翻开相册" :locked="!opened" />
  </section>
</template>

<style scoped lang="scss">
.hero {
  padding: 0;
  isolation: isolate;
  color: #fffbf2;
  background: #d4c8b3;
}
.hero__image, .hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}
.hero__image { background: #d4c8b3; }
.hero__veil {
  z-index: -1;
  background: linear-gradient(180deg, #10161991 0, #17313d24 23%, transparent 40%, transparent 61%, #0e192557 82%, #0b1426c7 100%);
}
.hero__scroll {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  justify-content: space-between;
}
.hero__heading {
  flex-shrink: 0;
  padding: max(26px, env(safe-area-inset-top)) 18px 0;
  text-align: center;
  text-shadow: 0 2px 14px #20303933;
}
.hero__masthead {
  margin: 0 0 10px;
  font: 8px/1.5 var(--font-sans);
  letter-spacing: .34em;
}
.hero__announcement {
  margin: 0;
  font-size: clamp(1.8rem, 7.8vw, 2.5rem);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: .18em;
}
.hero .section-description {
  margin-top: 8px;
  color: #fffdf3;
  font-size: .6875rem;
  letter-spacing: .12em;
}
.hero__caption {
  flex-shrink: 0;
  margin-top: 260px;
  padding: 24px 20px 30px;
  text-align: center;
  text-shadow: 0 2px 12px #06101a75;
}
.hero__names {
  margin: 0;
  font-size: clamp(1.5rem, 6.5vw, 2rem);
  line-height: 1.4;
  letter-spacing: .13em;
}
.hero__names em {
  margin-inline: 14px;
  color: #e2c89c;
  font: italic .9em var(--font-display);
}
.hero__date { margin: 12px 0 0; font: 10px var(--font-sans); letter-spacing: .3em; }
.hero :deep(.section-footer) {
  margin-inline: 24px;
  color: #fff9ec;
  border-color: #fff5df55;
}
@media (max-height: 740px) {
  .hero__heading { padding-top: max(16px, env(safe-area-inset-top)); }
  .hero__masthead { margin-bottom: 6px; }
  .hero__announcement { font-size: 1.8rem; }
  .hero .section-description { margin-top: 5px; font-size: .625rem; }
  .hero__caption { margin-top: 160px; padding-bottom: 20px; }
}
@media (max-height: 620px) {
  .hero__heading { padding-top: max(10px, env(safe-area-inset-top)); }
  .hero__masthead { margin-bottom: 4px; font-size: 7px; }
  .hero__announcement { font-size: 1.6rem; }
  .hero .section-description { margin-top: 4px; }
}
@media (orientation: landscape) and (max-height: 550px) {
  .hero__heading { width: 40%; padding-inline: 8px; padding-top: 22px; }
  .hero__announcement { font-size: 1.4rem; letter-spacing: .08em; }
  .hero .section-description { max-width: 180px; margin-inline: auto; }
  .hero__caption { position: absolute; right: 18px; bottom: 65px; margin: 0; padding: 0; }
  .hero__names { font-size: 1.15rem; }
  .hero__image :deep(img) { object-position: 50% 32% !important; }
  .hero__veil { background: linear-gradient(90deg, #101a249c, transparent 53%), linear-gradient(0deg, #0b1426a6, transparent 45%); }
}
</style>
