'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentId?: string
  model?: string
  thinking?: boolean
}

interface Agent {
  id: string
  name: string
  description: string
  type: 'business' | 'creative' | 'technical' | 'personal'
  avatar: string
  specialization?: string
}

function WarRoomContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const availableAgents: Agent[] = [
    {
      id: '1',
      name: 'Business Strategist SAL',
      description: 'Expert in business planning, market analysis, and growth strategies',
      type: 'business',
      avatar: '💼',
      specialization: 'Strategic Planning'
    },
    {
      id: '2', 
      name: 'Creative Writer SAL',
      description: 'Specialized in content creation, copywriting, and storytelling',
      type: 'creative',
      avatar: '✍️',
      specialization: 'Content & Copy'
    },
    {
      id: '3',
      name: 'Code Architect SAL',
      description: 'Full-stack development, API design, and software architecture',
      type: 'technical',
      avatar: '⚡',
      specialization: 'Development'
    },
    {
      id: 'default',
      name: 'SAINT SAL™',
      description: 'Your primary AI assistant powered by our triple-AI engine',
      type: 'business',
      avatar: '🤖',
      specialization: 'General Intelligence'
    }
  ]

  const [conversations, setConversations] = useState<any[]>([])

  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [toolsEnabled, setToolsEnabled] = useState(true)
  
  const models = [
    { id: 'gpt-4', name: 'GPT-4 Turbo', provider: 'OpenAI', status: 'active' },
    { id: 'claude-4', name: 'Claude 4', provider: 'Anthropic', status: 'active' },
    { id: 'o3-mini', name: 'O3 Mini', provider: 'OpenAI', status: 'active' },
    { id: 'saintsal', name: 'SAINTSAL™', provider: 'SaintVision', status: 'active' }
  ]

  const tools = [
    { id: 'web-search', name: 'Web Search', icon: '🔍', status: 'ready', description: 'Real-time web search' },
    { id: 'code-interpreter', name: 'Code Interpreter', icon: '💻', status: 'ready', description: 'Python code execution' },
    { id: 'image-generation', name: 'DALL-E 3', icon: '🎨', status: 'ready', description: 'Image generation' },
    { id: 'file-upload', name: 'File Analysis', icon: '📁', status: 'ready', description: 'Document analysis' },
    { id: 'ghl-crm', name: 'GHL CRM', icon: '🎯', status: 'connected', description: 'GoHighLevel integration' },
    { id: 'calendar', name: 'Calendar', icon: '📅', status: 'ready', description: 'Schedule management' },
    { id: 'email', name: 'Email', icon: '✉️', status: 'ready', description: 'Communication hub' },
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Check if coming from agents page with specific agent
    const agentParam = searchParams.get('agent')
    if (agentParam) {
      const selectedAgent = availableAgents.find(agent => agent.id === agentParam)
      if (selectedAgent) {
        setActiveAgent(selectedAgent)
        // Add welcome message from the selected agent
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm ${selectedAgent.name}. ${selectedAgent.description}. How can I assist you today?`,
          timestamp: new Date(),
          agentId: selectedAgent.id,
          model: selectedAgent.name
        }
        setMessages([welcomeMessage])
      }
    } else {
      // Default to SAINT SAL
      const defaultAgent = availableAgents.find(agent => agent.id === 'default')!
      setActiveAgent(defaultAgent)
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: 'Welcome to the WarRoom. I\'m SAINTSAL™, your AI Concierge & Virtual Mentor powered by HACP™ Protocol.\n\nI coordinate the entire SaintVision AI ecosystem:\n🏢 **EbyTech.ai** - Enterprise automation & FinTech\n💚 **Athen.ai** - Healthcare & legacy planning  \n⚖️ **SVTlegal.ai** - Legal document automation\n🎓 **SVTteach.ai** - Interactive education platform\n\nI\'m your main workhorse for complex business analysis, scaling solutions, and strategic intelligence. What enterprise challenge shall we tackle?',
        timestamp: new Date(),
        agentId: 'default',
        model: 'SAINTSAL™'
      }
      setMessages([welcomeMessage])
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

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

    // Add thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `${activeAgent?.name} is analyzing your request...`,
      timestamp: new Date(),
      agentId: activeAgent?.id,
      model: activeAgent?.name,
      thinking: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      // Create agent-aware prompt
      const agentContext = activeAgent ? `You are ${activeAgent.name}. ${activeAgent.description}. ${activeAgent.specialization ? `You specialize in ${activeAgent.specialization}.` : ''} ` : ''
      const enhancedPrompt = agentContext + userMessage

      // Route through new intelligence system
      const response = await fetch('/api/warroom/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          agentId: activeAgent?.id,
          agentName: activeAgent?.name,
          model: selectedModel,
          toolsEnabled: toolsEnabled,
          emotionalContext: true,
          hacpMode: true
        })
      })

      const data = await response.json()
      
      // Remove thinking message and add response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.thinking)
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: data.response || 'I understand your request. Let me help you with that.',
          timestamp: new Date(),
          agentId: activeAgent?.id,
          model: data.model || activeAgent?.name || 'SAINT SAL™'
        }]
      })

      if (data.threadId) setThreadId(data.threadId)

    } catch (error) {
      try {
        const fallbackResponse = await fetch('/api/search/dual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage })
        })
        
        const fallbackData = await fallbackResponse.json()
        setMessages(prev => {
          const filtered = prev.filter(m => !m.thinking)
          return [...filtered, {
            id: (Date.now() + 3).toString(),
            role: 'assistant',
            content: fallbackData.unified || fallbackData.claude || `${activeAgent?.name || 'SAL'} is ready to help.`,
            timestamp: new Date(),
            agentId: activeAgent?.id,
            model: activeAgent?.name || 'SAINT SAL™'
          }]
        })
      } catch (fallbackError) {
        setMessages(prev => {
          const filtered = prev.filter(m => !m.thinking)
          return [...filtered, {
            id: (Date.now() + 4).toString(),
            role: 'assistant',
            content: `Reconnecting to ${activeAgent?.name || 'SAL'}...`,
            timestamp: new Date(),
            agentId: activeAgent?.id,
            model: activeAgent?.name || 'SAINT SAL™'
          }]
        })
      }
    }

    setLoading(false)
  }

  const switchAgent = (agent: Agent) => {
    setActiveAgent(agent)
    const switchMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Switching to ${agent.name}. ${agent.description}. How can I help you?`,
      timestamp: new Date(),
      agentId: agent.id,
      model: agent.name
    }
    setMessages(prev => [...prev, switchMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setThreadId(null)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden z-50">
      {/* Left Sidebar - SICK DESIGN */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 bg-black border-r border-gray-900 flex flex-col relative`}>
        {/* Fixed Cookin Knowledge Background */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/logos/cookin.png"
            alt="Background"
            fill
            className="object-contain object-center opacity-10"
          />
        </div>
        
        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with Logo */}
          <div className="p-4 border-b border-gray-900">
            <div className="flex items-center justify-between">
              <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="flex items-center space-x-2">
                  <Image
                    src="/logos/SVTLOGO.png"
                    alt="SaintVisionAI"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <div>
                    <div className="font-bold text-white text-sm">SaintVisionAI™</div>
                    <div className="text-xs text-yellow-500 font-light">Cookin' Knowledge</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-yellow-500 transition p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={startNewChat}
              className={`w-full px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-500 hover:bg-yellow-500/30 transition flex items-center ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}`}
            >
              <span className="text-xl">✨</span>
              {sidebarOpen && <span className="text-sm font-medium tracking-wider">NEW CHAT</span>}
            </button>
          </div>

          {/* SAINTSAL™ Status */}
          {sidebarOpen && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-3 border border-yellow-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-yellow-400">SAINTSAL™ Ready</div>
                    <div className="text-xs text-gray-500">Full Ecosystem Active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTIVE BUSINESS TOOLS */}
          {sidebarOpen && (
            <div className="px-4 pb-4">
              <div className="text-xs tracking-[0.3em] text-gray-600 mb-3">PRODUCTIVE TOOLS</div>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg transition flex items-center space-x-3 bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-yellow-500/30">
                  <span className="text-lg">📊</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">Business Analytics</div>
                    <div className="text-xs text-gray-500">KPI Dashboard & Reports</div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg transition flex items-center space-x-3 bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-yellow-500/30">
                  <span className="text-lg">💰</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">Financial Modeling</div>
                    <div className="text-xs text-gray-500">P&L, Cash Flow, Forecasts</div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg transition flex items-center space-x-3 bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-yellow-500/30">
                  <span className="text-lg">⚖️</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">Legal Documents</div>
                    <div className="text-xs text-gray-500">Contracts, NDAs, Compliance</div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg transition flex items-center space-x-3 bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-yellow-500/30">
                  <span className="text-lg">🚀</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">Growth Strategy</div>
                    <div className="text-xs text-gray-500">Market Analysis & Scaling</div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg transition flex items-center space-x-3 bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-yellow-500/30">
                  <span className="text-lg">🔗</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">CRM Automation</div>
                    <div className="text-xs text-gray-500">Lead Management & Follow-up</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-900">
                <button 
                  onClick={() => router.push('/agents')}
                  className="w-full text-left p-2 rounded-lg transition flex items-center space-x-2 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-800"
                >
                  <span className="text-sm">🤖</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-400">More AI Agents</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-4">
            {sidebarOpen ? (
              <>
                <div className="text-xs tracking-[0.3em] text-gray-600 mb-3">RECENT</div>
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-600 text-xs mb-2">No conversations yet</div>
                      <div className="text-gray-700 text-xs">Start chatting with SAL to build your history</div>
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        className="w-full text-left p-3 rounded-lg bg-gray-950/30 hover:bg-gray-900/50 border border-gray-900 hover:border-gray-800 transition group"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{conv.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-200 group-hover:text-white font-medium">
                              {conv.title}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {conv.preview}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 4).map(conv => (
                  <button
                    key={conv.id}
                    className="w-full p-2 rounded-lg hover:bg-gray-900/50 transition flex justify-center"
                    title={conv.title}
                  >
                    <span className="text-lg">{conv.icon}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section - System Status */}
          <div className="p-4 border-t border-gray-900">
            <div className={`bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-500/30 ${!sidebarOpen && 'p-2'}`}>
              {sidebarOpen ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">SYSTEM STATUS</span>
                    <span className="text-xs text-green-500">● OPERATIONAL</span>
                  </div>
                  <div className="text-sm font-medium text-green-400">HACP™ Protocol</div>
                  <div className="text-xs text-gray-600 mt-1">Triple-AI Engine Active</div>
                </>
              ) : (
                <div className="text-center">
                  <span className="text-xs text-green-500">●</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Header */}
        <div className="bg-black border-b border-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button onClick={() => router.push('/pro')} className="text-gray-400 hover:text-white transition flex items-center space-x-2">
                <span>←</span>
                <span className="text-sm">Pro Dashboard</span>
              </button>
              <div className="text-sm text-gray-500">|</div>
              <div>
                <h1 className="text-lg font-light tracking-wider text-white">WARROOM</h1>
                <p className="text-xs text-gray-600">HACP™ Production Center • Live</p>
              </div>
              
              {/* Active Agent Indicator */}
              {activeAgent && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center text-sm">
                    {activeAgent.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{activeAgent.name}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="text-gray-500 hover:text-yellow-500 transition p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-20">
              <div className="mb-8 relative">
                <Image
                  src="/logos/THE BEST MAIN LOGO + COOKIN.png"
                  alt="SaintVisionAI"
                  width={200}
                  height={120}
                  className="mx-auto object-contain"
                />
              </div>
              <h2 className="text-3xl font-thin mb-4 text-white">SAINTSAL™ Ecosystem Ready</h2>
              <p className="text-gray-500 mb-8">
                Enterprise AI intelligence with access to the full SaintVision platform. Choose your productivity focus:
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                {[
                  '🏢 EbyTech: Automate my business processes',
                  '💚 Athen: Plan healthcare or legacy strategy', 
                  '⚖️ SVTlegal: Draft legal documents & contracts',
                  '🎓 SVTteach: Create training programs',
                  '📊 Analyze business metrics & KPIs',
                  '🚀 Scale operations & growth strategy',
                  '💰 Optimize financial models & revenue',
                  '🎯 Market analysis & competitive intelligence'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion.substring(2))
                      inputRef.current?.focus()
                    }}
                    className="text-left p-4 bg-gradient-to-r from-gray-950/50 to-gray-900/30 border border-gray-900 rounded-lg hover:border-yellow-500/30 transition group"
                  >
                    <span className="text-sm text-gray-400 group-hover:text-white">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${message.role === 'assistant' ? 'flex space-x-3' : ''}`}>
                    
                    {/* Agent Avatar for Assistant Messages */}
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mt-1">
                        {availableAgents.find(a => a.id === message.agentId)?.avatar || '🤖'}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      {/* Agent Name for Assistant Messages */}
                      {message.role === 'assistant' && message.model && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium text-blue-400">{message.model}</span>
                          {message.thinking && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className={`rounded-xl px-6 py-4 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-white' 
                          : message.thinking
                            ? 'bg-gray-900/50 border border-gray-800 text-gray-400 italic'
                            : 'bg-gray-950/50 border border-gray-900 text-gray-300'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        <div className="text-xs text-gray-600 mt-3 flex items-center justify-between">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.role === 'assistant' && !message.thinking && (
                            <div className="flex items-center space-x-4 text-xs">
                              <button className="text-gray-500 hover:text-white transition">👍</button>
                              <button className="text-gray-500 hover:text-white transition">👎</button>
                              <button className="text-gray-500 hover:text-white transition">📋</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-900 bg-black px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Chat with ${activeAgent?.name || 'SAL'}...`}
                rows={2}
                className="w-full px-4 py-3 bg-gray-950/50 border border-gray-900 rounded-lg resize-none focus:border-yellow-500/50 focus:outline-none text-white placeholder-gray-600"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? '...' : '→'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Tools & Model Selection */}
      <div className={`${rightPanelOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-black border-l border-gray-900 flex flex-col`}>
        <div className="p-4 border-b border-gray-900">
          <div className={`${rightPanelOpen ? 'block' : 'hidden'}`}>
            <h3 className="text-sm font-medium tracking-wider text-gray-400">TOOLS</h3>
            <div className="text-xs text-green-400 mt-1">PRO FEATURES</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {rightPanelOpen ? (
            <>
              {/* LLM INTELLIGENCE CORE */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-3">🧠 LLM INTELLIGENCE</h4>
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 p-3 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-yellow-400">GPT-5 Turbo</span>
                    </div>
                    <p className="text-xs text-gray-300">Main workhorse - Complex analysis & strategy</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 p-3 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-blue-400">Claude 4 Sonnet</span>
                    </div>
                    <p className="text-xs text-gray-300">Emotional intelligence & creative solutions</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/10 p-3 rounded-lg border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-purple-400">SAINTSAL™ RAG</span>
                    </div>
                    <p className="text-xs text-gray-300">Knowledge retrieval from business database</p>
                  </div>
                </div>
              </div>

              {/* SAINTVISION TECH STACK */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-3">⚡ SAINTVISION TECH</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/crm')}
                    className="w-full p-3 rounded-lg border transition text-left group bg-green-500/20 border-green-500/50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🎯</span>
                      <div>
                        <div className="text-sm font-medium text-green-400">GHL CRM Integration</div>
                        <div className="text-xs text-gray-300">Connected & Active</div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="bg-gray-950/30 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🔍</span>
                      <div>
                        <div className="text-sm font-medium text-gray-300">Knowledge RAG</div>
                        <div className="text-xs text-gray-500">Business data retrieval</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-950/30 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📊</span>
                      <div>
                        <div className="text-sm font-medium text-gray-300">Analytics Engine</div>
                        <div className="text-xs text-gray-500">Real-time business insights</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-950/30 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🗂️</span>
                      <div>
                        <div className="text-sm font-medium text-gray-300">Document AI</div>
                        <div className="text-xs text-gray-500">OCR & intelligent analysis</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-950/30 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🔊</span>
                      <div>
                        <div className="text-sm font-medium text-gray-300">Voice Processing</div>
                        <div className="text-xs text-gray-500">Azure Speech Services</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SaintVision AI Ecosystem */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-3">🏢 SAINTVISION ECOSYSTEM</h4>
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 p-3 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-yellow-400">EbyTech.ai</span>
                    </div>
                    <p className="text-xs text-gray-300">Enterprise & FinTech Automation</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 p-3 rounded-lg border border-green-500/30">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-400">Athen.ai</span>
                    </div>
                    <p className="text-xs text-gray-300">Healthcare & Legacy Planning</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/10 p-3 rounded-lg border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-purple-400">SVTlegal.ai</span>
                    </div>
                    <p className="text-xs text-gray-300">Legal Document Automation</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 p-3 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-blue-400">SVTteach.ai</span>
                    </div>
                    <p className="text-xs text-gray-300">Interactive Education Platform</p>
                  </div>
                </div>
              </div>

              {/* HACP™ Protocol */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-3">🧠 HACP™ PROTOCOL</h4>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-yellow-400">Intelligence Active</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Patent #10,290,222 - Adaptive AI with emotional calibration and intelligent escalation.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-3">⚡ QUICK ACTIONS</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/workstation')}
                    className="w-full p-3 bg-gray-950/30 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span>🛠️</span>
                      <span className="text-sm text-gray-300">Workstation</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => router.push('/connectivity')}
                    className="w-full p-3 bg-gray-950/30 border border-gray-800 hover:border-gray-700 rounded-lg text-left transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span>🔗</span>
                      <span className="text-sm text-gray-300">Connectivity</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-xs text-green-400">●</span>
              </div>
              {tools.slice(0, 4).map(tool => (
                <button
                  key={tool.id}
                  className="w-full p-2 rounded-lg hover:bg-gray-900/50 transition flex justify-center"
                  title={tool.name}
                >
                  <span className="text-lg">{tool.icon}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WarRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <WarRoomContent />
    </Suspense>
  )
}
