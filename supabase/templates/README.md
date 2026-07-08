# Templates email (auth) — Skalesy Marketplace

HTML brandé (violet `#6C63FF`, wordmark « skalesy »), compatible email (tables +
styles inline, aucun SVG/police/image externe, bouton avec repli Outlook/MSO).

## Où les coller

Supabase → **Authentication → Emails → Templates**. Un fichier par template :

| Fichier | Template Supabase | `type` du lien | `next` |
|---|---|---|---|
| `invite.html` | **Invite user** | `invite` | `/definir-mot-de-passe` |
| `confirmation.html` | **Confirm signup** | `signup` | `/` |
| `recovery.html` | **Reset Password** | `recovery` | `/definir-mot-de-passe` |
| `magic_link.html` | **Magic Link** | `magiclink` | `/` |
| `email_change.html` | **Change Email Address** | `email_change` | `/` |

## Comment ça marche

Chaque bouton pointe vers :

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=<type>&next=<next>
```

La route `src/app/auth/callback/route.ts` gère `token_hash` (via `verifyOtp`) —
indispensable pour les emails initiés côté serveur (invitation, confirmation).
`{{ .SiteURL }}` doit être réglé sur `https://marketplace.skalesy.com`
(Authentication → URL Configuration).

## Prérequis d'envoi

- SMTP custom (Resend) configuré côté Supabase.
- `Redirect URLs` autorisant `https://marketplace.skalesy.com/**` et `http://localhost:3000/**`.

> Édités à la main dans le dashboard (le token Supabase du projet n'a pas les
> droits Management API pour pousser les templates via la CLI).
