import { Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { getTrackFromRegistry } from '../lib/trackRegistry'
import { useHistoryStore } from '../store/historyStore'
import { usePlayerStore } from '../store/playerStore'
import type { Track } from '../types'

function formatDateTime(ts: number) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

export function HistoryPage() {
  const entries = useHistoryStore((s) => s.entries)
  const clear = useHistoryStore((s) => s.clear)
  const remove = useHistoryStore((s) => s.remove)
  const setQueue = usePlayerStore((s) => s.setQueue)
  const playTrack = usePlayerStore((s) => s.playTrack)

  const tracks = useMemo(() => {
    return entries
      .map((e) => ({ entry: e, track: getTrackFromRegistry(e.trackId) }))
      .filter((x): x is { entry: { trackId: string; playedAt: number }; track: Track } => Boolean(x.track))
  }, [entries])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-neutral-400">Recently played tracks (saved locally).</p>
        </div>
        <button
          className="rounded-md border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-900"
          onClick={clear}
          disabled={!entries.length}
        >
          Clear
        </button>
      </header>

      <section className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{tracks.length} items</div>
          <button
            className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
            onClick={() => setQueue(tracks.map((t) => t.track), 0)}
            disabled={!tracks.length}
          >
            Queue all
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {tracks.map(({ entry, track }) => (
            <div
              key={`${entry.trackId}:${entry.playedAt}`}
              className="flex items-center justify-between gap-3 rounded-md border border-neutral-900 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{track.title}</div>
                <div className="truncate text-xs text-neutral-500">
                  {track.artist ?? ''} • {formatDateTime(entry.playedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border border-neutral-800 px-2 py-1 text-xs font-semibold text-neutral-100 hover:bg-neutral-900"
                  onClick={() => playTrack(track, tracks.map((t) => t.track))}
                >
                  Play
                </button>
                <button
                  className="rounded-md border border-neutral-800 p-2 text-neutral-200 hover:bg-neutral-900"
                  aria-label="Remove from history"
                  onClick={() => remove(entry.trackId, entry.playedAt)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {!tracks.length ? <div className="text-sm text-neutral-500">No history yet.</div> : null}
        </div>
      </section>
    </div>
  )
}

