import { useMemo, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { PlaylistPicker } from '../lib/components/PlaylistPicker'
import { searchYouTube, type YouTubeSearchResult } from '../lib/api'
import { saveTrackToRegistry } from '../lib/trackRegistry'
import { usePlaylistStore } from '../store/playlistStore'
import { usePlayerStore } from '../store/playerStore'
import type { Track } from '../types'

function toTrack(r: YouTubeSearchResult): Track {
  return {
    id: `yt:${r.videoId}`,
    title: r.title,
    artist: r.channel ?? undefined,
    albumArtUrl: r.thumbnail ?? undefined,
    durationSec: r.duration ?? undefined,
    source: { type: 'youtube', videoId: r.videoId },
  }
}

export function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<YouTubeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addTrackToPlaylist = usePlaylistStore((s) => s.addTrackToPlaylist)
  const playTrack = usePlayerStore((s) => s.playTrack)

  const queueTracks = useMemo(() => results.map(toTrack), [results])

  async function onSearch() {
    const query = q.trim()
    if (!query) return
    setLoading(true)
    setError(null)
    try {
      const data = await searchYouTube(query)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-neutral-400">
          Searches YouTube and streams audio via the backend using <code className="rounded bg-neutral-900 px-1">yt-dlp</code>.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
          <SearchIcon size={18} className="text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onSearch()
            }}
            placeholder="Search songs, artists, albums..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
          />
        </div>
        <button
          onClick={() => void onSearch()}
          disabled={loading || !q.trim()}
          className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {queueTracks.map((track) => (
          <div
            key={track.id}
            className="group rounded-lg border border-neutral-900 bg-neutral-950 p-3 hover:border-neutral-800"
          >
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-900">
                {track.albumArtUrl ? (
                  <img src={track.albumArtUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{track.title}</div>
                <div className="truncate text-xs text-neutral-400">{track.artist ?? 'YouTube'}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
                    onClick={() => {
                      saveTrackToRegistry(track)
                      playTrack(track, queueTracks)
                    }}
                  >
                    Play
                  </button>

                  <PlaylistPicker
                    onPick={(playlistId) => {
                      saveTrackToRegistry(track)
                      addTrackToPlaylist(playlistId, track.id)
                    }}
                    label="Add"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!queueTracks.length && !loading ? (
        <div className="rounded-lg border border-neutral-900 bg-neutral-950 p-5 text-sm text-neutral-400">
          Try searching for something like <span className="text-neutral-200">“Daft Punk One More Time”</span>.
        </div>
      ) : null}
    </div>
  )
}
