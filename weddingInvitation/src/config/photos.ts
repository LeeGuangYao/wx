import type { WeddingPhoto } from '@/types/photo'
import coverSmall from '@/assets/images/photos/cover-eyes-open-960.webp'
import coverLarge from '@/assets/images/photos/cover-eyes-open-1600.webp'
import coverJpeg from '@/assets/images/photos/cover-eyes-open.jpg'
import portraitSmall from '@/assets/images/photos/portrait-960.webp'
import portraitLarge from '@/assets/images/photos/portrait-1600.webp'
import portraitJpeg from '@/assets/images/photos/portrait.jpg'
import studioSmall from '@/assets/images/photos/studio-960.webp'
import studioLarge from '@/assets/images/photos/studio-1600.webp'
import studioJpeg from '@/assets/images/photos/studio.jpg'
import panoramaSmall from '@/assets/images/photos/panorama-960.webp'
import panoramaLarge from '@/assets/images/photos/panorama-1600.webp'
import panoramaJpeg from '@/assets/images/photos/panorama.jpg'
import gardenSmall from '@/assets/images/photos/garden-960.webp'
import gardenLarge from '@/assets/images/photos/garden-1600.webp'
import gardenJpeg from '@/assets/images/photos/garden.jpg'
import editorialSmall from '@/assets/images/photos/editorial-960.webp'
import editorialLarge from '@/assets/images/photos/editorial-1600.webp'
import editorialJpeg from '@/assets/images/photos/editorial.jpg'
import closingSmall from '@/assets/images/photos/closing-960.webp'
import closingLarge from '@/assets/images/photos/closing-1600.webp'
import closingJpeg from '@/assets/images/photos/closing.jpg'

// 小尺寸优先供拼图使用；高像素密度屏幕由浏览器选择大图。
const photos = {
  cover: {
    src: coverJpeg,
    srcSet: `${coverSmall} 720w, ${coverLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇在蓝天花道前的婚纱照',
    position: '50% 50%',
  },
  portrait: {
    src: portraitJpeg,
    srcSet: `${portraitSmall} 720w, ${portraitLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇在窗边相依的婚纱照',
    position: '50% 40%',
  },
  studio: {
    src: studioJpeg,
    srcSet: `${studioSmall} 720w, ${studioLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇身着白色礼服的婚纱照',
    position: '50% 42%',
  },
  panorama: {
    src: panoramaJpeg,
    srcSet: `${panoramaSmall} 960w, ${panoramaLarge} 1600w`,
    width: 1600,
    height: 591,
    alt: '李光耀与方紫薇牵手远望山间教堂',
    position: '50% 50%',
  },
  garden: {
    src: gardenJpeg,
    srcSet: `${gardenSmall} 720w, ${gardenLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇在石门与白花前的合影',
    position: '50% 58%',
  },
  editorial: {
    src: editorialJpeg,
    srcSet: `${editorialSmall} 720w, ${editorialLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇在海景油画前的婚纱照',
    position: '50% 46%',
  },
  closing: {
    src: closingJpeg,
    srcSet: `${closingSmall} 720w, ${closingLarge} 1200w`,
    width: 1200,
    height: 1600,
    alt: '李光耀与方紫薇在暖金色光影中的合影',
    position: '50% 48%',
  },
} satisfies Record<string, WeddingPhoto>

export const weddingPhotos = {
  cover: photos.cover,
  countdown: [photos.portrait, photos.studio],
  details: photos.panorama,
  closing: [photos.garden, photos.editorial, photos.closing],
} as const
