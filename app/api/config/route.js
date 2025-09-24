import { getFriends, getClubs, initDatabase } from '../../../lib/db.js'

export async function GET(request) {
  try {
    await initDatabase()
    
    // Si le paramètre ?setup=true est présent, on force l'insertion des données
    const url = new URL(request.url)
    if (url.searchParams.get('setup') === 'true') {
      console.log('🔧 Mode setup activé - insertion forcée des données')
      
      // Force l'insertion même si les données existent déjà
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.padel_POSTGRES_URL)
      
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
      
      return Response.json({
        setup: true,
        message: 'Setup terminé !',
        friends: parseInt(friendsCount[0].count),
        clubs: parseInt(clubsCount[0].count)
      })
    }
    
    const friends = await getFriends()
    const clubs = await getClubs()
    
    return Response.json({ friends, clubs })
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de lecture' }, { status: 500 })
  }
}