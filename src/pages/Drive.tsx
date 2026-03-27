import { useState } from 'react'
import { HardDrive, RefreshCw, FolderOpen, Lock, CheckCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { useProfile } from '@/hooks/useProfile'
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

function getMimeIcon(mime: string) {
  if (mime.includes('image')) return '🖼'
  if (mime.includes('video')) return '🎬'
  if (mime.includes('audio')) return '🎵'
  if (mime.includes('pdf')) return '📄'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊'
  if (mime.includes('presentation')) return '📋'
  if (mime.includes('folder')) return '📁'
  return '📄'
}

export default function Drive() {
  const { isPro } = useProfile()
  const { user } = useAuth()
  const { driveFiles, loading, connected, listFiles, importFiles } = useGoogleDrive()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)

  if (!isPro) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-5">
              <Lock size={28} className="text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Fonctionnalité Pro</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              La synchronisation Google Drive est réservée aux abonnés Pro. Passez à Pro pour organiser vos fichiers Drive avec l'IA.
            </p>
            <Link to="/pricing" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} /> Passer à Pro
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const handleLoad = async () => {
    try {
      await listFiles()
      if (!connected) toast.error('Reconnectez-vous avec Google pour accéder à Drive.')
    } catch {
      toast.error('Erreur lors du chargement Drive')
    }
  }

  const handleImport = async () => {
    if (!user || selected.size === 0) return
    setImporting(true)
    try {
      const toImport = driveFiles.filter(f => selected.has(f.id))
      await importFiles(toImport, user.id)
      toast.success(`${toImport.length} fichier(s) importé(s) dans Sortify !`)
      setSelected(new Set())
    } catch {
      toast.error('Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  const folders = driveFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder')
  const regularFiles = driveFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder')

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <HardDrive size={24} className="text-blue-400" /> Google Drive
            </h1>
            <p className="text-slate-400 mt-1">Importez et organisez vos fichiers Drive avec l'IA</p>
          </div>
          <div className="flex gap-3">
            {selected.size > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                {importing
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Sparkles size={14} />
                }
                Importer ({selected.size})
              </button>
            )}
            <button
              onClick={handleLoad}
              disabled={loading}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {driveFiles.length === 0 ? 'Charger Drive' : 'Actualiser'}
            </button>
          </div>
        </div>

        {driveFiles.length === 0 && !loading && (
          <div className="text-center py-20">
            <HardDrive size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-2">Cliquez sur "Charger Drive" pour voir vos fichiers</p>
            <p className="text-xs text-slate-600">Vous devez être connecté avec votre compte Google</p>
          </div>
        )}

        {driveFiles.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">{driveFiles.length} élément(s) dans votre Drive</p>
              <button
                onClick={() => setSelected(selected.size === regularFiles.length ? new Set() : new Set(regularFiles.map(f => f.id)))}
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                {selected.size === regularFiles.length ? 'Désélectionner tout' : 'Tout sélectionner'}
              </button>
            </div>

            {folders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => listFiles(f.id)}
                    className="card py-3 text-left hover:border-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <FolderOpen size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-white truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {regularFiles.map(f => {
                const isSelected = selected.has(f.id)
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className={`card py-3 flex items-center gap-4 cursor-pointer transition-all ${
                      isSelected ? 'border-brand-500/40 bg-brand-500/5' : 'hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-base">
                      {getMimeIcon(f.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{f.name}</p>
                      <p className="text-xs text-slate-500">
                        {f.size ? `${(parseInt(f.size) / 1024).toFixed(0)} KB · ` : ''}
                        {new Date(f.modifiedTime).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {isSelected && <CheckCircle size={18} className="text-brand-400 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
