import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-neutral-400">
          Search YouTube for music, upload local MP3s, and play everything in a single queue.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
          <div className="text-sm font-semibold">Start listening</div>
          <p className="mt-1 text-sm text-neutral-400">
            Use Search to find songs via YouTube and stream audio in the player.
          </p>
          <Link
            to="/search"
            className="mt-3 inline-flex rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
          >
            Go to Search
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-900 bg-neutral-950 p-4">
          <div className="text-sm font-semibold">Bring your own MP3s</div>
          <p className="mt-1 text-sm text-neutral-400">
            Upload or drag-drop local files into your library (stored in your browser).
          </p>
          <Link
            to="/library"
            className="mt-3 inline-flex rounded-md border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-900"
          >
            Open Library
          </Link>
        </div>
      </div>
    </div>
  )
}

