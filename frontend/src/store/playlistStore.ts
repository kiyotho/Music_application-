import { create } from 'zustand'
import { loadPlaylists, savePlaylists, type Playlist } from '../lib/storage'

type PlaylistState = {
  playlists: Playlist[]
  createPlaylist: (name: string) => void
  renamePlaylist: (id: string, name: string) => void
  deletePlaylist: (id: string) => void
  addTrackToPlaylist: (playlistId: string, trackId: string) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: loadPlaylists(),

  createPlaylist: (name) =>
    set(() => {
      const now = Date.now()
      const next: Playlist = {
        id: crypto.randomUUID(),
        name: name.trim() || 'New Playlist',
        trackIds: [],
        createdAt: now,
        updatedAt: now,
      }
      const updated = [next, ...get().playlists]
      savePlaylists(updated)
      return { playlists: updated }
    }),

  renamePlaylist: (id, name) =>
    set(() => {
      const trimmed = name.trim()
      if (!trimmed) return { playlists: get().playlists }
      const updated = get().playlists.map((p) =>
        p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p,
      )
      savePlaylists(updated)
      return { playlists: updated }
    }),

  deletePlaylist: (id) =>
    set(() => {
      const updated = get().playlists.filter((p) => p.id !== id)
      savePlaylists(updated)
      return { playlists: updated }
    }),

  addTrackToPlaylist: (playlistId, trackId) =>
    set(() => {
      const updated = get().playlists.map((p) => {
        if (p.id !== playlistId) return p
        if (p.trackIds.includes(trackId)) return p
        return { ...p, trackIds: [trackId, ...p.trackIds], updatedAt: Date.now() }
      })
      savePlaylists(updated)
      return { playlists: updated }
    }),

  removeTrackFromPlaylist: (playlistId, trackId) =>
    set(() => {
      const updated = get().playlists.map((p) => {
        if (p.id !== playlistId) return p
        return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() }
      })
      savePlaylists(updated)
      return { playlists: updated }
    }),
}))

