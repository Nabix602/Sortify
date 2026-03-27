export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    filesPerMonth: 20,
    features: [
      '20 fichiers / mois',
      'Tri IA basique',
      'Export manuel',
      'Support communauté',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7,
    filesPerMonth: Infinity,
    features: [
      'Fichiers illimités',
      'Google Drive sync',
      'Tri IA avancé (GPT-4o)',
      'Renommage automatique',
      'Support prioritaire',
    ],
    stripePriceId: 'price_xxx', // ← remplace quand ton compte Stripe est prêt
  },
}

export const FREE_FILE_LIMIT = 20
