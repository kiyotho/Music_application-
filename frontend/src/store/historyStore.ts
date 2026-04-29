import { create } from 'zustand'
import { loadHistory, saveHistory, type HistoryEntry } from '../lib/storage'

type HistoryState = {
  entries: HistoryEntry[]
  addPlayed: (trackId: string) => void
  remove: (trackId: string, playedAt: number) => void
  clear: () => void
}

const MAX_ENTRIES = 200

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: loadHistory(),

  addPlayed: (trackId) =>
    set(() => {
      const now = Date.now()
      const next = [{ trackId, playedAt: now }, ...get().entries]
        // de-dupe very recent duplicates (double fires)
        .filter((e, idx, arr) => {
          if (idx === 0) return true
          const prev = arr[idx - 1]
          return !(prev && prev.trackId === e.trackId && prev.playedAt - e.playedAt < 1500)
        })
        .slice(0, MAX_ENTRIES)
      saveHistory(next)
      return { entries: next }
    }),

  remove: (trackId, playedAt) =>
    set(() => {
      const next = get().entries.filter((e) => !(e.trackId === trackId && e.playedAt === playedAt))
      saveHistory(next)
      return { entries: next }
    }),

  clear: () =>
    set(() => {
      saveHistory([])
      return { entries: [] }
    }),
}))

