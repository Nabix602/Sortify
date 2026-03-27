import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Sparkles, FolderOpen, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useFiles } from '@/hooks/useFiles'
import { useProfile } from '@/hooks/useProfile'
import { FREE_FILE_LIMIT } from '@/lib/stripe'
import toast from 'react-hot-toast'

interface LocalFile {
  file: File
  status: 'idle' | 'analyzing' | 'done' | 'error'
  suggestion?: { folder: string; newName: string }
  dbId?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getExt(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE'
}

export default function Organizer() {
  const { addFile, updateFile, organizedFiles } = useFiles()
  const { isPro } = useProfile()
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  const canUpload = isPro || organizedFiles.length < FREE_FILE_LIMIT

  const onDrop = useCallback((accepted: File[]) => {
    if (!canUpload) {
      toast.error('Limite atteinte. Passez à Pro pour continuer.')
      return
    }
    const newFiles: LocalFile[] = accepted.map(f => ({ file: f, status: 'idle' }))
    setLocalFiles(prev => [...prev, ...newFiles])
  }, [canUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024,
  })

  const analyzeFile = async (lf: LocalFile): Promise<{ folder: string; newName: string }> => {
    const ext = getExt(lf.file.name)
    const size = lf.file.size
    const name = lf.file.name.replace(/\.[^/.]+$/, '')

    // Appel Claude API pour analyser le fichier
    const prompt = `Tu es un assistant d'organisation de fichiers. Analyse ce fichier et suggère un dossier et un nouveau nom.
Fichier: "${lf.file.name}", Extension: ${ext}, Taille: ${formatSize(size)}, Type MIME: ${lf.file.type || 'inconnu'}
Réponds UNIQUEMENT en JSON: {"folder": "NomDuDossier", "newName": "nouveau-nom.${ext.toLowerCase()}"}
Règles:
- folder: catégorie claire (Images, Documents, Vidéos, Code, Musique, Archives, Divers, etc.)
- newName: kebab-case, descriptif, garde l'extension
- Pas de commentaire, juste le JSON.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      // Fallback si API indisponible
      const folderMap: Record<string, string> = {
        jpg: 'Images', jpeg: 'Images', png: 'Images', gif: 'Images', webp: 'Images', svg: 'Images',
        mp4: 'Vidéos', mov: 'Vidéos', avi: 'Vidéos', mkv: 'Vidéos',
        mp3: 'Musique', wav: 'Musique', flac: 'Musique',
        pdf: 'Documents', doc: 'Documents', docx: 'Documents', txt: 'Documents',
        zip: 'Archives', rar: 'Archives', gz: 'Archives', tar: 'Archives',
        js: 'Code', ts: 'Code', py: 'Code', html: 'Code', css: 'Code',
        xls: 'Tableurs', xlsx: 'Tableurs', csv: 'Tableurs',
      }
      const folder = folderMap[ext.toLowerCase()] ?? 'Divers'
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
      return { folder, newName: `${slug || 'fichier'}.${ext.toLowerCase()}` }
    }

    const data = await res.json()
    const text = data.content?.[0]?.text ?? '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }

  const analyzeAll = async () => {
    const toAnalyze = localFiles.filter(f => f.status === 'idle')
    if (toAnalyze.length === 0) return
    setAnalyzing(true)

    for (let i = 0; i < localFiles.length; i++) {
      const lf = localFiles[i]
      if (lf.status !== 'idle') continue

      setLocalFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'analyzing' } : f))

      try {
        const suggestion = await analyzeFile(lf)
        const dbFile = await addFile({
          original_name: lf.file.name,
          file_type: lf.file.name.split('.').pop() ?? null,
          file_size: lf.file.size,
          mime_type: lf.file.type || null,
          original_path: null,
          suggested_folder: suggestion.folder,
          suggested_name: suggestion.newName,
          source: 'upload',
          status: 'organized',
          google_drive_file_id: null,
          ai_analysis: suggestion as unknown as Record<string, unknown>,
        })
        setLocalFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'done', suggestion, dbId: dbFile?.id } : f
        ))
      } catch {
        setLocalFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f))
      }
    }

    setAnalyzing(false)
    toast.success('Analyse terminée !')
  }

  const removeFile = (idx: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const clearAll = () => setLocalFiles([])

  const doneCount = localFiles.filter(f => f.status === 'done').length
  const idleCount = localFiles.filter(f => f.status === 'idle').length

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Organiseur de fichiers</h1>
          <p className="text-slate-400 mt-1">Uploadez vos fichiers et l'IA les trie automatiquement</p>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-6 ${
            isDragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-white/15 hover:border-brand-500/50 hover:bg-white/[0.02]'
          } ${!canUpload ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-brand-400" />
          </div>
          <p className="text-white font-medium mb-1">
            {isDragActive ? 'Déposez ici !' : 'Glissez vos fichiers ici'}
          </p>
          <p className="text-sm text-slate-400">ou cliquez pour sélectionner — max 100 MB par fichier</p>
          {!canUpload && (
            <p className="text-sm text-amber-400 mt-3 font-medium">Limite Free atteinte ({FREE_FILE_LIMIT} fichiers). Passez à Pro !</p>
          )}
        </div>

        {/* File list */}
        {localFiles.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">
                {localFiles.length} fichier(s) — {doneCount} analysé(s)
              </p>
              <div className="flex gap-3">
                {localFiles.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                    <X size={12} /> Tout supprimer
                  </button>
                )}
                {idleCount > 0 && (
                  <button
                    onClick={analyzeAll}
                    disabled={analyzing}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {analyzing
                      ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse...</>
                      : <><Sparkles size={14} /> Analyser ({idleCount})</>
                    }
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {localFiles.map((lf, idx) => (
                <div key={idx} className="card py-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">{getExt(lf.file.name)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{lf.file.name}</p>
                    <p className="text-xs text-slate-500">{formatSize(lf.file.size)}</p>
                    {lf.status === 'done' && lf.suggestion && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FolderOpen size={10} /> {lf.suggestion.folder}
                        </span>
                        <span className="text-xs text-slate-500">→ {lf.suggestion.newName}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lf.status === 'idle' && <span className="text-xs text-slate-500">En attente</span>}
                    {lf.status === 'analyzing' && (
                      <div className="flex items-center gap-1.5 text-xs text-brand-400">
                        <div className="w-3 h-3 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                        Analyse...
                      </div>
                    )}
                    {lf.status === 'done' && <CheckCircle size={16} className="text-green-400" />}
                    {lf.status === 'error' && <AlertCircle size={16} className="text-red-400" />}
                    <button onClick={() => removeFile(idx)} className="text-slate-600 hover:text-red-400 transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {localFiles.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun fichier uploadé pour l'instant</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
