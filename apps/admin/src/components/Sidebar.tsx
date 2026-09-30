import { LayoutDashboard, Users, CalendarClock, PawPrint, Star, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Users', icon: Users, to: '/users' },
  { label: 'Pets', icon: PawPrint, to: '/pets' },
  { label: 'Bookings', icon: CalendarClock, to: '/bookings' },
  { label: 'Reviews', icon: Star, to: '/reviews' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <aside
      className={`relative flex flex-col bg-sky-400 text-white transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-4 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-500 shadow-md"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          size={18}
          className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="flex flex-col items-center gap-1 px-6 py-8">
        <span className="text-3xl">🐾</span>
        {!collapsed && (
          <>
            <span className="text-lg font-extrabold leading-tight">
              PawBorrow
            </span>
            <span className="text-[10px] tracking-wide text-sky-100">
              FOR PET &amp; PET SUPPLIES
            </span>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-2 px-4">
        {links.map(({ label, icon: Icon, to }) => {
          const active = pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-sky-500 shadow-sm'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}