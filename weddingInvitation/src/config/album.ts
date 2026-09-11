import type { PhotoChapter } from '@/types/photo'
import dscf0017960 from '@/assets/images/album/dscf0017-960.webp'
import dscf00171600 from '@/assets/images/album/dscf0017-1600.webp'
import dscf0017Jpeg from '@/assets/images/album/dscf0017.jpg'
import dscf0011960 from '@/assets/images/album/dscf0011-960.webp'
import dscf00111600 from '@/assets/images/album/dscf0011-1600.webp'
import dscf0011Jpeg from '@/assets/images/album/dscf0011.jpg'
import dscf0049960 from '@/assets/images/album/dscf0049-960.webp'
import dscf00491600 from '@/assets/images/album/dscf0049-1600.webp'
import dscf0049Jpeg from '@/assets/images/album/dscf0049.jpg'
import dscf0058960 from '@/assets/images/album/dscf0058-960.webp'
import dscf00581600 from '@/assets/images/album/dscf0058-1600.webp'
import dscf0058Jpeg from '@/assets/images/album/dscf0058.jpg'
import dscf0164960 from '@/assets/images/album/dscf0164-960.webp'
import dscf01641600 from '@/assets/images/album/dscf0164-1600.webp'
import dscf0164Jpeg from '@/assets/images/album/dscf0164.jpg'
import dscf0147960 from '@/assets/images/album/dscf0147-960.webp'
import dscf01471600 from '@/assets/images/album/dscf0147-1600.webp'
import dscf0147Jpeg from '@/assets/images/album/dscf0147.jpg'
import dscf0229960 from '@/assets/images/album/dscf0229-960.webp'
import dscf02291600 from '@/assets/images/album/dscf0229-1600.webp'
import dscf0229Jpeg from '@/assets/images/album/dscf0229.jpg'
import dscf0159960 from '@/assets/images/album/dscf0159-960.webp'
import dscf01591600 from '@/assets/images/album/dscf0159-1600.webp'
import dscf0159Jpeg from '@/assets/images/album/dscf0159.jpg'
import dscf0273960 from '@/assets/images/album/dscf0273-960.webp'
import dscf02731600 from '@/assets/images/album/dscf0273-1600.webp'
import dscf0273Jpeg from '@/assets/images/album/dscf0273.jpg'
import dscf0253960 from '@/assets/images/album/dscf0253-960.webp'
import dscf02531600 from '@/assets/images/album/dscf0253-1600.webp'
import dscf0253Jpeg from '@/assets/images/album/dscf0253.jpg'
import dscf0262960 from '@/assets/images/album/dscf0262-960.webp'
import dscf02621600 from '@/assets/images/album/dscf0262-1600.webp'
import dscf0262Jpeg from '@/assets/images/album/dscf0262.jpg'
import dscf0257960 from '@/assets/images/album/dscf0257-960.webp'
import dscf02571600 from '@/assets/images/album/dscf0257-1600.webp'
import dscf0257Jpeg from '@/assets/images/album/dscf0257.jpg'
import dscf0298960 from '@/assets/images/album/dscf0298-960.webp'
import dscf02981600 from '@/assets/images/album/dscf0298-1600.webp'
import dscf0298Jpeg from '@/assets/images/album/dscf0298.jpg'
import dscf0314960 from '@/assets/images/album/dscf0314-960.webp'
import dscf03141600 from '@/assets/images/album/dscf0314-1600.webp'
import dscf0314Jpeg from '@/assets/images/album/dscf0314.jpg'
import dscf0356960 from '@/assets/images/album/dscf0356-960.webp'
import dscf03561600 from '@/assets/images/album/dscf0356-1600.webp'
import dscf0356Jpeg from '@/assets/images/album/dscf0356.jpg'
import dscf0352960 from '@/assets/images/album/dscf0352-960.webp'
import dscf03521600 from '@/assets/images/album/dscf0352-1600.webp'
import dscf0352Jpeg from '@/assets/images/album/dscf0352.jpg'

// 从授权婚纱照目录精选；相册图片均由原片生成，宽度标注为资源实际像素。
export const albumChapters = [
  {
    id: 'mountains',
    eyebrow: 'IN THE MOUNTAINS',
    title: '山间誓言',
    description: '山风、白云，和身旁的你。',
    photos: [
      { src: dscf0017Jpeg, srcSet: `${dscf0017960} 960w, ${dscf00171600} 1600w`, width: 1600, height: 1200, alt: '两人在山间教堂前牵手，白色婚纱铺展在草地上' },
      { src: dscf0011Jpeg, srcSet: `${dscf0011960} 720w, ${dscf00111600} 1200w`, width: 1200, height: 1600, alt: '两人在山间教堂前并肩，手捧红色花束' },
      { src: dscf0049Jpeg, srcSet: `${dscf0049960} 720w, ${dscf00491600} 1200w`, width: 1200, height: 1600, alt: '两人在蓝天与白花环绕的礼堂中，扬起花瓣' },
      { src: dscf0058Jpeg, srcSet: `${dscf0058960} 960w, ${dscf00581600} 1600w`, width: 1600, height: 899, alt: '蓝天白云下，两人在白色花道旁相望' }
    ],
  },
  {
    id: 'windows',
    eyebrow: 'A LITTLE CLOSER',
    title: '窗边时光',
    description: '光落在窗边，你在我身边。',
    photos: [
      { src: dscf0164Jpeg, srcSet: `${dscf0164960} 960w, ${dscf01641600} 1600w`, width: 1600, height: 1200, alt: '两人相依在拱窗与水晶灯下，婚纱铺满阳光照亮的地面' },
      { src: dscf0147Jpeg, srcSet: `${dscf0147960} 720w, ${dscf01471600} 1200w`, width: 1200, height: 1600, alt: '两人在复古窗边牵手相望' },
      { src: dscf0229Jpeg, srcSet: `${dscf0229960} 720w, ${dscf02291600} 1200w`, width: 1200, height: 1600, alt: '新娘戴着白色花帽，与新郎在窗边并肩' },
      { src: dscf0159Jpeg, srcSet: `${dscf0159960} 960w, ${dscf01591600} 1600w`, width: 1600, height: 1067, alt: '窗边，新郎轻吻新娘的额头' }
    ],
  },
  {
    id: 'white',
    eyebrow: 'SIMPLY US',
    title: '纯白心动',
    description: '把心动，留在每一个日常。',
    photos: [
      { src: dscf0273Jpeg, srcSet: `${dscf0273960} 960w, ${dscf02731600} 1600w`, width: 1600, height: 1200, alt: '两人身着白色礼服依偎，手捧白色花束' },
      { src: dscf0253Jpeg, srcSet: `${dscf0253960} 720w, ${dscf02531600} 1200w`, width: 1200, height: 1600, alt: '白色礼服的两人侧身相依，新娘轻抚新郎的脸颊' },
      { src: dscf0262Jpeg, srcSet: `${dscf0262960} 720w, ${dscf02621600} 1200w`, width: 1200, height: 1600, alt: '两人穿着白色礼服并肩而立，手握花束' },
      { src: dscf0257Jpeg, srcSet: `${dscf0257960} 960w, ${dscf02571600} 1600w`, width: 1600, height: 1200, alt: '两人穿着白色礼服靠近镜头，笑着依偎' }
    ],
  },
  {
    id: 'light',
    eyebrow: 'LOVE IN THE LIGHT',
    title: '光影相伴',
    description: '往后的风景，都想和你一起。',
    photos: [
      { src: dscf0298Jpeg, srcSet: `${dscf0298960} 960w, ${dscf02981600} 1600w`, width: 1600, height: 1200, alt: '海景油画前，两人身着黑色西装与白色婚纱亲密相依' },
      { src: dscf0314Jpeg, srcSet: `${dscf0314960} 720w, ${dscf03141600} 1200w`, width: 1200, height: 1600, alt: '复古沙发前，新娘展开婚纱，新郎在身后相伴' },
      { src: dscf0356Jpeg, srcSet: `${dscf0356960} 720w, ${dscf03561600} 1200w`, width: 1200, height: 1600, alt: '暖金色光影里，新娘站在新郎身旁，白色裙摆铺开' },
      { src: dscf0352Jpeg, srcSet: `${dscf0352960} 960w, ${dscf03521600} 1600w`, width: 1600, height: 1200, alt: '暖金色背景前，两人手捧花束温柔对望' }
    ],
  }
] as const satisfies readonly PhotoChapter[]
