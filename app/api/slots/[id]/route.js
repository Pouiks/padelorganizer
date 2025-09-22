import { readJsonFile, writeJsonFile } from '../../../../lib/data.js'

// Supprimer un créneau
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const slots = readJsonFile('slots.json')
    const filteredSlots = slots.filter(slot => slot.id !== id)
    
    if (slots.length === filteredSlots.length) {
      return Response.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }
    
    writeJsonFile('slots.json', filteredSlots)
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}