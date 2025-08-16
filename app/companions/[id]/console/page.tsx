'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'voice' | 'file'
}

interface Companion {
  id: string
  name: string
  avatar: string
  skillset: string
  features: string[]
  systemPrompt: string
  tier: string
  status: 'active' | 'inactive'
}

export default function CompanionConsolePage() {
  const params = useParams()
  const [companion, setCompanion] = useState<Companion | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Mock companion data - in production, fetch from API
  useEffect(() => {
    const mockCompanion: Companion = {
      id: params.id as string,
      name: 'Business Buddy',
      avatar: '💼',
      skillset: 'general',
      features: ['voice', 'research', 'scheduling', 'ghl'],
      systemPrompt: 'You are Business Buddy, a general productivity assistant...',
      tier: 'pro',
      status: 'active'
    }
    
    setCompanion(mockCompanion)
    
    // Welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ${mockCompanion.name}, your AI companion. I'm here to help you with productivity, scheduling, and business tasks. How can I assist you today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading || !companion) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      // In production, this would call the companion's API endpoint
      const response = await fetch(`/api/companions/${companion.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          companionId: companion.id
        })
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || `I understand you're asking about "${userMessage}". As ${companion.name}, I'm designed to help with ${companion.skillset} tasks. Let me assist you with that.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleVoiceRecording = () => {
    if (!companion?.features.includes('voice')) return
    
    setIsRecording(!isRecording)
    // In production, implement actual voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false)
        setInput('Voice message transcribed...')
      }, 3000)
    }
  }

  const clearChat = () => {
    if (!companion) return
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Chat cleared. I'm ${companion.name}, ready to help you again!`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  if (!companion) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your companion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-gray-950 border-r border-gray-800 flex flex-col`}>
        {/* Companion Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                  {companion.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white">{companion.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{companion.skillset} Assistant</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-white transition p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Features */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 mb-3">CAPABILITIES</h4>
            <div className="space-y-2">
              {companion.features.map(feature => {
                const featureInfo = {
                  voice: { icon: '🎤', name: 'Voice Chat', desc: 'Speak with your companion' },
                  research: { icon: '🔍', name: 'Web Research', desc: 'Real-time information' },
                  scheduling: { icon: '📅', name: 'Scheduling', desc: 'Calendar management' },
                  ghl: { icon: '🎯', name: 'CRM Integration', desc: 'GoHighLevel sync' },
                  documents: { icon: '📄', name: 'Document Review', desc: 'File analysis' },
                  pricing: { icon: '💰', name: 'Quote Builder', desc: 'Dynamic pricing' }
                }[feature] || { icon: '⚡', name: feature, desc: 'Advanced capability' }
                
                return (
                  <div key={feature} className="flex items-center space-x-3 p-2 bg-gray-900 rounded-lg">
                    <span className="text-lg">{featureInfo.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{featureInfo.name}</div>
                      <div className="text-xs text-gray-400">{featureInfo.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {sidebarOpen && (
          <div className="p-4 flex-1">
            <h4 className="text-xs font-semibold text-gray-400 mb-3">QUICK ACTIONS</h4>
            <div className="space-y-2">
              <button
                onClick={clearChat}
                className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition"
              >
                <div className="flex items-center space-x-3">
                  <span>🔄</span>
                  <span className="text-sm">New Chat</span>
                </div>
              </button>
              <button className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition">
                <div className="flex items-center space-x-3">
                  <span>📁</span>
                  <span className="text-sm">Upload File</span>
                </div>
              </button>
              <button className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition">
                <div className="flex items-center space-x-3">
                  <span>⚙️</span>
                  <span className="text-sm">Settings</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tier Badge */}
        <div className="p-4 border-t border-gray-800">
          <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <div className="text-sm font-semibold text-yellow-400 uppercase">{companion.tier} Tier</div>
              <div className="text-xs text-gray-400 mt-1">All features unlocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {companion.name} Console
              </h1>
              <p className="text-sm text-gray-400">
                HACP™ Powered • {companion.tier.toUpperCase()} Tier
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {companion.features.includes('voice') && (
                <button
                  onClick={toggleVoiceRecording}
                  className={`p-2 rounded-lg transition ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  🎤
                </button>
              )}
              <button className="text-gray-400 hover:text-white transition">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-black">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'assistant' ? 'flex space-x-3' : ''}`}>
                  
                  {/* Companion Avatar */}
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mt-1">
                      {companion.avatar}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {/* Message Content */}
                    <div className={`rounded-xl px-6 py-4 ${
                      message.role === 'user' 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-gray-900 text-white border border-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className="text-xs opacity-70 mt-3">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg">
                    {companion.avatar}
                  </div>
                  <div className="bg-gray-900 rounded-xl px-6 py-4 border border-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 bg-gray-950 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Chat with ${companion.name}...`}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg resize-none focus:border-yellow-500 focus:outline-none text-white placeholder-gray-500"
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                {companion.features.includes('voice') && (
                  <button
                    onClick={toggleVoiceRecording}
                    className={`p-2 rounded-lg transition ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    🎤
                  </button>
                )}
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}