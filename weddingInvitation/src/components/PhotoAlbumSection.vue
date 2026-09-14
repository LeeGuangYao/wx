<script setup lang="ts">
import SectionFooter from '@/components/SectionFooter.vue'
import WeddingPhoto from '@/components/WeddingPhoto.vue'
import type { AlbumPage } from '@/config/albumPages'
import type { WeddingPhoto as Photo } from '@/types/photo'

const props = defineProps<{ chapter: AlbumPage; page: number; active: boolean; nextHref: string; previousHref: string }>()

// Timings follow each composition; neighboring photos overlap as they settle.
const photoAnimations = {
  panorama: [
    { motion: 'unveil-right', delay: 0, duration: 1300 },
    { motion: 'float-up', delay: 650, duration: 1200 },
    { motion: 'float-up', delay: 1250, duration: 1200 },
    { motion: 'fade', delay: 1800, duration: 1000 },
    { motion: 'fade', delay: 2300, duration: 1000 },
    { motion: 'fade', delay: 2800, duration: 1000 },
  ],
  editorial: [
    { motion: 'soft-zoom', delay: 0, duration: 1300 },
    { motion: 'settle-left', delay: 650, duration: 1200 },
    { motion: 'settle-right', delay: 1250, duration: 1200 },
    { motion: 'unveil-up', delay: 1850, duration: 1200 },
    { motion: 'settle-left', delay: 2450, duration: 1000 },
    { motion: 'settle-right', delay: 2950, duration: 1000 },
  ],
  cinematic: [
    { motion: 'cinematic', delay: 0, duration: 1300 },
    { motion: 'float-up', delay: 1250, duration: 1200 },
    { motion: 'soft-zoom', delay: 650, duration: 1300 },
    { motion: 'float-up', delay: 1850, duration: 1200 },
    { motion: 'fade', delay: 2450, duration: 1100 },
    { motion: 'fade', delay: 3000, duration: 1100 },
  ],
} as const satisfies Record<AlbumPage['layout'], readonly Pick<InstanceType<typeof WeddingPhoto>['$props'], 'motion' | 'delay' | 'duration'>[]>

function isBanner(index: number): boolean {
  return props.chapter.layout === 'editorial' ? index === 3 : index === 0
}
function displayPhoto(photo: Photo, index: number): Photo {
  if (!isBanner(index)) return photo
  return { ...photo, position: props.chapter.layout === 'cinematic' ? '50% 0%' : '50% 35%' }
}
</script>

<template>
  <section :id="chapter.id" class="wedding-section album" :class="'album--' + chapter.layout" :aria-labelledby="chapter.id + '-title'">
    <div class="album__content" data-page-scroll>
      <header class="album__heading">
        <p class="eyebrow">{{ chapter.eyebrow }}</p>
        <h2 :id="chapter.id + '-title'" class="section-heading" data-page-title tabindex="-1">{{ chapter.title }}</h2>
        <p class="section-description">{{ chapter.description }}</p>
      </header>
      <div class="album__grid">
        <figure
          v-for="(photo, index) in chapter.photos"
          :key="photo.src"
          class="album__frame"
          :class="{ 'album__frame--banner': isBanner(index), 'album__frame--portrait': photo.width < photo.height }"
        >
          <WeddingPhoto
            v-bind="photoAnimations[chapter.layout][index]"
            :photo="displayPhoto(photo, index)"
            :active="active"
            :fit="isBanner(index) ? 'cover' : 'contain'"
            :sizes="isBanner(index) ? '(max-width: 560px) 100vw, 560px' : '(max-width: 560px) 55vw, 300px'"
          />
        </figure>
      </div>
    </div>
    <SectionFooter :page="page" :href="nextHref" :previous-href="previousHref" :label="page === 4 ? '婚礼信息' : '下一页'" />
  </section>
</template>

<style scoped lang="scss">
.album {
  --wedding-text: #494135;
  --wedding-muted: #877a66;
  --wedding-line: #d8cdbb;
  color: var(--wedding-text);
  padding-inline: 0;
  background: #f7f3e9;
}
.album__content { display: flex; flex: 1; flex-direction: column; min-height: 0; padding-bottom: 18px; }
.album__heading { flex-shrink: 0; margin: 0 20px 18px; text-align: center; }
.album :deep(.section-footer) { margin-inline: 20px; }
.album__heading .eyebrow { color: #a48a5f; font-size: 8px; letter-spacing: .25em; }
.album__heading .section-heading { margin-top: 6px; font-size: 1.8rem; }
.album__heading .section-description { margin-top: 6px; font-size: .75rem; }
.album__grid {
  display: grid;
  flex: 1;
  min-height: 290px;
  margin-inline: 20px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 10px;
}
.album__frame { position: relative; min-width: 0; min-height: 0; margin: 0; }
.album__frame .wedding-photo { width: 100%; height: 100%; background: transparent; }
.album__frame--banner { margin-inline: -20px; }
.album__frame--banner .wedding-photo { background: #e5dcc9; }

/* Open with a full-width landscape, then a pair of tall portraits and a small contact strip. */
.album--panorama .album__grid { grid-template-rows: 1fr 1.5fr .7fr; }
.album--panorama .album__frame:nth-child(1) { grid-area: 1 / 1 / 2 / 13; margin-bottom: 4px; }
.album--panorama .album__frame:nth-child(2) { grid-area: 2 / 1 / 3 / 7; }
.album--panorama .album__frame:nth-child(3) { grid-area: 2 / 7 / 3 / 13; }
.album--panorama .album__frame:nth-child(4) { grid-area: 3 / 1 / 4 / 4; }
.album--panorama .album__frame:nth-child(5) { grid-area: 3 / 4 / 4 / 7; }
.album--panorama .album__frame:nth-child(6) { grid-area: 3 / 7 / 4 / 13; }

/* A larger portrait anchors the left; smaller memories and a wide kiss form a staggered sequence. */
.album--editorial { background: #eee8df; }
.album--editorial .album__heading { position: relative; padding-left: 15px; text-align: left; border-left: 1px solid #bea279; }
.album--editorial .album__grid { grid-template-rows: .9fr .75fr 1.05fr .85fr; gap: 12px; }
.album--editorial .album__frame:nth-child(1) { grid-area: 1 / 1 / 3 / 8; }
.album--editorial .album__frame:nth-child(2) { grid-area: 1 / 8 / 2 / 13; padding-top: 8px; }
.album--editorial .album__frame:nth-child(3) { grid-area: 2 / 8 / 3 / 13; padding-bottom: 8px; }
.album--editorial .album__frame:nth-child(4) { grid-area: 3 / 1 / 4 / 13; }
.album--editorial .album__frame:nth-child(5) { grid-area: 4 / 1 / 5 / 8; }
.album--editorial .album__frame:nth-child(6) { grid-area: 4 / 8 / 5 / 13; }

/* Dark photographic paper, a cinematic close-up, and loosely mounted vertical prints. */
.album--cinematic {
  --wedding-text: #f5ecdc;
  --wedding-muted: #c7b89e;
  --wedding-line: #665b4a;
  background: #292722;
}
.album--cinematic .album__heading .eyebrow { color: #bd9d67; }
.album--cinematic .album__grid { grid-template-rows: minmax(145px, 1.1fr) minmax(0, 1.5fr) minmax(0, .8fr); gap: 16px 9px; }
.album--cinematic .album__frame:nth-child(1) { grid-area: 1 / 1 / 2 / 13; }
.album--cinematic .album__frame:nth-child(2) { grid-area: 2 / 1 / 3 / 5; padding-block: 22px 0; transform: rotate(-3deg); }
.album--cinematic .album__frame:nth-child(3) { grid-area: 2 / 5 / 3 / 9; transform: translateY(-7px); z-index: 1; }
.album--cinematic .album__frame:nth-child(4) { grid-area: 2 / 9 / 3 / 13; padding-block: 0 22px; transform: rotate(3deg); }
.album--cinematic .album__frame:nth-child(5) { grid-area: 3 / 1 / 4 / 7; }
.album--cinematic .album__frame:nth-child(6) { grid-area: 3 / 7 / 4 / 13; }
@media (max-height: 740px) {
  .album__heading { margin-bottom: 12px; }
  .album__heading .section-heading { font-size: 1.5rem; }
  .album__content { padding-bottom: 12px; }
  .album__grid { gap: 7px; }
  .album--cinematic .album__grid { gap: 10px 7px; }
}
@media (orientation: landscape) and (max-height: 550px) {
  .album { padding-top: 12px; }
  .album__heading { margin-bottom: 10px; }
  .album__heading .eyebrow { display: none; }
  .album__heading .section-heading { margin: 0; font-size: 1.2rem; }
  .album__heading .section-description { margin-top: 4px; font-size: .6875rem; }
  .album__grid { min-height: 170px; }
  .album__frame--banner { margin-inline: 0; }
  .album--panorama .album__grid { grid-template-rows: 1fr 1fr; }
  .album--panorama .album__frame:nth-child(1) { grid-area: 1 / 1 / 2 / 7; margin: 0; }
  .album--panorama .album__frame:nth-child(2) { grid-area: 1 / 7 / 3 / 10; }
  .album--panorama .album__frame:nth-child(3) { grid-area: 1 / 10 / 3 / 13; }
  .album--panorama .album__frame:nth-child(4) { grid-area: 2 / 1 / 3 / 3; }
  .album--panorama .album__frame:nth-child(5) { grid-area: 2 / 3 / 3 / 5; }
  .album--panorama .album__frame:nth-child(6) { grid-area: 2 / 5 / 3 / 7; }
  .album--editorial .album__grid { grid-template-rows: 1fr 1fr; }
  .album--editorial .album__frame:nth-child(1) { grid-area: 1 / 1 / 3 / 4; }
  .album--editorial .album__frame:nth-child(2) { grid-area: 1 / 4 / 2 / 7; padding: 0; }
  .album--editorial .album__frame:nth-child(3) { grid-area: 2 / 4 / 3 / 7; padding: 0; }
  .album--editorial .album__frame:nth-child(4) { grid-area: 1 / 7 / 2 / 13; }
  .album--editorial .album__frame:nth-child(5) { grid-area: 2 / 7 / 3 / 10; }
  .album--editorial .album__frame:nth-child(6) { grid-area: 2 / 10 / 3 / 13; }
  .album--cinematic .album__grid { grid-template-rows: 1fr 1fr; }
  .album--cinematic .album__frame:nth-child(1) { grid-area: 1 / 1 / 2 / 5; }
  .album--cinematic .album__frame:nth-child(2) { grid-area: 1 / 5 / 3 / 7; padding: 0; }
  .album--cinematic .album__frame:nth-child(3) { grid-area: 1 / 7 / 3 / 9; }
  .album--cinematic .album__frame:nth-child(4) { grid-area: 1 / 9 / 3 / 11; padding: 0; }
  .album--cinematic .album__frame:nth-child(5) { grid-area: 2 / 1 / 3 / 5; }
  .album--cinematic .album__frame:nth-child(6) { grid-area: 1 / 11 / 3 / 13; }
}
</style>
