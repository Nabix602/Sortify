import { Link } from 'react-router-dom'
import { Check, Sparkles, ArrowLeft } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function Pricing() {
  const { user } = useAuth()
  const { profile, isPro } = useProfile()

  const handleUpgrade = () => {
    // Stripe pas encore activé — message d'attente
    toast('Stripe arrive bientôt ! Contactez-nous sur sortify@email.com pour passer Pro.', {
      icon: '⏳',
      duration: 5000,
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0e1a] text-white px-6 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <Link to={user ? '/dashboard' : '/'} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">Tarifs simples</h1>
          <p className="text-slate-400">Commencez gratuitement, passez Pro quand vous en avez besoin</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="card relative">
            {profile?.plan === 'free' && user && (
              <span className="absolute -top-3 left-6 text-xs bg-slate-600 text-white px-3 py-1 rounded-full">Plan actuel</span>
            )}
            <h2 className="text-xl font-bold mb-1">{PLANS.free.name}</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold">Gratuit</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Pour découvrir Sortify</p>
            <ul className="space-y-3 mb-8">
              {PLANS.free.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {user
              ? <Link to="/dashboard" className="btn-secondary w-full text-center block">Accéder au dashboard</Link>
              : <Link to="/login" className="btn-secondary w-full text-center block">Commencer gratuitement</Link>
            }
          </div>

          {/* Pro */}
          <div className="card relative border-brand-500/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs px-4 py-1 rounded-full font-medium flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={11} /> Recommandé
            </div>
            {isPro && (
              <span className="absolute -top-3 right-6 text-xs bg-green-600 text-white px-3 py-1 rounded-full">Actif</span>
            )}
            <h2 className="text-xl font-bold mb-1">{PLANS.pro.name}</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold">{PLANS.pro.price}€</span>
              <span className="text-slate-400">/mois</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Pour les power users</p>
            <ul className="space-y-3 mb-8">
              {PLANS.pro.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={15} className="text-brand-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro
              ? <button disabled className="btn-primary w-full opacity-60 cursor-not-allowed">Déjà Pro ✓</button>
              : <button onClick={handleUpgrade} className="btn-primary w-full">
                  {user ? 'Passer à Pro' : 'Commencer avec Pro'}
                </button>
            }
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Mes fichiers sont-ils stockés ?', a: 'Non. Sortify analyse uniquement les métadonnées (nom, type, taille). Le contenu de vos fichiers ne transite jamais par nos serveurs.' },
              { q: 'Comment fonctionne le tri IA ?', a: 'Sortify utilise GPT-4o pour analyser le nom et le type de chaque fichier, puis suggère un dossier et un nouveau nom cohérent.' },
              { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement. Votre abonnement Pro se termine à la fin de la période payée.' },
              { q: 'Google Drive est-il obligatoire ?', a: 'Non. Vous pouvez uploader des fichiers manuellement. Google Drive est une fonctionnalité Pro optionnelle.' },
            ].map(({ q, a }) => (
              <div key={q} className="card">
                <p className="font-medium text-white mb-2">{q}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
