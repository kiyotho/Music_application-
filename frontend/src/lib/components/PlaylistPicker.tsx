import { useState } from 'react'
import { usePlaylistStore } from '../../store/playlistStore'

export function PlaylistPicker(props: {
  onPick: (playlistId: string) => void
  disabled?: boolean
  label?: string
}) {
  const playlists = usePlaylistStore((s) => s.playlists)
  const [open, setOpen] = useState(false)

  const disabled = props.disabled || !playlists.length

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1.5 text-xs font-semibold text-neutral-100 hover:bg-neutral-900 disabled:opacity-50"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        type="button"
        title={playlists.length ? 'Add to playlist' : 'Create a playlist in Library first'}
      >
        {props.label ?? 'Add'}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 shadow-lg">
          <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400">Add to playlist</div>
          <div className="max-h-56 overflow-y-auto">
            {playlists.map((p) => (
              <button
                key={p.id}
                className="block w-full px-3 py-2 text-left text-sm text-neutral-100 hover:bg-neutral-900"
                onClick={() => {
                  props.onPick(p.id)
                  setOpen(false)
                }}
                type="button"
              >
                <div className="truncate">{p.name}</div>
                <div className="text-[11px] text-neutral-500">{p.trackIds.length} tracks</div>
              </button>
            ))}
          </div>
          <button
            className="block w-full border-t border-neutral-900 px-3 py-2 text-left text-xs font-semibold text-neutral-300 hover:bg-neutral-900"
            onClick={() => setOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  )
}
