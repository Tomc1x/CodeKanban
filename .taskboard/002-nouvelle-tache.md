---
id: '002'
status: validated
priority: moyenne
estimate: ''
order: 20
wi: null
created: '2026-08-11T15:39:55.628Z'
updated: '2026-08-11T16:42:52.672Z'
validated_at: null
---
# Impossible de mettre des espaces

## Description
Il m'est impossible de mettre des espaces lors de la création d'une carte. Surement a la modification également.

## Checklist


## Commentaires
**Assistant IA** — 2026-08-11 16:00
Cause : dans `CardModal.tsx`, les champs Titre et Description étaient des inputs contrôlés qui déclenchaient une écriture disque + relecture IPC (asynchrone) à chaque frappe, sans état local ni debounce. `parseCardFile` applique un `.trim()` au titre relu depuis le fichier. Résultat : chaque fois que l'utilisateur tapait un espace puis marquait une micro-pause (fin de mot), le round-trip disque se terminait avant la frappe suivante, relisait le titre se terminant par un espace, le `.trim()` supprimait cet espace, et React réinjectait la valeur tronquée dans le champ contrôlé — la frappe suivante venait donc se coller directement au mot précédent. Reproductible à chaque limite de mot, ce qui expliquait "Testetpipelines".

Correctif : les champs Titre et Description utilisent maintenant un état local (`titleDraft` / `descriptionDraft`), synchronisé à l'ouverture de la carte, et ne sont persistés (écriture disque) qu'au `onBlur`, plus à chaque caractère. `npx tsc --noEmit` passe sans erreur. Pas de suite de tests automatisée dans le repo pour vérifier plus avant (voir carte 001).
