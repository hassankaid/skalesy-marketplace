# Logos Skalesy

Assets officiels de la marque, utilisés par `src/components/brand/logo.tsx` (via `next/image`).
Recadrés et redimensionnés depuis le kit `IDENTITÉE VISUELLE` (les originaux font 5000×5000 px).

| Fichier | Usage |
|---|---|
| `wordmark-black.png` | Wordmark « Skalesy » noir — surfaces claires (`<Logo variant="black">` ou `auto` en thème clair). |
| `wordmark-white.png` | Wordmark blanc — rail dégradé, thème sombre (`variant="white"` ou `auto` en sombre). |
| `sk-white.png` | Monogramme `sK` blanc — composé dans le badge dégradé `LogoMark` et le favicon. |
| `sk-black.png` | Monogramme `sK` noir — variantes sur fond clair si besoin. |

Le favicon (`src/app/icon.png`) est un badge circulaire au dégradé de marque + `sK` blanc,
généré à partir de `sk-white.png`.

## Composants
- `LogoMark` — badge circulaire `.gradient-brand` + `sK` blanc (nav, avatars, favicon).
- `Logo` / `LogoWordmark` — wordmark, `variant="auto" | "black" | "white"`, taille par classe de hauteur (`h-6`).
- `LogoLockup` — badge + wordmark côte à côte.

Pour régénérer des assets (recadrage sur la zone opaque + redimensionnement), voir l'historique
de génération dans la session de refonte (script PowerShell `System.Drawing`).
