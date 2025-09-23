import { readJsonFile, writeJsonFile, generateId } from '../../../lib/data.js'

// Lister les créneaux
export async function GET() {
  try {
    const slots = readJsonFile('slots.json')
    return Response.json(slots)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de lecture' }, { status: 500 })
  }
}

// Créer un créneau
export async function POST(request) {
  try {
    const { clubId, date, time, duration, maxPlayers, price } = await request.json()
    
    const clubs = readJsonFile('clubs.json')
    const club = clubs.find(c => c.id === clubId)
    
    if (!club) {
      return Response.json({ error: 'Club non trouvé' }, { status: 400 })
    }
    
    const slots = readJsonFile('slots.json')
    
    const newSlot = {
      id: generateId(),
      clubId,
      clubName: club.name,
      clubCity: club.city,
      date,
      time,
      duration: duration || 90,
      maxPlayers: maxPlayers || 4,
      price: price || null,
      players: [],
      createdAt: new Date().toISOString()
    }
    
    slots.push(newSlot)
    writeJsonFile('slots.json', slots)
    
    return Response.json(newSlot)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de création' }, { status: 500 })
  }
}