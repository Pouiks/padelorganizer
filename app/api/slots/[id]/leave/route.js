import { leaveSlot, initDatabase } from '../../../../../lib/db.js'

export async function POST(request, { params }) {
  try {
    await initDatabase()
    const { name } = await request.json()
    const { id } = params
    
    if (!name) {
      return Response.json({ error: 'Nom requis' }, { status: 400 })
    }
    
    const slot = await leaveSlot(id, name)
    return Response.json(slot)
  } catch (error) {
    console.error('Erreur:', error)
    
    if (error.message === 'Créneau non trouvé') {
      return Response.json({ error: error.message }, { status: 404 })
    }
    
    return Response.json({ error: 'Erreur désinscription' }, { status: 500 })
  }
}