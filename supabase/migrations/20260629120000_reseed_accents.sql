-- ============================================================
-- Re-seed the demo project content with proper French accents
-- (the initial seed was ASCII-only). Resets the project's demo
-- data to a clean, professional starting state.
-- ============================================================
do $$
declare
  pid uuid := '11111111-1111-1111-1111-111111111111';
begin
  if not exists (select 1 from public.projects where id = pid) then
    return;
  end if;

  update public.projects set
    description = 'Construire une marketplace performante et scalable, de la conception au lancement. Cet espace centralise le pilotage du projet entre Skalesy, le client et les prestataires : une seule source de vérité pour la vision, les décisions, les tâches, les questions et les blocages.',
    objectives = '["Lancer une marketplace fonctionnelle et fiable dans les délais", "Offrir une expérience claire côté acheteurs et vendeurs", "Mettre en place une identité de marque forte et cohérente", "Générer des premières ventes via acquisition payante et SEO", "Poser des fondations techniques scalables"]'::jsonb
  where id = pid;

  update public.provider_workspaces set
    summary = 'Conception et développement de la marketplace : back-office, parcours acheteur et vendeur, paiements et intégrations.',
    needs = 'Validation des spécifications fonctionnelles et accès aux environnements techniques.',
    recommendations = 'Démarrer par un socle technique solide avant les fonctionnalités secondaires.'
  where project_id = pid and domain = 'dev';
  update public.provider_workspaces set
    summary = 'UI/UX de la marketplace : maquettes, design system et parcours clés.',
    needs = 'Contenus, visuels produits et validation des maquettes par le client.',
    recommendations = 'Construire un design system réutilisable pour accélérer la production des écrans.'
  where project_id = pid and domain = 'design';
  update public.provider_workspaces set
    summary = 'Identité de marque : logo, charte, ton et univers visuel de la marketplace.',
    needs = 'Brief de marque et préférences du client sur le positionnement.',
    recommendations = 'Figer la charte avant la production des écrans et des campagnes.'
  where project_id = pid and domain = 'branding';
  update public.provider_workspaces set
    summary = 'Acquisition payante : campagnes Meta et Google, tracking et optimisation.',
    needs = 'Accès aux comptes publicitaires et budget média validé.',
    recommendations = 'Mettre en place le tracking avant le lancement des campagnes.'
  where project_id = pid and domain = 'paid_acquisition';
  update public.provider_workspaces set
    summary = 'Référencement naturel : structure, contenus et performance technique.',
    needs = 'Accès au CMS et arbitrage sur la stratégie de contenu.',
    recommendations = 'Travailler la structure SEO dès la conception des pages.'
  where project_id = pid and domain = 'seo';

  -- Reset list content to a clean, accented state
  delete from public.tasks where project_id = pid;
  delete from public.questions where project_id = pid;
  delete from public.blockers where project_id = pid;
  delete from public.decisions where project_id = pid;
  delete from public.accesses where project_id = pid;
  delete from public.documents where project_id = pid;
  delete from public.roadmap_items where project_id = pid;
  delete from public.activity_log where project_id = pid;

  insert into public.tasks (project_id, title, description, status, priority, domain, owner_side, due_date, sort_order) values
    (pid, 'Mettre en place le socle technique (Next.js + Supabase)', 'Initialiser le projet, la base de données et le déploiement.', 'in_progress', 'high', 'dev', 'provider', current_date + 5, 1),
    (pid, 'Concevoir le schéma de base de données produits et commandes', null, 'todo', 'high', 'dev', 'provider', current_date + 12, 2),
    (pid, 'Intégrer le module de paiement', 'Bloqué tant que les accès prestataire ne sont pas fournis.', 'blocked', 'urgent', 'dev', 'provider', current_date + 20, 3),
    (pid, 'Maquetter le parcours acheteur', null, 'in_progress', 'high', 'design', 'provider', current_date + 8, 4),
    (pid, 'Définir le design system (couleurs, typographies, composants)', null, 'done', 'medium', 'design', 'provider', current_date - 3, 5),
    (pid, 'Maquetter le tableau de bord vendeur', null, 'todo', 'medium', 'design', 'provider', current_date + 15, 6),
    (pid, 'Finaliser la charte graphique', null, 'in_progress', 'high', 'branding', 'provider', current_date + 6, 7),
    (pid, 'Valider le logo et ses déclinaisons', 'En attente de la validation du client.', 'waiting', 'high', 'branding', 'client', current_date + 4, 8),
    (pid, 'Préparer les premières campagnes Meta', null, 'todo', 'medium', 'paid_acquisition', 'provider', current_date + 25, 9),
    (pid, 'Fournir les accès au compte publicitaire', 'Action attendue côté client.', 'waiting', 'high', 'paid_acquisition', 'client', current_date + 3, 10),
    (pid, 'Définir la structure SEO des catégories', null, 'todo', 'medium', 'seo', 'provider', current_date + 18, 11),
    (pid, 'Optimiser les performances techniques (Core Web Vitals)', null, 'in_progress', 'medium', 'seo', 'provider', current_date + 22, 12),
    (pid, 'Transmettre les contenus et visuels produits', 'Nécessaire pour avancer sur les maquettes.', 'waiting', 'high', 'design', 'client', current_date + 2, 13),
    (pid, 'Confirmer le périmètre fonctionnel de la v1', 'Décision structurante attendue côté client.', 'todo', 'urgent', 'dev', 'client', current_date + 1, 14),
    (pid, 'Cadrer le planning global et la roadmap', null, 'in_progress', 'medium', null, 'skalesy', current_date + 7, 15);

  insert into public.questions (project_id, body, answer, domain, directed_to, status, priority, answered_at) values
    (pid, 'Quel prestataire de paiement préférez-vous (Stripe ou autre) ?', null, 'dev', 'client', 'open', 'high', null),
    (pid, 'Avez-vous des références visuelles ou des marques qui vous inspirent ?', null, 'design', 'client', 'open', 'medium', null),
    (pid, 'Le nom de la marketplace est-il définitif ?', null, 'branding', 'client', 'open', 'medium', null),
    (pid, 'Le budget contenu SEO est-il validé pour le lancement ?', null, 'seo', 'skalesy', 'open', 'medium', null),
    (pid, 'Quel budget média mensuel envisagez-vous pour démarrer ?', 'Environ 3 000 € par mois pour démarrer.', 'paid_acquisition', 'client', 'answered', 'high', now()),
    (pid, 'Souhaitez-vous une application mobile en phase 1 ou plus tard ?', null, 'dev', 'client', 'open', 'medium', null);

  insert into public.blockers (project_id, title, description, domain, severity, status, resolution, resolved_at) values
    (pid, 'Accès paiement manquant', 'Le module de paiement ne peut pas être intégré sans les accès au prestataire.', 'dev', 'urgent', 'open', null, null),
    (pid, 'Comptes publicitaires non fournis', 'Les campagnes ne peuvent pas démarrer sans accès aux comptes Meta et Google.', 'paid_acquisition', 'high', 'open', null, null),
    (pid, 'Manque de contenus produits', 'Maquettes en attente de visuels.', 'design', 'medium', 'resolved', 'Visuels partiels reçus, maquettes débloquées.', now());

  insert into public.decisions (project_id, title, context, decision, domain, status, decided_at) values
    (pid, 'Stack technique : Next.js + Supabase', 'Besoin de rapidité de développement et de scalabilité.', 'Adopter Next.js et Supabase pour la v1.', 'dev', 'validated', now()),
    (pid, 'Direction de marque sobre et premium', 'Cohérence avec le logo et le positionnement.', 'Identité noir et blanc avec accent violet.', 'branding', 'validated', now()),
    (pid, 'Périmètre v1 sans application mobile native', 'Prioriser le web pour le lancement.', 'Reporter le mobile en phase 2.', 'dev', 'proposed', null),
    (pid, 'Design system avant les écrans', 'Accélérer et harmoniser la production.', 'Construire le design system en premier.', 'design', 'validated', now());

  insert into public.accesses (project_id, name, description, domain, provided_by, status, notes) values
    (pid, 'Accès prestataire de paiement', 'Clé API et compte du prestataire de paiement.', 'dev', 'client', 'needed', 'Stripe ou équivalent.'),
    (pid, 'Compte Meta Ads', 'Accès gestionnaire de publicités Meta.', 'paid_acquisition', 'client', 'requested', null),
    (pid, 'Compte Google Ads', 'Accès au compte Google Ads.', 'paid_acquisition', 'client', 'needed', null),
    (pid, 'Accès au CMS / back-office', 'Identifiants du back-office pour le SEO.', 'seo', 'client', 'needed', null),
    (pid, 'Nom de domaine et DNS', 'Délégation DNS effectuée.', 'dev', 'client', 'provided', 'Délégation DNS effectuée.'),
    (pid, 'Visuels et logos existants', 'Banque de visuels et logos de la marque.', 'design', 'client', 'confirmed', null),
    (pid, 'Hébergement / Vercel', 'Accès au compte de déploiement.', 'dev', 'client', 'needed', null);

  insert into public.documents (project_id, name, category, url, domain) values
    (pid, 'Brief projet initial', 'Cadrage', '#', null),
    (pid, 'Charte graphique (v1)', 'Branding', '#', 'branding'),
    (pid, 'Maquettes Figma', 'Design', '#', 'design'),
    (pid, 'CGU et mentions légales (brouillon)', 'Légal', '#', null),
    (pid, 'Audit SEO de cadrage', 'SEO', '#', 'seo');

  insert into public.roadmap_items (project_id, title, description, phase, domain, status, sort_order) values
    (pid, 'Cadrage et objectifs', 'Vision, périmètre et rôles.', 'Cadrage', null, 'done', 1),
    (pid, 'Validation du périmètre v1', 'Confirmer les fonctionnalités de lancement.', 'Cadrage', 'dev', 'in_progress', 2),
    (pid, 'Charte de marque', 'Logo, charte et univers visuel.', 'Identité et Design', 'branding', 'in_progress', 3),
    (pid, 'Design system et maquettes', 'Composants et écrans clés.', 'Identité et Design', 'design', 'planned', 4),
    (pid, 'Socle technique et back-office', 'Fondations et administration.', 'Développement', 'dev', 'in_progress', 5),
    (pid, 'Parcours acheteur et vendeur', 'Tunnels et comptes utilisateurs.', 'Développement', 'dev', 'planned', 6),
    (pid, 'Intégration paiement', 'Encaissement et commandes.', 'Développement', 'dev', 'planned', 7),
    (pid, 'Campagnes acquisition et SEO', 'Première acquisition payante et organique.', 'Lancement', 'paid_acquisition', 'planned', 8),
    (pid, 'Mise en ligne v1', 'Lancement public de la marketplace.', 'Lancement', null, 'planned', 9);

  insert into public.activity_log (project_id, actor_name, entity_type, action, summary) values
    (pid, 'Skalesy', 'project', 'created', 'Projet créé et cadré'),
    (pid, 'Skalesy', 'decision', 'validated', 'Décision validée : stack technique Next.js + Supabase'),
    (pid, 'Skalesy', 'task', 'completed', 'Tâche validée : design system défini'),
    (pid, 'Skalesy', 'blocker', 'opened', 'Blocage signalé : accès paiement manquant'),
    (pid, 'Skalesy', 'access', 'provided', 'Accès fourni : nom de domaine et DNS');
end $$;
