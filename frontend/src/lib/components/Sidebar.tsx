import { Clock3, Home, Library, Search, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Item(props: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
          isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-900',
        ].join(' ')
      }
    >
      <span className="text-neutral-300">{props.icon}</span>
      <span>{props.label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-neutral-900 bg-neutral-950 p-4 md:block">
      <div className="mb-4">
        <div className="text-lg font-semibold tracking-tight">Music</div>
        <div className="text-xs text-neutral-400">Spotify-like PWA</div>
      </div>

      <nav className="space-y-1">
        <Item to="/" icon={<Home size={18} />} label="Home" />
        <Item to="/search" icon={<Search size={18} />} label="Search" />
        <Item to="/library" icon={<Library size={18} />} label="Your Library" />
        <Item to="/history" icon={<Clock3 size={18} />} label="History" />
        <Item to="/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>
    </aside>
  )
}

