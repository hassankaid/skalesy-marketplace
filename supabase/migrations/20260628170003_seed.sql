-- ============================================================
-- Seed — single marketplace project with placeholder content.
-- Idempotent: skips if the project already exists.
-- ============================================================
do $$
declare
  pid uuid := '11111111-1111-1111-1111-111111111111';
begin
  if exists (select 1 from public.projects where id = pid) then
    return;
  end if;

  -- Project (vision + objectives)
  insert into public.projects (id, name, client_name, description, objectives, status, progress, start_date, target_date)
  values (
    pid,
    'Marketplace — Projet client',
    'Client',
    'Construire une marketplace performante et scalable, de la conception au lancement. Cet espace centralise le pilotage du projet entre Skalesy, le client et les prestataires : une seule source de verite pour la vision, les decisions, les taches, les questions et les blocages.',
    '["Lancer une marketplace fonctionnelle et fiable dans les delais", "Offrir une experience claire cote acheteurs et vendeurs", "Mettre en place une identite de marque forte et coherente", "Generer des premieres ventes via acquisition payante et SEO", "Poser des fondations techniques scalables"]'::jsonb,
    'active',
    28,
    current_date - 21,
    current_date + 70
  );

  -- Access control: the admin
  insert into public.allowed_members (email, role, provider_domain, full_name)
  values ('contact@hassankaid.com', 'skalesy_admin', null, 'Skalesy')
  on conflict (email) do nothing;

  -- Provider workspaces (one per domain)
  insert into public.provider_workspaces (project_id, domain, summary, needs, recommendations, progress, sort_order) values
    (pid, 'dev', 'Conception et developpement de la marketplace : back-office, parcours acheteur et vendeur, paiements et integrations.', 'Validation des specifications fonctionnelles et acces aux environnements techniques.', 'Demarrer par un socle technique solide avant les fonctionnalites secondaires.', 35, 1),
    (pid, 'design', 'UI/UX de la marketplace : maquettes, design system et parcours cles.', 'Contenus, visuels produits et validation des maquettes par le client.', 'Construire un design system reutilisable pour accelerer la production des ecrans.', 40, 2),
    (pid, 'branding', 'Identite de marque : logo, charte, ton et univers visuel de la marketplace.', 'Brief de marque et preferences du client sur le positionnement.', 'Figer la charte avant la production des ecrans et des campagnes.', 55, 3),
    (pid, 'paid_acquisition', 'Acquisition payante : campagnes Meta et Google, tracking et optimisation.', 'Acces aux comptes publicitaires et budget media valide.', 'Mettre en place le tracking avant le lancement des campagnes.', 15, 4),
    (pid, 'seo', 'Referencement naturel : structure, contenus et performance technique.', 'Acces au CMS et arbitrage sur la strategie de contenu.', 'Travailler la structure SEO des la conception des pages.', 20, 5);

  -- Tasks
  insert into public.tasks (project_id, title, description, status, priority, domain, owner_side, due_date, sort_order) values
    (pid, 'Mettre en place le socle technique (Next.js + Supabase)', 'Initialiser le projet, la base de donnees et le deploiement.', 'in_progress', 'high', 'dev', 'provider', current_date + 5, 1),
    (pid, 'Concevoir le schema de base de donnees produits et commandes', null, 'todo', 'high', 'dev', 'provider', current_date + 12, 2),
    (pid, 'Integrer le module de paiement', 'Bloque tant que les acces prestataire ne sont pas fournis.', 'blocked', 'urgent', 'dev', 'provider', current_date + 20, 3),
    (pid, 'Maquetter le parcours acheteur', null, 'in_progress', 'high', 'design', 'provider', current_date + 8, 4),
    (pid, 'Definir le design system (couleurs, typographies, composants)', null, 'done', 'medium', 'design', 'provider', current_date - 3, 5),
    (pid, 'Maquetter le tableau de bord vendeur', null, 'todo', 'medium', 'design', 'provider', current_date + 15, 6),
    (pid, 'Finaliser la charte graphique', null, 'in_progress', 'high', 'branding', 'provider', current_date + 6, 7),
    (pid, 'Valider le logo et ses declinaisons', 'En attente de la validation du client.', 'waiting', 'high', 'branding', 'client', current_date + 4, 8),
    (pid, 'Preparer les premieres campagnes Meta', null, 'todo', 'medium', 'paid_acquisition', 'provider', current_date + 25, 9),
    (pid, 'Fournir les acces au compte publicitaire', 'Action attendue cote client.', 'waiting', 'high', 'paid_acquisition', 'client', current_date + 3, 10),
    (pid, 'Definir la structure SEO des categories', null, 'todo', 'medium', 'seo', 'provider', current_date + 18, 11),
    (pid, 'Optimiser les performances techniques (Core Web Vitals)', null, 'in_progress', 'medium', 'seo', 'provider', current_date + 22, 12),
    (pid, 'Transmettre les contenus et visuels produits', 'Necessaire pour avancer sur les maquettes.', 'waiting', 'high', 'design', 'client', current_date + 2, 13),
    (pid, 'Confirmer le perimetre fonctionnel de la v1', 'Decision structurante attendue cote client.', 'todo', 'urgent', 'dev', 'client', current_date + 1, 14),
    (pid, 'Cadrer le planning global et la roadmap', null, 'in_progress', 'medium', null, 'skalesy', current_date + 7, 15);

  -- Questions
  insert into public.questions (project_id, body, answer, domain, directed_to, status, priority, answered_at) values
    (pid, 'Quel prestataire de paiement preferez-vous (Stripe ou autre) ?', null, 'dev', 'client', 'open', 'high', null),
    (pid, 'Avez-vous des references visuelles ou des marques qui vous inspirent ?', null, 'design', 'client', 'open', 'medium', null),
    (pid, 'Le nom de la marketplace est-il definitif ?', null, 'branding', 'client', 'open', 'medium', null),
    (pid, 'Le budget contenu SEO est-il valide pour le lancement ?', null, 'seo', 'skalesy', 'open', 'medium', null),
    (pid, 'Quel budget media mensuel envisagez-vous pour demarrer ?', 'Environ 3 000 EUR par mois pour demarrer.', 'paid_acquisition', 'client', 'answered', 'high', now()),
    (pid, 'Souhaitez-vous une application mobile en phase 1 ou plus tard ?', null, 'dev', 'client', 'open', 'medium', null);

  -- Blockers
  insert into public.blockers (project_id, title, description, domain, severity, status, resolution, resolved_at) values
    (pid, 'Acces paiement manquant', 'Le module de paiement ne peut pas etre integre sans les acces au prestataire.', 'dev', 'urgent', 'open', null, null),
    (pid, 'Comptes publicitaires non fournis', 'Les campagnes ne peuvent pas demarrer sans acces aux comptes Meta et Google.', 'paid_acquisition', 'high', 'open', null, null),
    (pid, 'Manque de contenus produits', 'Maquettes en attente de visuels.', 'design', 'medium', 'resolved', 'Visuels partiels recus, maquettes debloquees.', now());

  -- Decisions
  insert into public.decisions (project_id, title, context, decision, domain, status, decided_at) values
    (pid, 'Stack technique : Next.js + Supabase', 'Besoin de rapidite de developpement et de scalabilite.', 'Adopter Next.js et Supabase pour la v1.', 'dev', 'validated', now()),
    (pid, 'Direction de marque sobre et premium', 'Coherence avec le logo et le positionnement.', 'Identite noir et blanc avec accent violet.', 'branding', 'validated', now()),
    (pid, 'Perimetre v1 sans application mobile native', 'Prioriser le web pour le lancement.', 'Reporter le mobile en phase 2.', 'dev', 'proposed', null),
    (pid, 'Design system avant les ecrans', 'Accelerer et harmoniser la production.', 'Construire le design system en premier.', 'design', 'validated', now());

  -- Accesses
  insert into public.accesses (project_id, name, description, domain, provided_by, status, notes) values
    (pid, 'Acces prestataire de paiement', 'Cle API et compte du prestataire de paiement.', 'dev', 'client', 'needed', 'Stripe ou equivalent.'),
    (pid, 'Compte Meta Ads', 'Acces gestionnaire de publicites Meta.', 'paid_acquisition', 'client', 'requested', null),
    (pid, 'Compte Google Ads', 'Acces au compte Google Ads.', 'paid_acquisition', 'client', 'needed', null),
    (pid, 'Acces au CMS / back-office', 'Identifiants du back-office pour le SEO.', 'seo', 'client', 'needed', null),
    (pid, 'Nom de domaine et DNS', 'Delegation DNS effectuee.', 'dev', 'client', 'provided', 'Delegation DNS effectuee.'),
    (pid, 'Visuels et logos existants', 'Banque de visuels et logos de la marque.', 'design', 'client', 'confirmed', null),
    (pid, 'Hebergement / Vercel', 'Acces au compte de deploiement.', 'dev', 'client', 'needed', null);

  -- Documents (placeholder links)
  insert into public.documents (project_id, name, category, url, domain) values
    (pid, 'Brief projet initial', 'Cadrage', '#', null),
    (pid, 'Charte graphique (v1)', 'Branding', '#', 'branding'),
    (pid, 'Maquettes Figma', 'Design', '#', 'design'),
    (pid, 'CGU et mentions legales (brouillon)', 'Legal', '#', null),
    (pid, 'Audit SEO de cadrage', 'SEO', '#', 'seo');

  -- Roadmap
  insert into public.roadmap_items (project_id, title, description, phase, domain, status, sort_order) values
    (pid, 'Cadrage et objectifs', 'Vision, perimetre et roles.', 'Cadrage', null, 'done', 1),
    (pid, 'Validation du perimetre v1', 'Confirmer les fonctionnalites de lancement.', 'Cadrage', 'dev', 'in_progress', 2),
    (pid, 'Charte de marque', 'Logo, charte et univers visuel.', 'Identite et Design', 'branding', 'in_progress', 3),
    (pid, 'Design system et maquettes', 'Composants et ecrans cles.', 'Identite et Design', 'design', 'planned', 4),
    (pid, 'Socle technique et back-office', 'Fondations et administration.', 'Developpement', 'dev', 'in_progress', 5),
    (pid, 'Parcours acheteur et vendeur', 'Tunnels et comptes utilisateurs.', 'Developpement', 'dev', 'planned', 6),
    (pid, 'Integration paiement', 'Encaissement et commandes.', 'Developpement', 'dev', 'planned', 7),
    (pid, 'Campagnes acquisition et SEO', 'Premiere acquisition payante et organique.', 'Lancement', 'paid_acquisition', 'planned', 8),
    (pid, 'Mise en ligne v1', 'Lancement public de la marketplace.', 'Lancement', null, 'planned', 9);

  -- Activity feed
  insert into public.activity_log (project_id, actor_name, entity_type, action, summary) values
    (pid, 'Skalesy', 'project', 'created', 'Projet cree et cadre'),
    (pid, 'Skalesy', 'decision', 'validated', 'Decision validee : stack technique Next.js + Supabase'),
    (pid, 'Skalesy', 'task', 'completed', 'Tache validee : design system defini'),
    (pid, 'Skalesy', 'blocker', 'opened', 'Blocage signale : acces paiement manquant'),
    (pid, 'Skalesy', 'access', 'provided', 'Acces fourni : nom de domaine et DNS');

end $$;
