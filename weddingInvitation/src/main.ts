import { createApp } from 'vue'
import App from './App.vue'
import { weddingConfig } from '@/config/wedding'
import '@/assets/styles/global.scss'

const description = `诚邀您见证我们的婚礼｜${weddingConfig.dateLong} ${weddingConfig.time24} · ${weddingConfig.venue.name}`
document.querySelectorAll<HTMLMetaElement>(
  'meta[name="description"], meta[itemprop="description"], meta[property="og:description"], meta[name="twitter:description"]',
).forEach(meta => { meta.content = description })

// Keep the venue query when sharing; page-turning hashes are not part of the invitation URL.
const shareUrl = new URL(window.location.href)
shareUrl.hash = ''
const ogUrl = document.createElement('meta')
ogUrl.setAttribute('property', 'og:url')
ogUrl.content = shareUrl.href
const canonical = document.createElement('link')
canonical.rel = 'canonical'
canonical.href = shareUrl.href
document.head.append(ogUrl, canonical)

createApp(App).mount('#app')
