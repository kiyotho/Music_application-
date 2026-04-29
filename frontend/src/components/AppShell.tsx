import { Outlet } from 'react-router-dom'
import { BottomPlayer } from './BottomPlayer'
import { Sidebar } from './Sidebar'
import { PlayerController } from './PlayerController'

export function AppShell() {
  return (
    <div className="h-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex h-full max-w-[1400px] flex-col">
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
            <Outlet />
          </main>
        </div>

        <BottomPlayer />
      </div>

      <PlayerController />
    </div>
  )
}

