<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import musicUrl from '@/assets/audio/gentle-heartbeat.mp3'

const audio = ref<HTMLAudioElement | null>(null)
const gestureEvents = ['click', 'touchend', 'keydown'] as const
let mounted = false
let waitingForGesture = false

function blockedByAutoplay(error: unknown): boolean {
  return (error as { name?: string })?.name === 'NotAllowedError'
}

function stopWaitingForGesture(): void {
  if (!waitingForGesture) return
  gestureEvents.forEach(event => window.removeEventListener(event, retryPlayback, true))
  waitingForGesture = false
}

function retryPlayback(): void {
  const player = audio.value
  if (!player || !player.paused) {
    stopWaitingForGesture()
    return
  }

  void player.play().then(stopWaitingForGesture).catch((error: unknown) => {
    if (!blockedByAutoplay(error)) stopWaitingForGesture()
  })
}

onMounted(() => {
  mounted = true
  void audio.value?.play().catch((error: unknown) => {
    if (!mounted || !blockedByAutoplay(error)) return
    waitingForGesture = true
    gestureEvents.forEach(event => window.addEventListener(event, retryPlayback, true))
  })
})

onBeforeUnmount(() => {
  mounted = false
  stopWaitingForGesture()
  audio.value?.pause()
})
</script>

<template>
  <audio ref="audio" :src="musicUrl" autoplay loop preload="none" hidden />
</template>
