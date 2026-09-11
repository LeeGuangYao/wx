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
  time: '晚上 8:00',
  time24: '20:00',
  venue: {
    name: '扬州中青国际酒店(市政府店)',
    address: '江苏省扬州市邗江区邗江中路631号',
  },
  copy: {
    heroEyebrow: 'WEDDING INVITATION',
    invitationEyebrow: 'OUR WEDDING',
    invitationTitle: '我们结婚啦',
    invitationLines: [
      '诚挚邀请您',
      '来见证我们的婚礼。',
    ],
    countdownEyebrow: 'Countdown',
    countdownTitle: '距离我们的婚礼',
    countdownPrefix: '还有',
    detailsEyebrow: 'Wedding Details',
    detailsTitle: '婚礼信息',
    navigationLabel: '点击查看地图 · 开始导航',
    closingTitle: '期待与你相见',
    closingEyebrow: 'SEE YOU AT OUR WEDDING',
  },
}
