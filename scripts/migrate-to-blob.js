#!/usr/bin/env node

/**
 * Script de migration des données JSON vers le blob storage Vercel
 * 
 * Ce script lit les fichiers JSON locaux et les uploade dans le blob storage.
 * À exécuter une seule fois après le déploiement avec la nouvelle configuration.
 */

const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const dataDir = path.join(__dirname, '..', 'data')

async function migrateFile(filename) {
  try {
    const filePath = path.join(dataDir, filename)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier ${filename} non trouvé, création d'un fichier vide`)
      
      let defaultData = []
      if (filename === 'clubs.json') {
        defaultData = [
          {
            "id": "club1",
            "name": "Urban Padel",
            "city": "Castelnau le lez"
          },
          {
            "id": "club2", 
            "name": "My center padel",
            "city": "Palavas les flots"
          },
          {
            "id": "club3",
            "name": "Padel Lattes",
            "city": "Lattes"
          }
        ]
      } else if (filename === 'friends.json') {
        defaultData = [
          "Carenza",
          "Adrien", 
          "Virgile",
          "Lucas",
          "Pauline",
          "Gregory",
          "Timothé",
          "Phillipe"
        ]
      }
      
      const jsonString = JSON.stringify(defaultData, null, 2)
      await put(filename, jsonString, {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true
      })
      
      console.log(`✅ ${filename} créé dans le blob storage avec des données par défaut`)
      return
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    console.log(`📤 Migration de ${filename}...`)
    console.log(`   Données trouvées: ${Array.isArray(data) ? data.length + ' éléments' : 'objet'}`)
    
    const blob = await put(filename, fileContent, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    })
    
    console.log(`✅ ${filename} migré avec succès`)
    console.log(`   URL: ${blob.url}`)
    
  } catch (error) {
    console.error(`❌ Erreur lors de la migration de ${filename}:`, error.message)
  }
}

async function main() {
  console.log('🚀 Début de la migration vers le blob storage Vercel\n')
  
  // Vérifier que la variable d'environnement existe
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Variable d\'environnement BLOB_READ_WRITE_TOKEN manquante')
    console.log('   Assurez-vous que votre fichier .env contient cette variable')
    process.exit(1)
  }
  
  const files = ['friends.json', 'clubs.json', 'slots.json']
  
  for (const file of files) {
    await migrateFile(file)
    console.log('') // Ligne vide pour la lisibilité
  }
  
  console.log('🎉 Migration terminée !')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Testez votre application en local: npm run dev')
  console.log('2. Vérifiez que les données s\'affichent correctement')
  console.log('3. Déployez sur Vercel: git push')
  console.log('4. Connectez le blob storage via l\'interface Vercel')
}

main().catch(console.error)
