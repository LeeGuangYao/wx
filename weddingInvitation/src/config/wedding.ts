import type { WeddingConfig } from '@/types/wedding'

export const weddingConfig: WeddingConfig = {
  couple: {
    groom: '李光耀',
    bride: '方紫薇',
  },
  dateISO: '2026-10-11',
  dateShort: '2026.10.11',
  dateSlash: '2026 / 10 / 11',
  dateLong: '2026年10月11日',
  weekday: '星期日',
  time: '晚上 6:00',
  time24: '18:00',
  venue: {
    name: '扬州狮子楼（瘦西湖店）',
    address: '扬州市广陵区柳湖路 8 号（扬师院东门内，近瘦西湖南门）',
  },
  copy: {
    heroEyebrow: 'WEDDING INVITATION',
    invitationEyebrow: 'OUR WEDDING',
    invitationTitle: '我们结婚啦',
    invitationLines: [
      '从此，两个人的故事',
      '要写成同一个名字。',
      '',
      '诚挚邀请您',
      '来见证我们的婚礼。',
    ],
    detailsEyebrow: 'WEDDING DAY',
    navigationLabel: '导航前往',
    closingTitle: '期待与你相见',
    closingEyebrow: 'SEE YOU AT OUR WEDDING',
  },
}
