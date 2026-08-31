<script setup lang="ts">
import weddingCover from '@/assets/images/wedding-cover.jpg'
import HeroSection from '@/components/HeroSection.vue'
import InvitationSection from '@/components/InvitationSection.vue'
import { weddingConfig } from '@/config/wedding'
</script>

<template>
  <main class="wedding-page">
    <HeroSection :config="weddingConfig" :cover-src="weddingCover" />
    <InvitationSection :config="weddingConfig" />
  </main>
</template>
