export function getCountdown(target: number, now = Date.now()) {
  const seconds = Math.floor(Math.max(0, target - now) / 1000)

  return {
    days: String(Math.floor(seconds / 86400)),
    hours: String(Math.floor(seconds / 3600) % 24).padStart(2, '0'),
    minutes: String(Math.floor(seconds / 60) % 60).padStart(2, '0'),
    seconds: String(seconds % 60).padStart(2, '0'),
  }
}
