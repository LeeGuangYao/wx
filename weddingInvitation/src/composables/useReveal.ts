import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useReveal(target: Ref<HTMLElement | null>): void {
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const element = target.value
    if (!element) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduceMotion || !('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.classList.add('is-visible')
        observer?.unobserve(element)
      },
      { threshold: 0.18 },
    )

    observer.observe(element)
  })

  onBeforeUnmount(() => observer?.disconnect())
}
