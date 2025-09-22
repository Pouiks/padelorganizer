import { readJsonFile, writeJsonFile } from '../../../../../lib/data.js'

export async function POST(request, { params }) {
  try {
    const { name } = await request.json()
    const { id } = params
    
    if (!name) {
      return Response.json({ error: 'Nom requis' }, { status: 400 })
    }
    
    const slots = readJsonFile('slots.json')
    const slotIndex = slots.findIndex(slot => slot.id === id)
    
    if (slotIndex === -1) {
      return Response.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }
    
    const slot = slots[slotIndex]
    
    // Vérifier si déjà inscrit
    if (slot.players.includes(name)) {
      return Response.json({ error: 'Déjà inscrit' }, { status: 400 })
    }
    
    // Vérifier si complet
    if (slot.players.length >= slot.maxPlayers) {
      return Response.json({ error: 'Complet' }, { status: 400 })
    }
    
    // Ajouter le joueur
    slot.players.push(name)
    slots[slotIndex] = slot
    
    writeJsonFile('slots.json', slots)
    
    return Response.json(slot)
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur inscription' }, { status: 500 })
  }
}