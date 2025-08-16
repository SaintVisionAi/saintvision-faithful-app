'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentId?: string
  modules?: string[]
}

interface Agent {
  id: string
  name: string
  type: string
  mode: 'ryan' | 'execution'
  modules: string[]
  status: 'active' | 'inactive'
}

function ConsoleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const agentId = searchParams.get('agent')
    
    if (agentId) {
      // Mock agent - in production, fetch from API
      const mockAgent: Agent = {
        id: agentId,
        name: 'SAINT DR.™',
        type: 'saint-dr',
        mode: 'execution',
        modules: ['LEGAL', 'FINANCIAL', 'BUSINESS'],
        status: 'active'
      }
      
      setAgent(mockAgent)
      
      // Welcome message
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `${mockAgent.name} is ready. What do you need to analyze?`,
        timestamp: new Date(),
        agentId: agentId
      }
      setMessages([welcomeMessage])
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading || !agent) return

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
      const response = await fetch(`/api/agents/${agent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          agentId: agent.id,
          mode: agent.mode
        })
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Understood. Let me analyze that.',
        timestamp: new Date(),
        agentId: agent.id,
        modules: data.activeModules
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "Connection issue. Let me reconnect.",
        timestamp: new Date(),
        agentId: agent.id
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Agent Selected</h1>
          <button 
            onClick={() => router.push('/companions')}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg"
          >
            Select Agent
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Agent Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
              🩺
            </div>
            <div>
              <h3 className="font-bold text-white">{agent.name}</h3>
              <p className="text-xs text-gray-400">{agent.mode.toUpperCase()} MODE</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Modules */}
        <div className="p-6 border-b border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 mb-3">INTELLIGENCE MODULES</h4>
          <div className="space-y-2">
            {agent.modules.map(module => {
              const moduleInfo = {
                'LEGAL': { icon: '⚖️', name: 'Legal Doctrine' },
                'FINANCIAL': { icon: '💰', name: 'Financial IQ' },
                'HEALTH': { icon: '🩺', name: 'Health Patterns' },
                'BUSINESS': { icon: '📊', name: 'Business Diagnostic' }
              }[module] || { icon: '🧠', name: module }
              
              return (
                <div key={module} className="flex items-center space-x-3 p-2 bg-gray-900 rounded-lg">
                  <span className="text-lg">{moduleInfo.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{moduleInfo.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 flex-1">
          <h4 className="text-xs font-semibold text-gray-400 mb-3">QUICK ACTIONS</h4>
          <div className="space-y-2">
            <button className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition">
              <div className="flex items-center space-x-3">
                <span>📋</span>
                <span className="text-sm">Document Review</span>
              </div>
            </button>
            <button className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition">
              <div className="flex items-center space-x-3">
                <span>💼</span>
                <span className="text-sm">Business Analysis</span>
              </div>
            </button>
            <button className="w-full p-3 bg-gray-900 rounded-lg text-left hover:bg-gray-800 transition">
              <div className="flex items-center space-x-3">
                <span>📊</span>
                <span className="text-sm">Financial Model</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Console */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {agent.name} Console
              </h1>
              <p className="text-sm text-gray-400">
                Executive AI • {agent.mode.toUpperCase()} Mode
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="text-gray-400 hover:text-white transition"
              >
                ⚙️ Settings
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
                  
                  {/* Agent Avatar */}
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mt-1">
                      🩺
                    </div>
                  )}
                  
                  <div className="flex-1">
                    {/* Active Modules */}
                    {message.role === 'assistant' && message.modules && message.modules.length > 0 && (
                      <div className="flex space-x-1 mb-2">
                        {message.modules.map(module => (
                          <span key={module} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                            {module}
                          </span>
                        ))}
                      </div>
                    )}
                    
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
                    🩺
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
                placeholder={`Consult with ${agent.name}...`}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg resize-none focus:border-yellow-500 focus:outline-none text-white placeholder-gray-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? '...' : '→'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsolePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading console...</div>
      </div>
    }>
      <ConsoleContent />
    </Suspense>
  )
}