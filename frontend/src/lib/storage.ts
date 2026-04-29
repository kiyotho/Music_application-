const SETTINGS_KEY = 'music_app_settings_v1'
const PLAYLISTS_KEY = 'music_app_playlists_v1'
const HISTORY_KEY = 'music_app_history_v1'

export type Settings = {
  dataSaver: boolean
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { dataSaver: false }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { dataSaver: Boolean(parsed.dataSaver) }
  } catch {
    return { dataSaver: false }
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export type Playlist = {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export function loadPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Playlist[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
}

export type HistoryEntry = {
  trackId: string
  playedAt: number
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

