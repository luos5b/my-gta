# MY GTA — Sondage communautaire GTA VI

## Développement local

```bash
npm install
npm run dev
```

## Base de données (Supabase)

Deux scripts SQL à exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor > New query) :

1. `supabase-setup.sql` — crée les tables (votes, comments, participants)
2. `supabase-functions.sql` — crée les fonctions d'incrémentation

## Déploiement (Vercel)

1. Pousser ce projet sur un dépôt GitHub
2. Sur vercel.com, importer le dépôt
3. Vercel détecte automatiquement Vite — laisser les réglages par défaut
4. Déployer

Le site sera accessible à une adresse du type `https://votre-projet.vercel.app`.
