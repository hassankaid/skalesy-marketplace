# Logos Skalesy

La plateforme utilise par défaut un **wordmark recréé** (composant `src/components/brand/logo.tsx`,
teinté via `currentColor`, fonctionne sur fond clair et foncé).

## Utiliser les logos officiels

1. Dépose les fichiers fournis ici :
   - `skalesy-black.png` (logo noir, fond transparent)
   - `skalesy-white.png` (logo blanc, fond transparent)
2. Dans `src/components/brand/logo.tsx`, remplace le `<span>` du composant `Logo` par :

   ```tsx
   import Image from "next/image";

   export function Logo({ className }: { className?: string }) {
     return (
       <Image
         src="/brand/skalesy-black.png"
         alt="Skalesy"
         width={120}
         height={32}
         className={className}
         priority
       />
     );
   }
   ```

   (Utilise `skalesy-white.png` pour les fonds foncés, ex. sidebar en mode sombre.)
