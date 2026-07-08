<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Skalesy Cockpit — guide projet

Plateforme interne de pilotage projet (Skalesy / client / prestataires). Next.js 16 + Supabase.

## Conventions

- **shadcn/ui = Base UI** (`@base-ui/react`), pas Radix : pas de `asChild` → utiliser la prop
  `render={<Comp />}`. Tabs/Dialog/Sheet/Avatar suivent l'API Base UI.
- **EXCEPTION : `DropdownMenu` = Radix** (`@radix-ui/react-dropdown-menu`), donc `asChild` (pas
  `render`) pour son trigger. Raison : les menus Base UI (positionnement Floating UI) partent en
  **boucle infinie et plantent en PRODUCTION** ("This page couldn't load"). Bug silencieux en dev
  (React n'active le garde-fou "Maximum update depth" qu'en dev — cf. React #36423), visible
  seulement en build de prod. **Ne jamais repasser DropdownMenu en Base UI.** Tester les popups
  avec `next build` + `next start` (config `skalesy-prod`), pas seulement `next dev`.
- **Routing du middleware** : fichier `src/proxy.ts` (convention Next 16, ex-`middleware.ts`),
  fonction exportée `proxy`.
- **Types DB hand-authored** dans `src/lib/database.types.ts` (le token Supabase n'a pas les
  privilèges management API pour `gen types`, et pas de Docker local). Mettre à jour à la main
  après tout changement de schéma. Alias de lignes : `TaskRow`, `QuestionRow`, etc.
- **Lectures** : `src/lib/queries.ts` (Server Components, projet en cache par requête).
  **Écritures** : `src/app/actions/cockpit.ts` (Server Actions, `revalidatePath("/","layout")`
  + insertion dans `activity_log`).
- **Pièces jointes / fichiers** : table `attachments` (polymorphe `entity_type`+`entity_id`,
  aujourd'hui `question`/`decision`). Les fichiers vont dans le bucket privé Storage
  `project-docs` ; l'**upload se fait côté client** (`createClient()` navigateur → `storage.upload`)
  puis la ligne DB est créée via la Server Action `addAttachment`. La lecture génère des
  **URLs signées** (`getAttachments` dans `queries.ts`). Composant réutilisable
  `src/components/cockpit/attachments.tsx`.
- **Auth/rôles** : `src/lib/auth.ts` (`getAuth`, `requireAuth`). Rôles `skalesy_admin` / `client`
  / `provider`. La **RLS Postgres est la source de vérité** ; le gating UI n'est que cosmétique.
- **Constantes métier** (domaines, statuts, libellés FR, classes de badges) : `src/lib/constants.ts`.
- **Design** : thème clair premium, accent violet `--color-brand` (#6C63FF), statuts sémantiques.
  Composants partagés dans `src/components/app/` (badges, SectionCard, StatCard, EmptyState…).

## Base de données

Migrations dans `supabase/migrations/` (schéma, RLS, triggers, storage, seed). Appliquer avec
`supabase db push` (la CLI est liée ; le mot de passe DB suffit, pas besoin du management API).

## Workflow

Commit + push sur `main` à chaque étape ; le déploiement Vercel est fait par l'utilisateur.
Toujours garder `npm run build` vert.
