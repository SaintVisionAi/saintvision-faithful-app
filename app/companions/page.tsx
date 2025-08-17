'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Companion {
  id: string
  name: string
  avatar: string
  skillset: string
  features: string[]
  status: 'active' | 'inactive' | 'building'
  subdomain: string
  created: string
  tier: string
  lastUsed?: string
  usage?: {
    messages: number
    hours: number
  }
}

export default function CompanionsPage() {
  const router = useRouter()
  const [companions, setCompanions] = useState<Companion[]>([])
  const [loading, setLoading] = useState(true)

  // Simulated data - in production, fetch from API
  useEffect(() => {
    const mockCompanions: Companion[] = [
      {
        id: 'comp_1',
        name: 'Business Buddy',
        avatar: '💼',
        skillset: 'general',
        features: ['voice', 'research', 'scheduling'],
        status: 'active',
        subdomain: 'business-buddy',
        created: '2024-08-15T10:00:00Z',
        tier: 'pro',
        lastUsed: '2024-08-16T14:30:00Z',
        usage: { messages: 245, hours: 12 }
      },
      {
        id: 'comp_2',
        name: 'Legal Navigator',
        avatar: '⚖️',
        skillset: 'legal',
        features: ['research', 'documents', 'compliance'],
        status: 'active',
        subdomain: 'legal-navigator',
        created: '2024-08-14T15:20:00Z',
        tier: 'pro',
        lastUsed: '2024-08-16T09:15:00Z',
        usage: { messages: 89, hours: 4 }
      }
    ]
    
    setTimeout(() => {
      setCompanions(mockCompanions)
      setLoading(false)
    }, 1000)
  }, [])

  const skillsetNames = {
    general: 'General Productivity',
    legal: 'Legal Navigator',
    crm: 'CRM Agent',
    realestate: 'Real Estate Dealbot',
    healthcare: 'Cognitive Healthcare',
    custom: 'Custom Agent'
  }

  const tierColors = {
    free: 'text-gray-400',
    basic: 'text-blue-400',
    pro: 'text-yellow-400',
    enterprise: 'text-purple-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your companions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <span>🤖</span>
                <span>Your AI Companions</span>
              </h1>
              <p className="text-gray-400 mt-1">Manage your SAINTSAL™ intelligent agents</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/companions/create"
                className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
              >
                + Create New Companion
              </Link>
              <button
                onClick={() => router.push('/pro')}
                className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {companions.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-2xl font-bold mb-4">No companions yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first AI companion to get started with intelligent automation and assistance.
            </p>
            <Link
              href="/companions/create"
              className="inline-block px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
            >
              🚀 Create Your First Companion
            </Link>
          </div>
        ) : (
          // Companions Grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map(companion => (
              <div
                key={companion.id}
                className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition group"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                      {companion.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{companion.name}</h3>
                      <p className="text-sm text-gray-400">
                        {skillsetNames[companion.skillset as keyof typeof skillsetNames]}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${tierColors[companion.tier as keyof typeof tierColors]}`}>
                        {companion.tier.toUpperCase()}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        companion.status === 'active' ? 'bg-green-400' : 
                        companion.status === 'building' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created {new Date(companion.created).toLocaleDateString()}
                  </div>
                </div>

                {/* Features */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {companion.features.slice(0, 3).map(feature => {
                      const featureIcons = {
                        voice: '🎤',
                        research: '🔍',
                        ghl: '🎯',
                        scheduling: '📅',
                        pricing: '💰',
                        documents: '📄',
                        compliance: '🛡️'
                      }
                      
                      return (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 bg-gray-800 rounded-full flex items-center space-x-1"
                        >
                          <span>{featureIcons[feature as keyof typeof featureIcons]}</span>
                          <span className="capitalize">{feature}</span>
                        </span>
                      )
                    })}
                    {companion.features.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
                        +{companion.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                {companion.usage && (
                  <div className="p-4 border-b border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-400">{companion.usage.messages}</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{companion.usage.hours}h</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open(`https://${companion.subdomain}.saintvisionai.com/console`, '_blank')}
                      className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition text-sm"
                    >
                      🚀 Launch
                    </button>
                    <button
                      onClick={() => router.push(`/companions/${companion.id}/console`)}
                      className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      💬 Console
                    </button>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 truncate">
                    URL: {companion.subdomain}.saintvisionai.com
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {companions.length > 0 && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-yellow-500">{companions.length}</div>
              <div className="text-sm text-gray-400">Active Companions</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {companions.reduce((sum, c) => sum + (c.usage?.messages || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Messages</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-500">
                {companions.reduce((sum, c) => sum + (c.usage?.hours || 0), 0)}h
              </div>
              <div className="text-sm text-gray-400">Total Active Time</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-500">
                {companions.filter(c => c.tier === 'pro').length}
              </div>
              <div className="text-sm text-gray-400">Pro Tier</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}