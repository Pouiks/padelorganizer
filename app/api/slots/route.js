import { getSlots, createSlot, getClubs, initDatabase } from '../../../lib/db.js'

// Lister les créneaux
export async function GET() {
  try {
    await initDatabase()
    const slots = await getSlots()
    return Response.json(slots)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de lecture' }, { status: 500 })
  }
}

// Créer un créneau
export async function POST(request) {
  try {
    await initDatabase()
    const { clubId, date, time, duration, maxPlayers, price } = await request.json()
    
    const clubs = await getClubs()
    const club = clubs.find(c => c.id === clubId)
    
    if (!club) {
      return Response.json({ error: 'Club non trouvé' }, { status: 400 })
    }
    
    const newSlot = await createSlot({
      clubId,
      clubName: club.name,
      clubCity: club.city,
      date,
      time,
      duration,
      maxPlayers,
      price
    })
    
    return Response.json(newSlot)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de création' }, { status: 500 })
  }
}