import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

// Lire un fichier JSON
export function readJsonFile(filename) {
  const filePath = path.join(dataDir, filename)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContent)
}

// Écrire un fichier JSON
export function writeJsonFile(filename, data) {
  const filePath = path.join(dataDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// Générer un ID simple
export function generateId() {
  return Date.now().toString()
}
