import type { PhotoChapter } from '@/types/photo'
import { albumChapters } from './album'
import { weddingPhotos } from './photos'

const allPhotos = [...weddingPhotos.countdown, ...albumChapters.flatMap(chapter => [...chapter.photos])]
export interface AlbumPage extends PhotoChapter {
  layout: 'panorama' | 'editorial' | 'cinematic'
}

const captions = [
  { id: 'our-album', title: '初见心动', description: '山风与花开，都不及身旁的你。', layout: 'panorama', order: [5, 0, 3, 1, 4, 2] },
  { id: 'our-days', title: '朝夕相伴', description: '光落在窗边，你在我身边。', layout: 'editorial', order: [7, 8, 6, 9, 10, 11] },
  { id: 'our-forever', title: '余生有你', description: '往后的风景，都想和你一起。', layout: 'cinematic', order: [17, 12, 15, 16, 13, 14] },
] as const

export const albumPages: readonly AlbumPage[] = captions.map(({ order, ...caption }, index) => ({
  ...caption,
  eyebrow: `OUR STORY / 0${index + 1}`,
  // Each composition has its own hero photo and reading order; every original appears once.
  photos: order.map(photoIndex => allPhotos[photoIndex]!),
}))
