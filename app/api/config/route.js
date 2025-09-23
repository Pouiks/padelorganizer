import { readJsonFile } from '../../../lib/data.js'

export async function GET() {
  try {
    const friends = await readJsonFile('friends.json')
    const clubs = await readJsonFile('clubs.json')
    
    return Response.json({ friends, clubs })
  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: 'Erreur de lecture' }, { status: 500 })
  }
}