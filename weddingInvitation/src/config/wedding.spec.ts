import { describe, expect, it } from 'vitest'
import { getWeddingConfig, weddingConfig } from './wedding'

describe('weddingConfig', () => {
  it('contains every confirmed guest-facing detail', () => {
    expect(weddingConfig).toMatchObject({
      couple: { groom: '李光耀', bride: '方紫薇' },
      dateISO: '2026-10-11',
      dateShort: '2026.10.11',
      dateSlash: '2026 / 10 / 11',
      dateLong: '2026年10月11日',
      weekday: '星期日',
      time: '中午 12:00',
      time24: '12:00',
      venue: {
        name: '扬州中青国际酒店(市政府店)',
        address: '江苏省扬州市邗江区邗江中路631号',
        room: '四楼怡和厅',
      },
      copy: {
        heroEyebrow: 'WEDDING INVITATION',
        invitationEyebrow: 'OUR WEDDING',
        invitationTitle: '我们结婚啦',
        invitationLines: [
          '诚挚邀请您',
          '来见证我们的婚礼。',
        ],
        detailsEyebrow: 'Wedding Details',
        detailsTitle: '诚邀您来参加我们的回门宴',
        navigationLabel: '开始导航',
        closingTitle: '期待与你相见',
        closingEyebrow: 'SEE YOU AT OUR WEDDING',
      },
    })
  })

  it('uses a Sunday date', () => {
    expect(new Date(`${weddingConfig.dateISO}T00:00:00Z`).getUTCDay()).toBe(0)
  })

  it('keeps the October 2 invitation unchanged', () => {
    const shangshui = getWeddingConfig('?venue=shangshui')
    expect(shangshui.dateISO).toBe('2026-10-02')
    expect(shangshui.venue).toEqual({
      name: '桑尼贝尔连锁酒店(商水富商路店)',
      address: '河南省周口市商水县富商路',
      latitude: 33.565783,
      longitude: 114.606259,
    })
    expect(shangshui.copy.detailsTitle).toBe('婚礼信息')
  })
})
