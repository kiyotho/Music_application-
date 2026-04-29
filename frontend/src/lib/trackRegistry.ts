import type { Track } from '../types'

const KEY = 'music_app_track_registry_v1'

type Registry = Record<string, Track>

export function loadTrackRegistry(): Registry {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Registry
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveTrackToRegistry(track: Track) {
  const existing = loadTrackRegistry()
  existing[track.id] = track
  localStorage.setItem(KEY, JSON.stringify(existing))
}

export function getTrackFromRegistry(id: string): Track | null {
  const existing = loadTrackRegistry()
  return existing[id] ?? null
}

