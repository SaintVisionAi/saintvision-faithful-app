'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Agent {
  id: string
  name: string
  type: string
  mode: string
  modules: string[]
  created: string
  status: 'active' | 'inactive'
}

export default function AgentPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock agent data - in production, fetch from API
    const mockAgent: Agent = {
      id: params.id as string,
      name: 'SAINT DR.™',
      type: 'saint-dr',
      mode: 'execution',
      modules: ['LEGAL', 'FINANCIAL', 'BUSINESS'],
      created: new Date().toISOString(),
      status: 'active'
    }
    
    setTimeout(() => {
      setAgent(mockAgent)
      setLoading(false)
    }, 500)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <button 
            onClick={() => router.push('/companions')}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg"
          >
            Back to Companions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🩺 {agent.name}</h1>
              <p className="text-gray-400 mt-1">Executive AI Agent Preview</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/console?agent=${agent.id}`)}
                className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
              >
                Launch Console
              </button>
              <button
                onClick={() => router.push('/companions')}
                className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Agent Info Card */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Agent Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="capitalize">{agent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className="capitalize">{agent.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`capitalize ${agent.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>{new Date(agent.created).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Intelligence Modules</h2>
              <div className="space-y-2">
                {agent.modules.map(module => {
                  const moduleInfo = {
                    'LEGAL': { icon: '⚖️', name: 'Legal Doctrine' },
                    'FINANCIAL': { icon: '💰', name: 'Financial IQ' },
                    'HEALTH': { icon: '🩺', name: 'Health Patterns' },
                    'BUSINESS': { icon: '📊', name: 'Business Diagnostic' }
                  }[module] || { icon: '🧠', name: module }
                  
                  return (
                    <div key={module} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <span className="text-xl">{moduleInfo.icon}</span>
                      <span>{moduleInfo.name}</span>
                      <span className="ml-auto text-green-400 text-sm">Active</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="bg-gray-900 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Agent Capabilities</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-yellow-400 mb-3">Core Functions</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Executive-level strategic analysis</li>
                <li>• Legal document review and compliance</li>
                <li>• Financial modeling and risk assessment</li>
                <li>• Operational bottleneck identification</li>
                <li>• Business diagnostic and optimization</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-400 mb-3">Communication Style</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {agent.mode === 'ryan' ? (
                  <>
                    <li>• Direct, conversational tone</li>
                    <li>• Business partner perspective</li>
                    <li>• Documents key decisions</li>
                    <li>• Pushes for clarity when needed</li>
                  </>
                ) : (
                  <>
                    <li>• Professional boardroom communication</li>
                    <li>• Strategy and compliance focused</li>
                    <li>• Structured analysis and reports</li>
                    <li>• Executive-appropriate responses</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-yellow-500 text-lg">⚡</span>
              <div>
                <h4 className="font-medium text-yellow-400">Ready to Deploy</h4>
                <p className="text-sm text-gray-400">This agent has been trained for 22+ hours and is production-ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}