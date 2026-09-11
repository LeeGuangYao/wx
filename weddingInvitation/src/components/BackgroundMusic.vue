<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import musicUrl from '@/assets/audio/romantic-wedding-piano.mp3'

const audio = ref<HTMLAudioElement | null>(null)

onMounted(async () => {
  try {
    await audio.value?.play()
  } catch {
    // Autoplay restrictions or an unavailable track leave the invitation silent.
  }
})

onBeforeUnmount(() => audio.value?.pause())
</script>

<template>
  <audio ref="audio" :src="musicUrl" autoplay loop preload="none" hidden />
</template>
