import { Link, NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const links = [
  { to: '/', label: 'Journal', end: true },
  { to: '/search', label: 'Search' },
  { to: '/insights', label: 'Insights' },
  { to: '/me', label: 'Me' },
]

/**
 * Site header: logo, main navigation and the "Log a taco" button.
 * On phones the navigation drops to its own row under the logo.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8">
        <Link to="/" className="font-display text-2xl leading-none font-bold">
          Taco Journal <span aria-hidden="true">🌮</span>
        </Link>

        <nav aria-label="Main" className="order-3 flex w-full gap-1 md:order-none md:w-auto md:flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex-1 rounded-full border-2 px-4 py-2 text-center font-display text-base font-semibold transition md:flex-none ${
                  isActive
                    ? 'border-ink bg-sun-soft text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/capture" className="btn btn-primary btn-sm ml-auto md:ml-0">
          <Icon name="plus" size={18} strokeWidth={2.8} />
          Log a taco
        </Link>
      </div>
    </header>
  )
}
