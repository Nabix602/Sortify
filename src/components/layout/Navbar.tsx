import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderSearch, HardDrive, CreditCard, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizer', icon: FolderSearch, label: 'Organizer' },
  { to: '/drive', icon: HardDrive, label: 'Google Drive' },
  { to: '/pricing', icon: CreditCard, label: 'Plans' },
]

export default function Navbar() {
  const { signOut } = useAuth()
  const { profile, isPro } = useProfile()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="w-64 min-h-screen glass border-r border-white/[0.06] flex flex-col p-5 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">Sortify</span>
        {isPro && (
          <span className="ml-auto text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-medium">PRO</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] pt-4 mt-2">
        <div className="flex items-center gap-3 px-2 mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-8 h-8 rounded-full" alt="avatar" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold">
              {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name ?? 'Utilisateur'}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
