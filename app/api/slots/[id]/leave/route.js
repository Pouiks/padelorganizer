import { await readJsonFile, await writeJsonFile } from '../../../../../lib/data.js'

export async function POST(request, { params }) {
  try {
    const { name } = await request.json()
    const { id } = params
    
    if (!name) {
      return Response.json({ error: 'Nom requis' }, { status: 400 })
    }
    
    const slots = await readJsonFile('slots.json')
    const slotIndex = slots.findIndex(slot => slot.id === id)
    
    if (slotIndex === -1) {
      return Response.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }
    
    const slot = slots[slotIndex]
    
    // Retirer le joueur
    slot.players = slot.players.filter(player => player !== name)
    slots[slotIndex] = slot
    
    await writeJsonFile('slots.json', slots)
    
    return Response.json(slot)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur désinscription' }, { status: 500 })
  }
}