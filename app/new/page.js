'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '../../components/Toast.js'

export default function NewSlotPage() {
  const router = useRouter()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    clubId: '',
    date: '',
    time: '',
    duration: 90,
    maxPlayers: 4,
    price: ''
  })

  useEffect(() => {
    loadClubs()
    
    // Date par défaut : demain
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0],
      time: '19:00'
    }))
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch('/api/config')
      const config = await response.json()
      setClubs(config.clubs)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 [CREATION] Début de la création de créneau')
    
    if (!formData.clubId || !formData.date || !formData.time) {
      console.log('❌ [CREATION] Champs manquants:', { clubId: formData.clubId, date: formData.date, time: formData.time })
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSubmitting(true)
    
    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null
      }
      
      console.log('📤 [CREATION] Envoi de la requête:', payload)
      
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📥 [CREATION] Réponse reçue:', response.status, response.statusText)

      if (response.ok) {
        const newSlot = await response.json()
        console.log('✅ [CREATION] Créneau créé avec succès:', newSlot)
        toast.success('Créneau créé avec succès !')
        console.log('🔄 [CREATION] Redirection vers la page d\'accueil')
        // Rediriger vers la page d'accueil
        router.push('/')
      } else {
        const error = await response.json()
        console.log('❌ [CREATION] Erreur de création:', error)
        toast.error(error.error)
      }
    } catch (error) {
      console.log('💥 [CREATION] Exception:', error)
      toast.error('Erreur création')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push('/')}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold">Nouveau Créneau</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Club *</label>
          <select
            value={formData.clubId}
            onChange={(e) => setFormData({...formData, clubId: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Choisir un club...</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>
                {club.name} - {club.city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Durée</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
            >
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
              <option value={120}>2h</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max joueurs</label>
            <select
              value={formData.maxPlayers}
              onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix (€/pers)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="Optionnel"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {submitting ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}