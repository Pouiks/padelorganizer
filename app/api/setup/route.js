import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.padel_POSTGRES_URL)

export async function GET() {
  try {
    console.log('🚀 Configuration de la base de données via API...')
    
    // Créer les tables
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
    const friends = ["Carenza", "Adrien", "Virgile", "Lucas", "Pauline", "Gregory", "Timothé", "Phillipe"]
    
    for (const friend of friends) {
      await sql`INSERT INTO friends (name) VALUES (${friend}) ON CONFLICT (name) DO NOTHING`
    }
    
    // Insérer les clubs
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
    
    return Response.json({
      success: true,
      message: 'Base de données configurée avec succès !',
      data: {
        friends: parseInt(friendsCount[0].count),
        clubs: parseInt(clubsCount[0].count),
        slots: parseInt(slotsCount[0].count)
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur setup:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
