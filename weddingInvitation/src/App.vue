<script setup lang="ts">
import ClosingSection from '@/components/ClosingSection.vue'
import CountdownSection from '@/components/CountdownSection.vue'
import HeroSection from '@/components/HeroSection.vue'
import WeddingDetailsSection from '@/components/WeddingDetailsSection.vue'
import { weddingConfig } from '@/config/wedding'
import { weddingPhotos } from '@/config/photos'
</script>

<template>
  <main class="wedding-page">
    <HeroSection :config="weddingConfig" :photo="weddingPhotos.cover" />
    <CountdownSection :config="weddingConfig" :photos="weddingPhotos.countdown" />
    <WeddingDetailsSection :config="weddingConfig" :photo="weddingPhotos.details" />
    <ClosingSection :config="weddingConfig" :photos="weddingPhotos.closing" />
  </main>
</template>
