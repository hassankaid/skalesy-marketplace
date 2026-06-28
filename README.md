# Skalesy — Cockpit Projet

Plateforme interne de **pilotage de projet** aux couleurs de Skalesy, pour centraliser et
suivre un projet marketplace partagé entre **Skalesy, le client et les prestataires**
(dev web/app, design graphique, branding, acquisition payante, SEO).

Tout au même endroit : vision & objectifs, rôles, actions client, tâches par prestataire,
questions ouvertes, blocages, décisions validées, accès & documents, roadmap et avancement.

## Stack

- **Next.js 16** (App Router, TypeScript) · **Tailwind CSS v4** · **shadcn/ui** (Base UI)
- **Supabase** : Postgres + Auth (lien magique) + RLS + Storage
- Lectures en Server Components, écritures en Server Actions

## Fonctionnalités

| Page | Contenu |
|------|---------|
| **Dashboard** | Vision, objectifs, avancement, KPIs, à débloquer, actions client, activité |
| **Tâches** | Tableau filtrable + vue kanban, changement de statut, création |
| **Prestataires** | 5 espaces (vision / besoins / recommandations / tâches / questions / blocages) |
| **Espace client** | Actions à faire, questions à répondre, accès à fournir, décisions à valider |
| **Questions · Blocages · Décisions** | Suivi + réponses / résolutions / validations |
| **Accès & documents** | Accès nécessaires (statuts) + documents partagés |
| **Roadmap** | Timeline par phase |
| **Équipe** | Membres + rôles & responsabilités |
| **Administration** | Gestion des accès (membres autorisés) + réglages projet |

Statuts : à faire · en attente · bloqué · en cours · validé.

## Configuration

Copie `.env.example` vers `.env.local` et renseigne :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ncxkanufcozjbbchrwmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon/publishable>   # Dashboard Supabase → Settings → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000             # URL de l'app (Vercel en prod)
```

> La clé `anon` est **publique** (embarquée côté navigateur) — ce n'est pas un secret.

## Lancement en local

```bash
npm install
npm run dev          # http://localhost:3000
```

## Base de données

Le schéma, les politiques RLS, les triggers, le bucket Storage et un jeu de données de
démonstration sont définis dans `supabase/migrations/` et **déjà appliqués** au projet.

Pour ré-appliquer / faire évoluer le schéma (CLI Supabase liée au projet) :

```bash
supabase db push                       # applique les migrations au projet distant
supabase migration new <nom>           # crée une nouvelle migration
```

> ℹ️ La génération automatique des types (`supabase gen types`) est indisponible avec le
> token actuel (privilèges management API insuffisants) et sans Docker local. Les types sont
> donc maintenus à la main dans `src/lib/database.types.ts`, au format Supabase.

## Authentification & rôles

- Connexion par **lien magique** (email, sans mot de passe).
- Rôles : **Skalesy admin**, **client**, **prestataire** (avec son domaine) — sécurisés par
  **RLS Postgres**.
- L'accès est contrôlé par la table `allowed_members` : un email doit y figurer pour obtenir
  un rôle. `contact@hassankaid.com` est pré-configuré en **Skalesy admin**.
- Ajouter le client et les prestataires : page **Administration** (réservée à l'admin), ou en
  SQL via `allowed_members`. Le rôle est attribué à leur **première connexion**.

Dans le **Dashboard Supabase → Authentication → URL Configuration** :
- **Site URL** = `http://localhost:3000` en local, l'URL Vercel en production.
- Ajouter les **Redirect URLs** : `http://localhost:3000/**` et `https://<app>.vercel.app/**`.

## Déploiement (Vercel)

1. Importer le repo GitHub `hassankaid/skalesy-marketplace` dans Vercel.
2. Variables d'environnement (Project Settings → Environment Variables) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = l'URL Vercel
3. Déployer. Puis ajouter l'URL Vercel dans les **Redirect URLs** Supabase (ci-dessus).

## Logos

Le wordmark est recréé en SVG (`src/components/brand/logo.tsx`). Pour utiliser les fichiers
officiels, déposer `skalesy-black.png` / `skalesy-white.png` dans `public/brand/`
(voir `public/brand/README.md`).
