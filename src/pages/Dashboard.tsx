import { Link } from 'react-router-dom'
import { FolderSearch, HardDrive, FileText, CheckCircle, Clock, ArrowRight, Sparkles } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useProfile } from '@/hooks/useProfile'
import { useFiles } from '@/hooks/useFiles'
import { FREE_FILE_LIMIT } from '@/lib/stripe'

export default function Dashboard() {
  const { profile, isPro } = useProfile()
  const { files, pendingFiles, organizedFiles, loading } = useFiles()

  const usagePercent = isPro ? 0 : Math.min(100, Math.round((organizedFiles.length / FREE_FILE_LIMIT) * 100))

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Bonjour, {profile?.full_name?.split(' ')[0] ?? 'là'} 👋
          </h1>
          <p className="text-slate-400 mt-1">Voici un aperçu de votre activité Sortify</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total fichiers', value: loading ? '…' : files.length, icon: FileText, color: 'text-blue-400' },
            { label: 'En attente', value: loading ? '…' : pendingFiles.length, icon: Clock, color: 'text-amber-400' },
            { label: 'Organisés', value: loading ? '…' : organizedFiles.length, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Plan', value: isPro ? 'Pro' : 'Free', icon: Sparkles, color: 'text-brand-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <Icon size={20} className={`${color} mb-3`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Usage bar (free only) */}
        {!isPro && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Utilisation mensuelle</p>
              <span className="text-xs text-slate-400">{organizedFiles.length} / {FREE_FILE_LIMIT} fichiers</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent >= 80 && (
              <p className="text-xs text-amber-400 mt-2">
                Vous approchez de la limite.{' '}
                <Link to="/pricing" className="underline hover:text-amber-300">Passer à Pro →</Link>
              </p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/organizer" className="card hover:border-brand-500/30 transition-all group flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/25 transition-colors">
              <FolderSearch size={22} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">Organiser des fichiers</h3>
              <p className="text-sm text-slate-400">Uploadez vos fichiers et laissez l'IA les trier automatiquement</p>
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors mt-1" />
          </Link>

          <Link to="/drive" className={`card transition-all group flex items-start gap-4 ${isPro ? 'hover:border-brand-500/30' : 'opacity-60 cursor-not-allowed'}`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
              <HardDrive size={22} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">Google Drive</h3>
                {!isPro && <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <p className="text-sm text-slate-400">Synchronisez et organisez vos fichiers Drive directement</p>
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors mt-1" />
          </Link>
        </div>

        {/* Recent files */}
        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Fichiers récents</h2>
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Nom</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Source</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Statut</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Dossier suggéré</th>
                  </tr>
                </thead>
                <tbody>
                  {files.slice(0, 8).map(f => (
                    <tr key={f.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 text-white font-medium truncate max-w-[200px]">{f.original_name}</td>
                      <td className="px-6 py-3 text-slate-400 capitalize">{f.source === 'google_drive' ? '☁ Drive' : '⬆ Upload'}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          f.status === 'organized' ? 'bg-green-500/15 text-green-400' :
                          f.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-slate-500/15 text-slate-400'
                        }`}>
                          {f.status === 'organized' ? 'Organisé' : f.status === 'pending' ? 'En attente' : 'Ignoré'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-400">{f.suggested_folder ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
