import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { usePlayerStore, getCurrentTrack } from '../../store/playerStore'
import { useSettingsStore } from '../../store/settingsStore'

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function BottomPlayer() {
  const { queue, currentIndex, isPlaying, positionSec, durationSec, volume } = usePlayerStore(
    useShallow((s) => ({
      queue: s.queue,
      currentIndex: s.currentIndex,
      isPlaying: s.isPlaying,
      positionSec: s.positionSec,
      durationSec: s.durationSec,
      volume: s.volume,
    })),
  )
  const { togglePlay, next, previous, seekTo, setVolume } = usePlayerStore()
  const dataSaver = useSettingsStore((s) => s.dataSaver)

  const currentTrack = useMemo(
    () => getCurrentTrack({ queue, currentIndex }),
    [queue, currentIndex],
  )

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 px-3 py-3">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-900">
            {currentTrack?.albumArtUrl ? (
              <img
                src={currentTrack.albumArtUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {currentTrack?.title ?? 'Not playing'}
            </div>
            <div className="truncate text-xs text-neutral-400">
              {currentTrack?.artist ?? (dataSaver ? 'Data Saver ON' : 'Data Saver OFF')}
            </div>
          </div>
          {dataSaver ? (
            <span className="ml-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
              Data Saver
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full p-2 text-neutral-200 hover:bg-neutral-900 disabled:opacity-40"
              onClick={previous}
              disabled={!currentTrack || currentIndex <= 0}
              aria-label="Previous"
            >
              <SkipBack size={20} />
            </button>
            <button
              className="rounded-full bg-white p-2 text-neutral-950 hover:bg-neutral-200 disabled:opacity-40"
              onClick={togglePlay}
              disabled={!currentTrack}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              className="rounded-full p-2 text-neutral-200 hover:bg-neutral-900 disabled:opacity-40"
              onClick={next}
              disabled={!currentTrack || currentIndex >= queue.length - 1}
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-xs text-neutral-400">
            <span className="w-10 text-right tabular-nums">{formatTime(positionSec)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(durationSec, 1)}
              step={0.25}
              value={Math.min(positionSec, Math.max(durationSec, 1))}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="h-1 w-full accent-white"
              aria-label="Seek"
              disabled={!currentTrack}
            />
            <span className="w-10 tabular-nums">{formatTime(durationSec)}</span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <Volume2 size={18} className="text-neutral-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-28 accent-white"
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  )
}
