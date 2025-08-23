'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/layout/Header'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

const FAQ_CATEGORIES = [
  {
    title: 'Getting Started',
    questions: [
      {
        q: 'What is SAINTVISIONAI and HACP™?',
        a: 'SAINTVISIONAI is an advanced AI platform powered by the HACP™ (Human-AI Connection Protocol) - US Patent #10,290,222. It combines OpenAI O3, Claude Opus 4, and Azure Speech Services for unprecedented AI processing power.'
      },
      {
        q: 'How do I get started with the platform?',
        a: 'Simply sign up at /signin, choose your pricing tier, and start using our triple-AI system immediately. No setup required - you\'ll have access to GPT-5 and Claude Opus 4 working together.'
      },
      {
        q: 'What makes HACP™ different from other AI platforms?',
        a: 'HACP™ is the only patented Human-AI Connection Protocol that uses multi-tier processing (1-4 tiers) with dual AI systems working simultaneously, plus advanced voice synthesis and real-time conversation capabilities.'
      }
    ]
  },
  {
    title: 'Pricing & Plans',
    questions: [
      {
        q: 'What are the pricing options?',
        a: 'We offer 5 tiers: Free (basic access), Starter ($29/month), Professional ($79/month), White Label ($500/month), and Custom ($2500/month) for enterprise solutions.'
      },
      {
        q: 'Can I upgrade or downgrade my plan?',
        a: 'Yes, you can change your plan anytime. Upgrades are immediate, and downgrades take effect at your next billing cycle.'
      },
      {
        q: 'Do you offer enterprise pricing?',
        a: 'Yes, our Custom tier ($2500/month) includes enterprise features, dedicated support, and unlimited usage. Contact us for volume discounts.'
      }
    ]
  },
  {
    title: 'GoHighLevel Integration',
    questions: [
      {
        q: 'How does SAINTVISIONAI integrate with GoHighLevel?',
        a: 'We offer complete GHL integration including CRM workflows, lead management, SMS/email automation, custom pipelines, webhook integration, and advanced reporting.'
      },
      {
        q: 'Can I use HACP™ with my existing GHL funnels?',
        a: 'Absolutely! Our AI can enhance your existing GHL funnels with intelligent lead scoring, automated follow-ups, and personalized messaging at scale.'
      },
      {
        q: 'What GHL features are supported?',
        a: 'All major GHL features: contacts, opportunities, calendars, workflows, campaigns, reputation management, and custom integrations through our API.'
      }
    ]
  },
  {
    title: 'Technical Support',
    questions: [
      {
        q: 'How do I integrate the API?',
        a: 'Our API documentation is available in your dashboard. We provide SDKs for JavaScript, Python, and REST endpoints with full authentication and examples.'
      },
      {
        q: 'What about data security and privacy?',
        a: 'We use enterprise-grade security with Supabase, row-level security (RLS), encrypted data transmission, and SOC2 compliance. Your data is never shared or used for training.'
      },
      {
        q: 'Can I use RAG with my own data?',
        a: 'Yes! Our Supabase integration supports custom knowledge bases, document upload, and retrieval-augmented generation (RAG) for your specific business needs.'
      }
    ]
  }
]

export default function HelpDeskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m SAL, your AI assistant from SAINTVISIONAI. I\'m here to help with everything - sales questions, technical support, GoHighLevel integration, and growing your firm. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/helpdesk/sal-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: data.timestamp
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I encountered an error: ${error.message}. Please try again or contact support directly.`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFAQClick = async (question: string) => {
    setInputMessage(question)
    await new Promise(resolve => setTimeout(resolve, 100))
    handleSendMessage()
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/logos/SVTLOGO.png"
                alt="SAL Assistant"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-light text-white mb-4">
              SAL Assistant Help Desk
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get expert help with sales, technical support, GoHighLevel integration, and growing your firm. 
              SAL handles everything with SAINTVISIONAI expertise.
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mt-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-yellow-500">SAL Assistant Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-500 font-semibold">SAL</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">SAL Assistant</h3>
                      <p className="text-sm text-green-400">Online • Powered by HACP™</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl px-4 py-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-yellow-500/20 text-white border border-yellow-500/30'
                            : 'bg-gray-800/50 text-gray-100 border border-gray-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-50 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <span className="text-gray-400 ml-2">SAL is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-700">
                  <div className="flex space-x-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask SAL anything about SAINTVISIONAI, pricing, GHL integration, or technical support..."
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !inputMessage.trim()}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium rounded-lg transition disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send • SAL is powered by OpenAI for cost efficiency
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
                <h3 className="text-xl font-light text-white mb-6">Common Questions</h3>
                
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {FAQ_CATEGORIES.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(index)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        selectedCategory === index
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {FAQ_CATEGORIES[selectedCategory].questions.map((faq, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleFAQClick(faq.q)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-800/50 transition"
                      >
                        <p className="font-medium mb-1">{faq.q}</p>
                        <p className="text-sm text-gray-400 line-clamp-2">{faq.a}</p>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Need More Help?</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    SAL can handle complex questions about:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Enterprise sales and pricing</li>
                    <li>• GoHighLevel advanced integration</li>
                    <li>• Custom API development</li>
                    <li>• Supabase RAG implementation</li>
                    <li>• Business growth strategies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}