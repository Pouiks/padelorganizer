import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

// Fonction utilitaire pour récupérer un blob
async function getBlobData(filename) {
  try {
    // Lister tous les blobs pour trouver le fichier
    const { blobs } = await list({ prefix: filename })
    
    if (blobs.length === 0) {
      // Si le blob n'existe pas, essayer de lire le fichier local en fallback
      if (fs.existsSync(path.join(dataDir, filename))) {
        const fileContent = fs.readFileSync(path.join(dataDir, filename), 'utf8')
        return JSON.parse(fileContent)
      }
      
      // Retourner des données par défaut selon le fichier
      if (filename === 'friends.json') return []
      if (filename === 'clubs.json') return []
      if (filename === 'slots.json') return []
      return null
    }
    
    // Récupérer le contenu du blob le plus récent
    const latestBlob = blobs[0]
    const response = await fetch(latestBlob.url)
    const text = await response.text()
    return JSON.parse(text)
  } catch (error) {
    console.error(`Erreur lors de la lecture du blob ${filename}:`, error)
    
    // Fallback vers fichier local en cas d'erreur
    try {
      if (fs.existsSync(path.join(dataDir, filename))) {
        const fileContent = fs.readFileSync(path.join(dataDir, filename), 'utf8')
        return JSON.parse(fileContent)
      }
    } catch (localError) {
      console.error(`Erreur fallback fichier local ${filename}:`, localError)
    }
    
    // Retourner des données par défaut
    if (filename === 'friends.json') return []
    if (filename === 'clubs.json') return []
    if (filename === 'slots.json') return []
    return null
  }
}

// Lire un fichier JSON (maintenant depuis le blob storage)
export async function readJsonFile(filename) {
  return await getBlobData(filename)
}

// Écrire un fichier JSON (maintenant dans le blob storage)
export async function writeJsonFile(filename, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    
    // Sauvegarder dans le blob storage
    await put(filename, jsonString, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    })
    
    // Optionnel : garder une copie locale pour le développement
    if (fs.existsSync(dataDir)) {
      const filePath = path.join(dataDir, filename)
      fs.writeFileSync(filePath, jsonString)
    }
  } catch (error) {
    console.error(`Erreur lors de l'écriture du blob ${filename}:`, error)
    
    // Fallback vers fichier local en cas d'erreur
    if (fs.existsSync(dataDir)) {
      const filePath = path.join(dataDir, filename)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    }
    throw error
  }
}

// Générer un ID simple
export function generateId() {
  return Date.now().toString()
}
