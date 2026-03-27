import { Link } from 'react-router-dom'
import { Sparkles, FolderSearch, HardDrive, Zap, Shield, ArrowRight, Check } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f0e1a] text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Sortify</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Connexion</Link>
            <Link to="/login" className="btn-primary text-sm py-2">Commencer</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={12} /> Propulsé par GPT-4o
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Organisez vos fichiers<br />
            <span className="gradient-text">intelligemment</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Sortify analyse vos fichiers avec l'IA et les organise automatiquement. Fini le chaos dans vos dossiers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary flex items-center justify-center gap-2">
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="btn-secondary flex items-center justify-center gap-2">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-slate-400 text-center mb-16">Une solution complète pour gérer et organiser vos fichiers</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FolderSearch, title: 'Tri IA', desc: 'GPT-4o analyse et catégorise chaque fichier automatiquement selon son contenu.' },
              { icon: HardDrive, title: 'Google Drive', desc: 'Synchronisez et organisez directement vos fichiers Google Drive (plan Pro).' },
              { icon: Zap, title: 'Rapide', desc: 'Traitez des centaines de fichiers en quelques secondes grâce à notre pipeline optimisé.' },
              { icon: Shield, title: 'Sécurisé', desc: 'Vos fichiers restent privés. Nous ne stockons aucun contenu, seulement les métadonnées.' },
              { icon: Sparkles, title: 'Renommage auto', desc: 'Sortify renomme vos fichiers avec des noms clairs et cohérents.' },
              { icon: ArrowRight, title: 'Export facile', desc: 'Téléchargez un rapport organisé ou appliquez les changements directement.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-brand-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple et transparent</h2>
          <p className="text-slate-400 mb-12">Commencez gratuitement, passez Pro quand vous êtes prêt</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`card text-left ${key === 'pro' ? 'border-brand-500/40' : ''}`}>
                {key === 'pro' && (
                  <span className="inline-block text-xs bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full mb-4 font-medium">Recommandé</span>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">{plan.price === 0 ? 'Gratuit' : `${plan.price}€`}</span>
                  {plan.price > 0 && <span className="text-slate-400 text-sm">/mois</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-brand-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={key === 'pro' ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}>
                  {key === 'pro' ? 'Passer Pro' : 'Commencer'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={14} className="text-brand-400" />
          <span className="gradient-text font-semibold">Sortify</span>
        </div>
        <p>© 2025 Sortify. Tous droits réservés.</p>
      </footer>
    </div>
  )
}
