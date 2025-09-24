import { deleteSlot, initDatabase } from '../../../../lib/db.js'

// Supprimer un créneau
export async function DELETE(request, { params }) {
  try {
    await initDatabase()
    const { id } = params
    
    const deleted = await deleteSlot(id)
    
    if (!deleted) {
      return Response.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}