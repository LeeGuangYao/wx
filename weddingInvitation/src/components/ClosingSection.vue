<script setup lang="ts">
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { WeddingPhoto as Photo } from '@/types/photo'
import type { WeddingConfig } from '@/types/wedding'

defineProps<{ config: WeddingConfig; photos: readonly [Photo, Photo, Photo] }>()
</script>

<template>
  <section id="see-you" class="wedding-section closing" aria-labelledby="closing-title">
    <div class="section-content closing__content">
      <div class="closing__gallery">
        <WeddingPhoto class="closing__photo closing__photo--main" :photo="photos[0]" motion="drift-left" sizes="(max-width: 560px) 50vw, 280px" />
        <WeddingPhoto class="closing__photo" :photo="photos[1]" motion="drift-right" :delay="120" sizes="(max-width: 560px) 34vw, 190px" />
        <WeddingPhoto class="closing__photo" :photo="photos[2]" :delay="240" sizes="(max-width: 560px) 34vw, 190px" />
      </div>
      <h2 id="closing-title" class="section-heading">{{ config.copy.closingTitle }}</h2>
    </div>
    <SectionFooter :page="3" href="#wedding-day" label="婚礼信息" />
  </section>
</template>

<style scoped lang="scss">
.closing {
  background: #e5eceb;
}
.closing__content {
  text-align: center;
}
.closing__gallery {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: clamp(340px, 54svh, 500px);
  margin: 0 0 32px;
}
.closing__photo {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.closing__photo--main {
  grid-row: span 2;
}
.closing .section-heading {
  margin-top: 0;
  font-size: clamp(1.7rem, 7vw, 2rem);
}
@media (max-height: 720px) {
  .closing__gallery {
    height: clamp(280px, 52svh, 370px);
    margin-bottom: 24px;
  }
}
</style>
