---
id: '003'
status: validated
priority: moyenne
estimate: ''
order: 30
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:24:28.629Z'
updated: '2026-08-13T15:45:20.084Z'
validated_at: null
---
# Commentaire

## Description
Deux correctifs sur `src/components/CardModal.tsx` :

1. Rétablir la fermeture du modal par clic à l'extérieur : ajouter un `onClick` sur le
   conteneur `.dialog-backdrop` qui appelle `onClose()` uniquement si le clic cible le backdrop
   lui-même (pas un enfant du `.dialog`), pour ne pas fermer accidentellement en cliquant dans
   le contenu.
2. Brouillon de commentaire persistant : le texte tapé dans le textarea « Laisser une note pour
   l'IA » (état `notesDraft`) doit être sauvegardé dans `localStorage` (clé unique par carte,
   ex. `codekanban:comment-draft:<card.filename>`) à chaque frappe, restauré à l'ouverture de
   la carte (dans le `useEffect` qui réinitialise `titleDraft`/`descriptionDraft`), et effacé du
   `localStorage` une fois le commentaire ajouté via `addComment()`. Objectif : si l'utilisateur
   ferme le modal (ou l'app) par erreur avant de cliquer sur « Ajouter le commentaire », le
   texte n'est pas perdu.

## Checklist
- [x] Fermeture du modal au clic extérieur (backdrop uniquement)
- [x] Sauvegarde du brouillon de commentaire en localStorage à chaque frappe
- [x] Restauration du brouillon à l'ouverture de la carte
- [x] Suppression du brouillon localStorage après ajout du commentaire

## Commentaires
**Assistant IA** — 2026-08-13 13:50
`CardModal.tsx` : clic sur `.dialog-backdrop` ferme le modal seulement si `e.target ===
e.currentTarget` (clic dans le contenu ignoré). Le brouillon de note (`notesDraft`) est
persisté dans `localStorage` sous `codekanban:comment-draft:<filename>` à chaque frappe,
restauré à l'ouverture de la carte, et supprimé après ajout du commentaire. `tsc --noEmit` et
les tests `CardModal.test.tsx` passent (5/5).
