import { Link, NavLink } from 'react-router-dom'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const tabs: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Journal', icon: 'home', end: true },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/insights', label: 'Insights', icon: 'chart' },
  { to: '/me', label: 'Me', icon: 'user' },
]

function Tab({ to, label, icon, end }: (typeof tabs)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold ${
          isActive ? 'text-salsa-text' : 'text-muted'
        }`
      }
    >
      <Icon name={icon} size={24} />
      {label}
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t-2 border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-end px-2">
        <Tab {...tabs[0]} />
        <Tab {...tabs[1]} />
        <div className="flex flex-1 justify-center">
          <Link
            to="/capture"
            aria-label="Quick capture"
            className="-mt-6 grid size-16 place-items-center rounded-full border-2 border-ink bg-salsa text-on-salsa shadow-[3px_3px_0_var(--shadow)] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Icon name="plus" size={32} strokeWidth={2.8} />
          </Link>
        </div>
        <Tab {...tabs[2]} />
        <Tab {...tabs[3]} />
      </div>
    </nav>
  )
}
