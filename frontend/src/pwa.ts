import { registerSW } from 'virtual:pwa-register'

export function registerPWA() {
  if (import.meta.env.DEV) {
    // Avoid dev-time "flash then blank" caused by stale SW caches.
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const r of regs) void r.unregister()
      })
    }
    return
  }

  registerSW({ immediate: true })
}

