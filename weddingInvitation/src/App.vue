<script setup lang="ts">
import { ref } from 'vue'
import BackgroundMusic from '@/components/BackgroundMusic.vue'
import HeroSection from '@/components/HeroSection.vue'
import PhotoAlbumSection from '@/components/PhotoAlbumSection.vue'
import WeddingDetailsSection from '@/components/WeddingDetailsSection.vue'
import { useInvitationPager } from '@/composables/useInvitationPager'
import { weddingConfig } from '@/config/wedding'
import { weddingPhotos } from '@/config/photos'
import { albumPages } from '@/config/albumPages'

const viewport = ref<HTMLElement | null>(null)
const ids = ['cover', ...albumPages.map(page => page.id), 'wedding-day']
const { pager, height, openEnvelope, onLinkClick } = useInvitationPager(viewport, ids)
const photoActive = (index: number) => pager.phase === 'turning' ? pager.previousIndex === index : pager.index === index
</script>

<template>
  <main
    ref="viewport"
    class="wedding-page"
    :class="{ 'is-turning': pager.phase === 'turning', 'is-sealed': !pager.opened }"
    :style="{ '--viewport-height': height + 'px' }"
    aria-label="婚礼请柬"
    @click="onLinkClick"
  >
    <BackgroundMusic />
    <div class="page-track" :style="{ transform: 'translate3d(0, ' + (-pager.index * height) + 'px, 0)' }">
      <div
        v-for="(id, index) in ids"
        :key="id"
        class="page-panel"
        :class="{ 'is-current': pager.index === index, 'is-outgoing': pager.phase === 'turning' && pager.previousIndex === index }"
        :data-panel="index"
        :inert="pager.index !== index"
        :aria-hidden="pager.index !== index ? 'true' : undefined"
      >
        <HeroSection
          v-if="index === 0"
          :config="weddingConfig"
          :photo="weddingPhotos.cover"
          :active="photoActive(index)"
          :opening="pager.phase === 'opening'"
          :opened="pager.opened"
          @open="openEnvelope"
        />
        <PhotoAlbumSection
          v-else-if="index < ids.length - 1"
          :chapter="albumPages[index - 1]!"
          :page="index + 1"
          :active="photoActive(index)"
          :next-href="'#' + ids[index + 1]"
          :previous-href="'#' + ids[index - 1]"
        />
        <WeddingDetailsSection v-else :config="weddingConfig" :photo="weddingPhotos.details" :active="photoActive(index)" />
      </div>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ pager.opened ? '第 ' + (pager.index + 1) + ' 页，共 5 页' : '请拆开首页信封，开启婚礼请柬' }}</p>
  </main>
</template>
