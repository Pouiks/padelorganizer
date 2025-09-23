import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

// Fonction utilitaire pour récupérer un blob
async function getBlobData(filename) {
  try {
    const { blobs } = await list({ prefix: filename })
    
    if (blobs.length === 0) {
      console.log(`⚠️ Blob ${filename} introuvable, données par défaut`)
      // Données par défaut si pas de blob
      if (filename === 'friends.json') return ["Carenza", "Adrien", "Virgile", "Lucas", "Pauline", "Gregory", "Timothé", "Phillipe"]
      if (filename === 'clubs.json') return [
        {"id": "club1", "name": "Urban Padel", "city": "Castelnau le lez"},
        {"id": "club2", "name": "My center padel", "city": "Palavas les flots"},
        {"id": "club3", "name": "Padel Lattes", "city": "Lattes"}
      ]
      if (filename === 'slots.json') return []
      return null
    }
    
    const response = await fetch(blobs[0].url)
    const text = await response.text()
    return JSON.parse(text)
  } catch (error) {
    console.error(`❌ Erreur blob ${filename}:`, error)
    // Données par défaut en cas d'erreur
    if (filename === 'friends.json') return ["Carenza", "Adrien", "Virgile", "Lucas", "Pauline", "Gregory", "Timothé", "Phillipe"]
    if (filename === 'clubs.json') return [
      {"id": "club1", "name": "Urban Padel", "city": "Castelnau le lez"},
      {"id": "club2", "name": "My center padel", "city": "Palavas les flots"},
      {"id": "club3", "name": "Padel Lattes", "city": "Lattes"}
    ]
    if (filename === 'slots.json') return []
    return null
  }
}

// Lire un fichier JSON (TOUJOURS depuis le blob storage)
export async function readJsonFile(filename) {
  return await getBlobData(filename)
}

// Écrire un fichier JSON (TOUJOURS dans le blob storage)
export async function writeJsonFile(filename, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    console.log(`💾 Écriture blob ${filename}...`)
    
    await put(filename, jsonString, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    })
    
    console.log(`✅ Blob ${filename} écrit avec succès`)
  } catch (error) {
    console.error(`❌ Erreur écriture blob ${filename}:`, error)
    throw error
  }
}

// Générer un ID simple
export function generateId() {
  return Date.now().toString()
}
