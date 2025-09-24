'use client'

import { useState, useEffect } from 'react'
import { toast } from '../components/Toast.js'

export default function HomePage() {
  const [slots, setSlots] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initPage = async () => {
      // D'abord charger les données existantes
      await loadData()
      
      // Puis ajouter le nouveau créneau si présent
      const urlParams = new URLSearchParams(window.location.search)
      const newSlotData = urlParams.get('newSlot')
      if (newSlotData) {
        try {
          const newSlot = JSON.parse(decodeURIComponent(newSlotData))
          console.log('🆕 [ACCUEIL] Ajout du nouveau créneau après chargement:', newSlot)
          setSlots(prevSlots => [...prevSlots, newSlot])
          
          // Nettoyer l'URL
          window.history.replaceState({}, '', window.location.pathname)
        } catch (error) {
          console.error('Erreur parsing nouveau créneau:', error)
        }
      }
    }
    
    initPage()
  }, [])

  const loadData = async () => {
    try {
      const [configRes, slotsRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/slots')
      ])
      
      const config = await configRes.json()
      const slotsData = await slotsRes.json()
      
      setFriends(config.friends)
      setSlots(slotsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (slotId, name) => {
    console.log('👥 [INSCRIPTION] Début inscription:', { slotId, name })
    
    try {
      const response = await fetch(`/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      
      console.log('📥 [INSCRIPTION] Réponse:', response.status, response.statusText)
      
      if (response.ok) {
        const updatedSlot = await response.json()
        console.log('✅ [INSCRIPTION] Succès - créneau mis à jour:', updatedSlot)
        console.log('🔍 [INSCRIPTION] Players dans la réponse:', updatedSlot.players)
        
        // Mettre à jour le créneau avec les données de l'API
        setSlots(prevSlots => {
          const newSlots = prevSlots.map(slot => 
            slot.id === slotId ? updatedSlot : slot
          )
          console.log('🔄 [INSCRIPTION] Nouveau state après mise à jour:', newSlots.find(s => s.id === slotId)?.players)
          return newSlots
        })
        
        toast.success(`${name} inscrit au créneau !`)
      } else {
        const error = await response.json()
        console.log('❌ [INSCRIPTION] Erreur:', error)
        toast.error(error.error)
      }
    } catch (error) {
      console.log('💥 [INSCRIPTION] Exception:', error)
      toast.error('Erreur inscription')
    }
  }

  const handleLeave = async (slotId, name) => {
    console.log('👥 [DESINSCRIPTION] Début désinscription:', { slotId, name })
    
    try {
      const response = await fetch(`/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      
      if (response.ok) {
        const updatedSlot = await response.json()
        console.log('✅ [DESINSCRIPTION] Succès - créneau mis à jour:', updatedSlot)
        
        // Mettre à jour le créneau avec les données de l'API
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.id === slotId ? updatedSlot : slot
          )
        )
        
        toast.success(`${name} retiré du créneau`)
      } else {
        const error = await response.json()
        console.log('❌ [DESINSCRIPTION] Erreur:', error)
        toast.error(error.error)
      }
    } catch (error) {
      console.log('💥 [DESINSCRIPTION] Exception:', error)
      toast.error('Erreur désinscription')
    }
  }

  const handleDelete = async (slotId) => {
    if (!confirm('Supprimer ce créneau ?')) return
    
    console.log('🗑️ [SUPPRESSION] ID à supprimer:', slotId)
    
    try {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'DELETE'
      })
      
      console.log('📥 [SUPPRESSION] Réponse:', response.status, response.statusText)
      
      if (response.ok) {
        console.log('✅ [SUPPRESSION] Succès API')
        
        // Retirer le créneau du state
        setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId))
        
        toast.success('Créneau supprimé')
      } else {
        console.log('❌ [SUPPRESSION] Erreur API')
        toast.error('Erreur suppression')
      }
    } catch (error) {
      console.log('💥 [SUPPRESSION] Exception:', error)
      toast.error('Erreur suppression')
    }
  }

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎾 Créneaux Padel</h1>
        <p className="text-gray-600 text-sm">
          Cliquez sur votre prénom pour vous inscrire ou vous désinscrire d'un créneau
        </p>
      </div>
      
      <div className="mb-6">
        <a href="/new" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          + Nouveau créneau
        </a>
      </div>

      {slots.length === 0 ? (
        <p className="text-gray-500">Aucun créneau pour le moment</p>
      ) : (
        <div className="space-y-4">
          {slots.map(slot => (
            <div key={slot.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{slot.clubName}</h3>
                  <p className="text-gray-600">{slot.clubCity}</p>
                  <p className="text-sm text-gray-500">
                    {slot.date} à {slot.time} ({slot.duration}min)
                  </p>
                  {slot.price && <p className="text-green-600">{slot.price}€/pers</p>}
                </div>
                <button 
                  onClick={() => handleDelete(slot.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️ Supprimer
                </button>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    Joueurs ({slot.players.length}/{slot.maxPlayers})
                  </p>
                  {slot.players.length >= slot.maxPlayers && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      COMPLET
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {slot.players.map((player, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {player}
                    </span>
                  ))}
                  {/* Places libres */}
                  {Array.from({ length: slot.maxPlayers - slot.players.length }).map((_, i) => (
                    <span key={`empty-${i}`} className="bg-gray-100 text-gray-400 px-2 py-1 rounded text-sm">
                      Place libre
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Cliquez sur votre prénom :</p>
                <div className="flex flex-wrap gap-2">
                  {friends.map(friend => {
                    const isRegistered = slot.players.includes(friend)
                    const isFull = slot.players.length >= slot.maxPlayers
                    
                    return (
                      <button
                        key={friend}
                        onClick={() => isRegistered ? handleLeave(slot.id, friend) : handleJoin(slot.id, friend)}
                        disabled={!isRegistered && isFull}
                        className={`
                          px-3 py-2 rounded text-sm font-medium transition-colors
                          ${isRegistered 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : isFull 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }
                        `}
                      >
                        {friend} {isRegistered ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}