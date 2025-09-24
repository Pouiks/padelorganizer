import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.padel_POSTGRES_URL)

// Initialiser les tables
export async function initDatabase() {
  try {
    // Table des amis
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `

    // Table des clubs
    await sql`
      CREATE TABLE IF NOT EXISTS clubs (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL
      )
    `

    // Table des créneaux
    await sql`
      CREATE TABLE IF NOT EXISTS slots (
        id VARCHAR(50) PRIMARY KEY,
        club_id VARCHAR(50) NOT NULL,
        club_name VARCHAR(255) NOT NULL,
        club_city VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 90,
        max_players INTEGER DEFAULT 4,
        price DECIMAL(10,2),
        players JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Insérer les données par défaut
    await insertDefaultData()
    
    console.log('✅ Base de données initialisée')
  } catch (error) {
    console.error('❌ Erreur initialisation BDD:', error)
  }
}

async function insertDefaultData() {
  try {
    // Vérifier et insérer les amis
    const friendsCount = await sql`SELECT COUNT(*) as count FROM friends`
    console.log('🔍 Nombre d\'amis:', friendsCount[0].count)
    
    if (friendsCount[0].count === 0) {
      console.log('📝 Insertion des amis...')
      const friends = ["Carenza", "Adrien", "Virgile", "Lucas", "Pauline", "Gregory", "Timothé", "Phillipe"]
      for (const friend of friends) {
        await sql`INSERT INTO friends (name) VALUES (${friend}) ON CONFLICT (name) DO NOTHING`
      }
      console.log('✅ Amis insérés')
    }

    // Vérifier et insérer les clubs
    const clubsCount = await sql`SELECT COUNT(*) as count FROM clubs`
    console.log('🔍 Nombre de clubs:', clubsCount[0].count)
    
    if (clubsCount[0].count === 0) {
      console.log('📝 Insertion des clubs...')
      const clubs = [
        { id: "club1", name: "Urban Padel", city: "Castelnau le lez" },
        { id: "club2", name: "My center padel", city: "Palavas les flots" },
        { id: "club3", name: "Padel Lattes", city: "Lattes" }
      ]
      for (const club of clubs) {
        await sql`INSERT INTO clubs (id, name, city) VALUES (${club.id}, ${club.name}, ${club.city}) ON CONFLICT (id) DO NOTHING`
      }
      console.log('✅ Clubs insérés')
    }
  } catch (error) {
    console.error('❌ Erreur insertion données par défaut:', error)
  }
}

// Fonctions utilitaires
export async function getFriends() {
  const result = await sql`SELECT name FROM friends ORDER BY name`
  return result.map(row => row.name)
}

export async function getClubs() {
  const result = await sql`SELECT * FROM clubs ORDER BY name`
  return result
}

export async function getSlots() {
  console.log('🎾 [DB] Récupération des créneaux depuis la base')
  const result = await sql`SELECT * FROM slots ORDER BY date, time`
  console.log('🎾 [DB] Créneaux trouvés en base:', result.length)
  console.log('🎾 [DB] Données brutes:', result)
  
  const formattedSlots = result.map(slot => ({
    id: slot.id,
    clubId: slot.club_id,
    clubName: slot.club_name,
    clubCity: slot.club_city,
    date: slot.date,
    time: slot.time,
    duration: slot.duration,
    maxPlayers: slot.max_players,
    price: slot.price ? parseFloat(slot.price) : null,
    players: slot.players || [],
    createdAt: slot.created_at
  }))
  
  console.log('🎾 [DB] Créneaux formatés pour le front:', formattedSlots.length)
  return formattedSlots
}

export async function createSlot(slotData) {
  const id = Date.now().toString()
  
  await sql`
    INSERT INTO slots (id, club_id, club_name, club_city, date, time, duration, max_players, price, players)
    VALUES (${id}, ${slotData.clubId}, ${slotData.clubName}, ${slotData.clubCity}, 
            ${slotData.date}, ${slotData.time}, ${slotData.duration || 90}, 
            ${slotData.maxPlayers || 4}, ${slotData.price || null}, '[]')
  `
  
  return {
    id,
    clubId: slotData.clubId,
    clubName: slotData.clubName,
    clubCity: slotData.clubCity,
    date: slotData.date,
    time: slotData.time,
    duration: slotData.duration || 90,
    maxPlayers: slotData.maxPlayers || 4,
    price: slotData.price || null,
    players: [],
    createdAt: new Date().toISOString()
  }
}

export async function deleteSlot(id) {
  console.log('🗑️ [DB] Suppression du créneau ID:', id)
  const result = await sql`DELETE FROM slots WHERE id = ${id}`
  console.log('🗑️ [DB] Résultat suppression:', result)
  
  // Avec Neon, on vérifie différemment
  const success = result && (result.rowCount > 0 || result.changes > 0 || Array.isArray(result) && result.length === 0)
  console.log('🗑️ [DB] Suppression réussie:', success)
  return success
}

export async function joinSlot(id, playerName) {
  const slotResult = await sql`SELECT * FROM slots WHERE id = ${id}`
  if (slotResult.length === 0) {
    throw new Error('Créneau non trouvé')
  }
  
  const slot = slotResult[0]
  const players = slot.players || []
  
  if (players.includes(playerName)) {
    throw new Error('Déjà inscrit')
  }
  
  if (players.length >= slot.max_players) {
    throw new Error('Complet')
  }
  
  const newPlayers = [...players, playerName]
  await sql`UPDATE slots SET players = ${JSON.stringify(newPlayers)} WHERE id = ${id}`
  
  return {
    id: slot.id,
    clubId: slot.club_id,
    clubName: slot.club_name,
    clubCity: slot.club_city,
    date: slot.date,
    time: slot.time,
    duration: slot.duration,
    maxPlayers: slot.max_players,
    price: slot.price ? parseFloat(slot.price) : null,
    players: newPlayers,
    createdAt: slot.created_at
  }
}

export async function leaveSlot(id, playerName) {
  const slotResult = await sql`SELECT * FROM slots WHERE id = ${id}`
  if (slotResult.length === 0) {
    throw new Error('Créneau non trouvé')
  }
  
  const slot = slotResult[0]
  const players = (slot.players || []).filter(p => p !== playerName)
  
  await sql`UPDATE slots SET players = ${JSON.stringify(players)} WHERE id = ${id}`
  
  return {
    id: slot.id,
    clubId: slot.club_id,
    clubName: slot.club_name,
    clubCity: slot.club_city,
    date: slot.date,
    time: slot.time,
    duration: slot.duration,
    maxPlayers: slot.max_players,
    price: slot.price ? parseFloat(slot.price) : null,
    players: players,
    createdAt: slot.created_at
  }
}
