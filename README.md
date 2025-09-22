# 🎾 Padel Organizer - Version Simple

Application Next.js ultra simple pour organiser des créneaux de padel entre amis.

## 🚀 Installation

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## 📁 Gestion des données

Toutes les données sont dans des fichiers JSON que tu peux éditer à la main :

### `data/friends.json`
```json
[
  "Alice",
  "Bob", 
  "Charlie",
  "Diana"
]
```

### `data/clubs.json`
```json
[
  {
    "id": "club1",
    "name": "Padel Club Central",
    "city": "Paris"
  },
  {
    "id": "club2", 
    "name": "Tennis Club Vincennes",
    "city": "Vincennes"
  }
]
```

### `data/slots.json`
Géré automatiquement par l'app (créneaux créés/modifiés)

## 🎯 Utilisation

### Pour toi (organisateur) :
1. **Ajouter des amis** : Édite `data/friends.json` 
2. **Ajouter des clubs** : Édite `data/clubs.json`
3. **Créer un créneau** : Bouton "Nouveau créneau"
4. **Supprimer** : Bouton 🗑️ sur chaque créneau

### Pour tes amis (sans compte) :
1. **Voir les créneaux** : Vont sur le site
2. **S'inscrire** : Cliquent sur leur prénom (bouton bleu avec +)
3. **Se désinscrire** : Re-cliquent sur leur prénom (bouton vert avec ✓)

**Pas besoin de compte, pas de mot de passe !** Chacun clique juste sur son prénom.

## 🔧 Structure simple

- `app/` - Pages Next.js
- `data/` - Fichiers JSON éditables
- `lib/data.js` - Fonctions de lecture/écriture JSON
- API routes pour CRUD basique

C'est tout ! Pas de base de données, pas de complexité, juste des JSON et une interface simple.