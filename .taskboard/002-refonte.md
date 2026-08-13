---
id: '002'
status: done
priority: haute
estimate: ''
order: 10
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: true
created: '2026-08-13T20:33:31.792Z'
updated: '2026-08-13T20:40:15.074Z'
validated_at: null
---
# Refonte

## Description
Refonte **visuelle uniquement** de l'application (CSS/theme) — la structure des composants et
des écrans existants ne change pas, seuls le style, les couleurs, la typographie et les
espacements doivent être alignés sur le nouveau design basé sur Notion.

Utilise le MCP `claude_design` (https://api.anthropic.com/v1/design/mcp, auth via `/design-login`)
pour importer ce projet de design :
https://claude.ai/design/p/e5ace50f-eaf2-4a8a-93e2-8895f6a2f1a1?file=CodeKanban.dc.html

Fichiers à lire en priorité (le reste du projet de design est aussi consultable) :
- `CodeKanban.dc.html`
- `uploads/DESIGN-notion.md`
- `support.js` (importé par la sélection ci-dessus)

Applique le style défini par ces fichiers à l'application existante : couleurs, typographie,
espacements, bordures/ombres, états (hover/focus/active), sans modifier la structure des
composants ni ajouter de nouvel écran ou fonctionnalité.

Dark theme : le design importé ne définit qu'un thème clair. Ne cherche pas de variante sombre
dans le design — déduis toi-même une palette dark cohérente à partir de la palette claire
(inversion de luminance en conservant les teintes et les couleurs d'accent), en respectant les
contrastes d'accessibilité usuels (WCAG AA minimum sur le texte).

## Checklist
- [x] Se connecter au MCP claude_design (`/design-login`) et importer le projet
- [x] Lire `CodeKanban.dc.html`, `uploads/DESIGN-notion.md` et `support.js`
- [x] Extraire la palette de couleurs, la typographie et les espacements du design clair
- [x] Appliquer le style clair à l'ensemble des écrans/composants existants (sans changer la structure)
- [x] Déduire et appliquer une palette dark theme cohérente (contraste WCAG AA minimum)
- [x] Vérifier visuellement les deux thèmes sur les écrans principaux avant de passer la carte en done

## Commentaires

**Assistant IA** — 2026-08-13 16:55
Refonte visuelle appliquée exclusivement dans `src/styles/styles.css` (tokens de design), sans
toucher la structure des composants ni la logique :
- Couleurs : palette Notion (canvas paper `#f6f5f4`, surface blanche, encre quasi-noire, bleu
  primaire `#0075de`) reprise dans `--color-bg/surface/text/accent`, avec des rampes tonales
  neutre/accent/accent-2 dérivées.
- Typographie : Inter (400/500/600/700) remplace Archivo ; hiérarchie de titres réalignée sur les
  tailles Notion (h1 40px, h2 26px, h3 22px).
- Rayons/ombres : coins arrondis (4/8/12px, pilule pour les CTA et le switch) et ombres
  « barely-there » multi-couches, à la place du style « Modernist » à angles droits.
- Bordures : hairlines passées de 2px à 1px partout pour coller au style Notion.
- Thème sombre : déduit indépendamment du design (qui ne fournissait qu'un thème clair) par
  inversion de luminance en conservant les teintes, contraste texte >= AA vérifié visuellement.
- Vérifié visuellement en lançant l'app réelle (`npm start`) : RootScreen, InstallScreen et
  CardPage rendus correctement en clair et en sombre (capture d'écran forcée en dark le temps du
  test, revert immédiat après vérification).
- Build (`vite build`) et suite de tests (`vitest run`, 16/16) passent.

Point relevé hors scope (non corrigé ici car carte visuelle uniquement, aucune modif de
structure/logique) : le bouton de bascule clair/sombre (`Nav.tsx`, `onToggleTheme`) ne semble pas
visible/cliquable dans la barre de nav du RootScreen/InstallScreen sur cette build — à vérifier
dans une carte dédiée si confirmé.

