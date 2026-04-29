import { useSettingsStore } from '../store/settingsStore'

export function SettingsPage() {
  const dataSaver = useSettingsStore((s) => s.dataSaver)
  const setDataSaver = useSettingsStore((s) => s.setDataSaver)

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-400">Tune quality vs data usage.</p>
      </header>

      <section className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Data Saver</div>
            <div className="mt-1 text-sm text-neutral-400">
              When ON, the backend requests a lower-quality audio stream from <code className="rounded bg-neutral-900 px-1">yt-dlp</code>.
            </div>
          </div>
          <button
            className={[
              'h-8 w-14 rounded-full border transition',
              dataSaver ? 'border-emerald-500/40 bg-emerald-500/20' : 'border-neutral-800 bg-neutral-900',
            ].join(' ')}
            onClick={() => setDataSaver(!dataSaver)}
            aria-label="Toggle data saver"
          >
            <span
              className={[
                'block h-7 w-7 translate-x-0.5 rounded-full bg-white transition',
                dataSaver ? 'translate-x-6' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Note: stream URLs expire. If playback stops after a while, just press Play again.
        </div>
      </section>
    </div>
  )
}

