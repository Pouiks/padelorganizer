import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()

const sql = neon(process.env.padel_POSTGRES_URL)

async function setupDatabase() {
  try {
    console.log('🚀 Configuration de la base de données...')
    
    // Créer les tables
    console.log('📋 Création des tables...')
    
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS clubs (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL
      )
    `
    
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
    
    // Insérer les amis
    console.log('👥 Insertion des amis...')
    const friends = ["Carenza", "Adrien", "Virgile", "Lucas", "Pauline", "Gregory", "Timothé", "Phillipe"]
    
    for (const friend of friends) {
      await sql`INSERT INTO friends (name) VALUES (${friend}) ON CONFLICT (name) DO NOTHING`
    }
    
    // Insérer les clubs
    console.log('🏢 Insertion des clubs...')
    const clubs = [
      { id: "club1", name: "Urban Padel", city: "Castelnau le lez" },
      { id: "club2", name: "My center padel", city: "Palavas les flots" },
      { id: "club3", name: "Padel Lattes", city: "Lattes" }
    ]
    
    for (const club of clubs) {
      await sql`INSERT INTO clubs (id, name, city) VALUES (${club.id}, ${club.name}, ${club.city}) ON CONFLICT (id) DO NOTHING`
    }
    
    // Vérifier les données
    const friendsCount = await sql`SELECT COUNT(*) as count FROM friends`
    const clubsCount = await sql`SELECT COUNT(*) as count FROM clubs`
    const slotsCount = await sql`SELECT COUNT(*) as count FROM slots`
    
    console.log('✅ Configuration terminée !')
    console.log(`   - Amis: ${friendsCount[0].count}`)
    console.log(`   - Clubs: ${clubsCount[0].count}`)
    console.log(`   - Créneaux: ${slotsCount[0].count}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

setupDatabase()
