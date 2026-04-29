import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2, Upload } from 'lucide-react'
import { addLocalTrack, listLocalTracks, removeLocalTrack, type LocalTrackRecord } from '../lib/localLibrary'
import { getTrackFromRegistry, saveTrackToRegistry } from '../lib/trackRegistry'
import { usePlaylistStore } from '../store/playlistStore'
import { usePlayerStore } from '../store/playerStore'
import type { Track } from '../types'

function localRecordToTrack(r: LocalTrackRecord): Track {
  return {
    id: `local:${r.id}`,
    title: r.name,
    artist: 'Local file',
    source: { type: 'local', localId: r.id },
  }
}

export function LibraryPage() {
  const [localTracks, setLocalTracks] = useState<LocalTrackRecord[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playlists = usePlaylistStore((s) => s.playlists)
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist)
  const renamePlaylist = usePlaylistStore((s) => s.renamePlaylist)
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist)
  const removeTrackFromPlaylist = usePlaylistStore((s) => s.removeTrackFromPlaylist)

  const playTrack = usePlayerStore((s) => s.playTrack)
  const setQueue = usePlayerStore((s) => s.setQueue)

  const localQueue = useMemo(() => localTracks.map(localRecordToTrack), [localTracks])

  async function refresh() {
    const data = await listLocalTracks()
    setLocalTracks(data)
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return
    setBusy(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/') && !file.name.toLowerCase().endsWith('.mp3')) continue
        const rec = await addLocalTrack(file)
        const track = localRecordToTrack(rec)
        saveTrackToRegistry(track)
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your Library</h1>
        <p className="text-sm text-neutral-400">Local MP3s + playlists saved in your browser.</p>
      </header>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Local Library</div>
            <div className="text-xs text-neutral-400">Upload or drag-drop MP3 files.</div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200">
            <Upload size={16} />
            <span>{busy ? 'Uploading…' : 'Upload'}</span>
            <input
              type="file"
              accept="audio/*,.mp3"
              multiple
              className="hidden"
              onChange={(e) => void onFiles(e.target.files)}
              disabled={busy}
            />
          </label>
        </div>

        <div
          className="mt-3 rounded-md border border-dashed border-neutral-800 p-4 text-sm text-neutral-400"
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void onFiles(e.dataTransfer.files)
          }}
        >
          Drop files here
        </div>

        <div className="mt-4 space-y-2">
          {localQueue.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-md border border-neutral-900 bg-neutral-950 px-3 py-2 hover:border-neutral-800"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="truncate text-xs text-neutral-400">Local</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
                  onClick={() => {
                    saveTrackToRegistry(t)
                    playTrack(t, localQueue)
                  }}
                >
                  Play
                </button>
                <button
                  className="rounded-md border border-neutral-800 p-2 text-neutral-200 hover:bg-neutral-900"
                  aria-label="Remove"
                  onClick={() => {
                    const localId = t.source.type === 'local' ? t.source.localId : null
                    if (!localId) return
                    void (async () => {
                      await removeLocalTrack(localId)
                      await refresh()
                    })()
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {!localQueue.length ? (
            <div className="text-sm text-neutral-500">No local tracks yet.</div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Playlists</div>
            <div className="text-xs text-neutral-400">Stored in localStorage (personal use).</div>
          </div>
          <button
            className="rounded-md border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-900"
            onClick={() => {
              const name = (prompt('Playlist name') || '').trim()
              if (!name) return
              createPlaylist(name)
            }}
          >
            New playlist
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {playlists.map((p) => {
            const tracks = p.trackIds
              .map((id) => getTrackFromRegistry(id))
              .filter((t): t is Track => Boolean(t))

            return (
              <div key={p.id} className="rounded-md border border-neutral-900 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-neutral-500">{p.trackIds.length} tracks</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 disabled:opacity-50"
                      disabled={!tracks.length}
                      onClick={() => setQueue(tracks, 0)}
                    >
                      Queue
                    </button>
                    <button
                      className="rounded-md border border-neutral-800 p-2 text-neutral-200 hover:bg-neutral-900"
                      aria-label="Rename"
                      onClick={() => {
                        const name = (prompt('Rename playlist', p.name) || '').trim()
                        if (!name) return
                        renamePlaylist(p.id, name)
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="rounded-md border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-100 hover:bg-neutral-900"
                      onClick={() => deletePlaylist(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {tracks.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-neutral-900 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm">{t.title}</div>
                        <div className="truncate text-xs text-neutral-500">{t.artist ?? ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-md border border-neutral-800 px-2 py-1 text-xs font-semibold text-neutral-100 hover:bg-neutral-900"
                          onClick={() => playTrack(t, tracks)}
                        >
                          Play
                        </button>
                        <button
                          className="rounded-md border border-neutral-800 p-2 text-neutral-200 hover:bg-neutral-900"
                          aria-label="Remove from playlist"
                          onClick={() => removeTrackFromPlaylist(p.id, t.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {p.trackIds.length > 6 ? (
                    <div className="text-xs text-neutral-500">…and more</div>
                  ) : null}
                </div>
              </div>
            )
          })}

          {!playlists.length ? (
            <div className="text-sm text-neutral-500">No playlists yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

