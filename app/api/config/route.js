import { getFriends, getClubs, initDatabase } from '../../../lib/db.js'

export async function GET() {
  try {
    await initDatabase()
    const friends = await getFriends()
    const clubs = await getClubs()
    
    return Response.json({ friends, clubs })
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de lecture' }, { status: 500 })
  }
}