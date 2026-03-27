# Sortify v2 — AI File Organizer

Organiseur de fichiers intelligent propulsé par l'IA.

## Stack
- **Frontend** : React + Vite + TypeScript + Tailwind CSS
- **Backend** : Supabase (Auth, PostgreSQL, RLS)
- **IA** : Claude (via Anthropic API)
- **Paiement** : Stripe (à configurer)
- **Drive** : Google Drive API via OAuth Supabase

## Variables d'environnement

Renomme `.env.example` en `.env` et remplis les valeurs :

```env
VITE_SUPABASE_URL=https://aazhusdaxwlrprxmnkgm.supabase.co
VITE_SUPABASE_ANON_KEY=...
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  (quand Stripe est prêt)
```

## Installation

```bash
npm install
npm run dev
```

## Supabase — Config OAuth Google

1. Va dans **Supabase Dashboard → Authentication → Providers → Google**
2. Active Google et entre ton `Client ID` + `Client Secret` (depuis Google Cloud Console)
3. Ajoute `https://aazhusdaxwlrprxmnkgm.supabase.co/auth/v1/callback` comme redirect URI dans Google Cloud

## Déploiement Vercel

```bash
# Installe Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Pense à ajouter les variables d'environnement dans le dashboard Vercel.

## Structure

```
src/
├── pages/          # Landing, Login, Dashboard, Organizer, Drive, Pricing
├── components/     # Navbar, AppLayout, ...
├── hooks/          # useAuth, useProfile, useFiles, useGoogleDrive
├── lib/            # supabase.ts, stripe.ts
```
