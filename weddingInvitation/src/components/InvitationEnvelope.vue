<script setup lang="ts">
defineProps<{ opening: boolean; opened: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button
    class="envelope"
    :class="{ 'is-opening': opening, 'is-opened': opened }"
    type="button"
    :disabled="opening || opened"
    :aria-expanded="opened"
    aria-label="拆开信封，开启婚礼请柬"
    @click="$emit('open')"
  >
    <span class="envelope__paper" aria-hidden="true">
      <span class="envelope__back" />
      <span class="envelope__letter"><i>WITH LOVE</i><span>一生 · 一次 · 一封</span></span>
      <svg class="envelope__pocket" viewBox="0 0 220 126" fill="none">
        <defs>
          <linearGradient id="envelope-paper" x1="20" y1="0" x2="190" y2="126" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fffdf6" /><stop offset=".5" stop-color="#f4ead7" /><stop offset="1" stop-color="#fffbf0" />
          </linearGradient>
          <linearGradient id="envelope-fold" x1="110" y1="66" x2="110" y2="126" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ebe0ca" /><stop offset="1" stop-color="#fffaf0" />
          </linearGradient>
        </defs>
        <path d="M1 2 103 75Q110 80 117 75L219 2V121Q219 125 214 125H6Q1 125 1 120Z" fill="url(#envelope-paper)" stroke="#e4d3b4" />
        <path d="M2 122 81 65M218 122 139 65" stroke="#d4bd9566" />
        <path d="m2 123 81-56 20 14q7 5 14 0l20-14 81 56" fill="url(#envelope-fold)" />
        <path d="M8 116V119H212V116" stroke="#c6a778" stroke-width=".6" />
      </svg>
      <svg class="envelope__flap" viewBox="0 0 220 86" fill="none">
        <defs>
          <linearGradient id="envelope-flap" x1="110" y1="0" x2="110" y2="82" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fffdf7" /><stop offset="1" stop-color="#f1e4cb" />
          </linearGradient>
        </defs>
        <path d="M1 1H219L123 76Q110 86 97 76Z" fill="url(#envelope-flap)" stroke="#d9c39c" stroke-width=".8" />
        <path d="M12 5 101 72Q110 79 119 72L208 5" stroke="#fffef7" stroke-width="2" />
        <path d="M11 6 101 72Q110 79 119 72L209 6" stroke="#c5a574" stroke-width=".5" />
      </svg>
      <span class="envelope__seal">
        <svg viewBox="0 0 48 48" fill="none">
          <defs>
            <radialGradient id="envelope-gold" cx=".32" cy=".25" r=".8">
              <stop stop-color="#f7e4ba" /><stop offset=".52" stop-color="#c7a36c" /><stop offset="1" stop-color="#9d7848" />
            </radialGradient>
          </defs>
          <path d="M24 2 31 4 36 7 40 12 43 18 44 24 42 31 38 37 32 41 25 44 18 42 11 39 6 33 3 26 4 19 7 12 12 7 18 4Z" fill="url(#envelope-gold)" />
          <circle cx="24" cy="23" r="15" stroke="#f9e5bcbf" stroke-width=".8" />
          <circle cx="20" cy="23" r="6" stroke="#fff2d4" stroke-width="1.2" />
          <circle cx="28" cy="23" r="6" stroke="#fff2d4" stroke-width="1.2" />
          <path d="m26 14 2-2 2 2-2 2Z" stroke="#fff2d4" stroke-width=".8" />
        </svg>
      </span>
      <span class="envelope__inscription">L &amp; F · FOREVER</span>
    </span>
    <span class="envelope__label">{{ opening ? '幸福，正在开启' : opened ? '请柬已开启' : '轻触 · 拆开我们的喜悦' }}<span v-if="!opening && !opened" aria-hidden="true">↗</span></span>
  </button>
</template>

<style scoped lang="scss">
.envelope {
  --envelope-width: 164px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  margin: 14px auto 0;
  padding: 0 10px 4px;
  border: 0;
  background: transparent;
  color: #fffaf0;
  cursor: pointer;
  perspective: 800px;
  text-shadow: none;
}
.envelope__paper {
  position: relative;
  display: block;
  width: var(--envelope-width);
  height: calc(var(--envelope-width) * .573);
  transform: rotate(-4deg);
  filter: drop-shadow(0 5px 7px #35291933);
  transition: transform 450ms var(--ease-out);
}
.envelope:hover:not(:disabled) .envelope__paper { transform: translateY(-3px) rotate(0deg); }
.envelope__back { position: absolute; inset: 0; background: #e4d4b8; border-radius: 3px; border: 1px solid #d8c298; }
.envelope__letter {
  position: absolute;
  inset: 5px 7px;
  display: grid;
  align-content: center;
  gap: 8px;
  border: 1px solid #d4bb916b;
  outline: 4px solid #fffdf6;
  background: #fffdf6;
  color: #aa8652;
  transition: transform 550ms var(--ease-out) 300ms;
}
.envelope__letter i { font: italic 13px var(--font-display); letter-spacing: .1em; }
.envelope__letter > span { font-size: 8px; letter-spacing: .15em; }
.envelope__pocket { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; }
.envelope__flap { position: absolute; inset: 0 0 auto; z-index: 3; width: 100%; height: 68.25%; transform-origin: center top; backface-visibility: hidden; transition: transform 700ms var(--ease-out), opacity 200ms 430ms; }
.envelope__seal { position: absolute; z-index: 4; width: 35px; height: 35px; left: calc(50% - 17.5px); top: 42%; filter: drop-shadow(0 2px 2px #72522455); transition: opacity 200ms, transform 350ms ease; }
.envelope__seal svg { display: block; width: 100%; height: 100%; }
.envelope__inscription { position: absolute; z-index: 3; bottom: 9%; inset-inline: 0; text-align: center; color: #a38458; font: 6px var(--font-display); letter-spacing: .19em; }
.envelope__label { display: flex; align-items: center; gap: 7px; color: #4c4437; font: 10px/1.5 var(--font-serif); letter-spacing: .14em; text-shadow: 0 1px 4px #fff9eccc; }
.envelope__label > span { font: 13px var(--font-sans); }
.is-opening .envelope__paper, .is-opened .envelope__paper { transform: rotate(0deg); }
.is-opening .envelope__seal, .is-opened .envelope__seal { opacity: 0; transform: translateY(-5px) scale(1.25); }
.is-opening .envelope__flap, .is-opened .envelope__flap { transform: rotateX(180deg); opacity: 0; }
.is-opening .envelope__letter, .is-opened .envelope__letter { transform: translateY(-32%); }
.envelope:disabled { cursor: default; }
@media (max-height: 740px) {
  .envelope { --envelope-width: 132px; gap: 6px; margin-top: 10px; }
  .envelope__seal { width: 29px; height: 29px; left: calc(50% - 14.5px); }
  .envelope__label { font-size: 9px; }
}
@media (max-height: 620px) {
  .envelope { --envelope-width: 116px; margin-top: 7px; gap: 5px; }
  .envelope__seal { width: 25px; height: 25px; left: calc(50% - 12.5px); }
}
@media (orientation: landscape) and (max-height: 550px) {
  .envelope__label { color: #fff9eb; text-shadow: 0 1px 6px #132029aa; }
}
</style>
