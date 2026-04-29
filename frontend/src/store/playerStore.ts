import { create } from 'zustand'
import type { Track } from '../types'

type PlayerState = {
  queue: Track[]
  currentIndex: number
  isPlaying: boolean
  positionSec: number
  durationSec: number
  volume: number
  error: string | null

  setQueue: (tracks: Track[], startIndex?: number) => void
  playTrack: (track: Track, queue?: Track[]) => void
  next: () => void
  previous: () => void
  togglePlay: () => void
  setIsPlaying: (value: boolean) => void
  setPositionSec: (value: number) => void
  setDurationSec: (value: number) => void
  seekTo: (value: number) => void
  setVolume: (value: number) => void
  setError: (value: string | null) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  positionSec: 0,
  durationSec: 0,
  volume: 0.9,
  error: null,

  setQueue: (tracks, startIndex = 0) =>
    set({
      queue: tracks,
      currentIndex: tracks.length ? Math.min(Math.max(startIndex, 0), tracks.length - 1) : -1,
      positionSec: 0,
      durationSec: 0,
      error: null,
    }),

  playTrack: (track, queue) =>
    set(() => {
      const nextQueue = queue ?? get().queue
      const idx = nextQueue.findIndex((t) => t.id === track.id)
      return {
        queue: nextQueue.length ? nextQueue : [track],
        currentIndex: idx >= 0 ? idx : 0,
        isPlaying: true,
        positionSec: 0,
        durationSec: 0,
        error: null,
      }
    }),

  next: () =>
    set((s) => {
      if (!s.queue.length) return s
      const nextIndex = Math.min(s.currentIndex + 1, s.queue.length - 1)
      return { currentIndex: nextIndex, isPlaying: true, positionSec: 0, durationSec: 0 }
    }),

  previous: () =>
    set((s) => {
      if (!s.queue.length) return s
      const prevIndex = Math.max(s.currentIndex - 1, 0)
      return { currentIndex: prevIndex, isPlaying: true, positionSec: 0, durationSec: 0 }
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setIsPlaying: (value) => set({ isPlaying: value }),
  setPositionSec: (value) => set({ positionSec: value }),
  setDurationSec: (value) => set({ durationSec: value }),
  seekTo: (value) => set({ positionSec: Math.max(0, value) }),
  setVolume: (value) => set({ volume: Math.min(1, Math.max(0, value)) }),
  setError: (value) => set({ error: value }),
}))

export function getCurrentTrack(state: Pick<PlayerState, 'queue' | 'currentIndex'>): Track | null {
  if (state.currentIndex < 0) return null
  return state.queue[state.currentIndex] ?? null
}

