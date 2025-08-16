'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CompanionConfig {
  name: string
  avatar: string
  skillset: string
  features: string[]
  permissions: string
  voiceEnabled: boolean
  files: File[]
}

export default function CreateCompanionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<CompanionConfig>({
    name: '',
    avatar: '🤖',
    skillset: '',
    features: [],
    permissions: 'personal',
    voiceEnabled: false,
    files: []
  })

  const skillsets = [
    { id: 'general', name: 'General Productivity', icon: '⚡', description: 'Task management, scheduling, and general assistance' },
    { id: 'legal', name: 'Legal Navigator', icon: '⚖️', description: 'Contract review, compliance, and legal research' },
    { id: 'crm', name: 'CRM Agent', icon: '📊', description: 'Lead management, follow-ups, and sales automation' },
    { id: 'realestate', name: 'Real Estate Dealbot', icon: '🏠', description: 'Property analysis, market research, and deal structuring' },
    { id: 'healthcare', name: 'Cognitive Healthcare', icon: '💚', description: 'Patient support, therapy guidance, and wellness tracking' },
    { id: 'custom', name: 'Custom Agent', icon: '🎯', description: 'Describe exactly what you need' }
  ]

  const availableFeatures = [
    { id: 'voice', name: 'Voice Enabled', icon: '🎤', description: 'Chat + voice communication blend' },
    { id: 'research', name: 'Web Research + Summarization', icon: '🔍', description: 'Real-time web search and analysis' },
    { id: 'ghl', name: 'CRM / GHL Routing', icon: '🎯', description: 'GoHighLevel integration and automation' },
    { id: 'scheduling', name: 'Scheduling', icon: '📅', description: 'Calendar management and booking' },
    { id: 'pricing', name: 'Pricing / Quote Builder', icon: '💰', description: 'Dynamic pricing and proposal generation' },
    { id: 'documents', name: 'AI Document Review', icon: '📄', description: 'OCR, analysis, and document processing' },
    { id: 'compliance', name: 'Compliance / Regulation Tracker', icon: '🛡️', description: 'Industry regulation monitoring' }
  ]

  const toggleFeature = (featureId: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(featureId) 
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  const createCompanion = async () => {
    try {
      const response = await fetch('/api/companions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      const data = await response.json()
      if (data.success) {
        router.push(`/companions/${data.companionId}`)
      }
    } catch (error) {
      console.error('Failed to create companion:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/pro')} className="text-gray-400 hover:text-white">
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold">🤖 Create Your AI Companion</h1>
              <p className="text-gray-400">Build a custom SAINTSAL™ intelligent agent</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Step {step} of 7
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Name Your Assistant */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">What's your assistant's name?</h2>
            <p className="text-gray-400 mb-8">Give your AI companion a memorable name</p>
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. My Business Buddy"
                className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-lg text-center text-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!config.name}
              className="mt-8 px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Choose Avatar */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Choose an avatar</h2>
            <p className="text-gray-400 mb-8">Pick a visual representation for {config.name}</p>
            
            <div className="grid grid-cols-6 gap-4 max-w-2xl mx-auto mb-8">
              {['🤖', '👨‍💼', '👩‍💼', '🧠', '⚡', '🎯', '💡', '🔥', '⭐', '💎', '🚀', '👑'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setConfig(prev => ({ ...prev, avatar: emoji }))}
                  className={`p-6 text-4xl rounded-lg border-2 transition ${
                    config.avatar === emoji 
                      ? 'border-yellow-500 bg-yellow-500/20' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Core Skillset */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Select Core Skillset</h2>
              <p className="text-gray-400">Choose the primary focus for {config.name}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {skillsets.map(skillset => (
                <button
                  key={skillset.id}
                  onClick={() => setConfig(prev => ({ ...prev, skillset: skillset.id }))}
                  className={`p-6 rounded-lg border-2 text-left transition ${
                    config.skillset === skillset.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{skillset.icon}</span>
                    <h3 className="text-xl font-semibold">{skillset.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{skillset.description}</p>
                </button>
              ))}
            </div>

            {config.skillset === 'custom' && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Describe what you need:</label>
                <textarea
                  placeholder="Tell us exactly what kind of assistant you want..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-yellow-500 focus:outline-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!config.skillset}
                className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Features */}
        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Choose Features</h2>
              <p className="text-gray-400">Select the capabilities for {config.name}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {availableFeatures.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    config.features.includes(feature.id) 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{feature.icon}</span>
                      <h3 className="font-semibold">{feature.name}</h3>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      config.features.includes(feature.id) 
                        ? 'border-yellow-500 bg-yellow-500' 
                        : 'border-gray-600'
                    }`}>
                      {config.features.includes(feature.id) && (
                        <span className="text-black text-xs">✓</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </button>
              ))}
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: File Upload */}
        {step === 5 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Upload Knowledge Files</h2>
              <p className="text-gray-400">Optional: Add documents to enhance {config.name}'s knowledge</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center mb-8">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Drag & drop files here</h3>
              <p className="text-gray-400 mb-4">Supports PDF, DOC, TXT, and more</p>
              <button className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700">
                Choose Files
              </button>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Permissions */}
        {step === 6 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Set Permissions</h2>
              <p className="text-gray-400">Who can access {config.name}?</p>
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto mb-8">
              {[
                { id: 'personal', name: 'Personal Only', description: 'Only you can access this assistant' },
                { id: 'team', name: 'Team Access', description: 'Share with your team members' },
                { id: 'public', name: 'Public Embed', description: 'Anyone with the link can use it' }
              ].map(permission => (
                <button
                  key={permission.id}
                  onClick={() => setConfig(prev => ({ ...prev, permissions: permission.id }))}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    config.permissions === permission.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{permission.name}</h3>
                  <p className="text-gray-400 text-sm">{permission.description}</p>
                </button>
              ))}
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(5)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(7)}
                className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Review & Launch */}
        {step === 7 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Review & Launch</h2>
              <p className="text-gray-400">Ready to create {config.name}?</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl">{config.avatar}</span>
                <div>
                  <h3 className="text-2xl font-bold">{config.name}</h3>
                  <p className="text-gray-400">
                    {skillsets.find(s => s.id === config.skillset)?.name}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {config.features.map(featureId => {
                      const feature = availableFeatures.find(f => f.id === featureId)
                      return (
                        <li key={featureId} className="flex items-center space-x-2">
                          <span>{feature?.icon}</span>
                          <span>{feature?.name}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Access:</h4>
                  <p className="text-sm text-gray-400 capitalize">{config.permissions} access</p>
                  
                  <h4 className="font-semibold mb-2 mt-4">Your URL:</h4>
                  <p className="text-sm text-yellow-500">{config.name.toLowerCase().replace(/\s+/g, '-')}.saintvisionai.com/console</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setStep(6)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={createCompanion}
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500"
              >
                🚀 Launch {config.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}