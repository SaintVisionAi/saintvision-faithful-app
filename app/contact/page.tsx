'use client'

import { useState } from 'react'
import Image from 'next/image'
import Header from '@/components/layout/Header'

const INQUIRY_TYPES = [
  { value: 'sales', label: 'Sales & Pricing', icon: '💰' },
  { value: 'technical', label: 'Technical Support', icon: '⚙️' },
  { value: 'gohighlevel', label: 'GoHighLevel Integration', icon: '🔗' },
  { value: 'enterprise', label: 'Enterprise Solutions', icon: '🏢' },
  { value: 'partnership', label: 'Partnership Opportunities', icon: '🤝' },
  { value: 'general', label: 'General Inquiry', icon: '💬' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [showResponse, setShowResponse] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/helpdesk/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setResponse(data.sal_response)
        setShowResponse(true)
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      setResponse(`I apologize, but there was an error processing your request: ${error.message}. Please try again or contact us directly.`)
      setShowResponse(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/logos/SVTLOGO.png"
                alt="Contact SAINTVISIONAI"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-light text-white mb-4">
              Contact SAL Assistant
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get personalized assistance from SAL for sales inquiries, technical support, 
              GoHighLevel integration, and business growth strategies.
            </p>
          </div>

          {!showResponse ? (
            // Contact Form
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    What can SAL help you with?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INQUIRY_TYPES.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition ${
                          formData.inquiryType === type.value
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="inquiryType"
                          value={type.value}
                          checked={formData.inquiryType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-white font-medium mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-white font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                      placeholder="Brief subject line"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                    placeholder="Please describe your inquiry in detail. Include any specific requirements, goals, or questions you have about SAINTVISIONAI, pricing, GoHighLevel integration, or technical implementation."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.email || !formData.message}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded-lg transition disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>SAL is processing...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Get Response from SAL</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // SAL Response
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="text-yellow-500 font-bold">SAL</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Response from SAL Assistant</h3>
                    <p className="text-sm text-green-400">Powered by SAINTVISIONAI HACP™ Protocol</p>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                    {response}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowResponse(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Submit Another Inquiry
                </button>
                <a
                  href="/helpdesk"
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition"
                >
                  Continue Chat with SAL
                </a>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-900/30 rounded-lg">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-semibold mb-2">Instant Response</h3>
              <p className="text-sm text-gray-400">
                SAL provides immediate, personalized responses to your inquiries
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/30 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-2">Expert Knowledge</h3>
              <p className="text-sm text-gray-400">
                Deep expertise in sales, GHL integration, and technical implementation
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-900/30 rounded-lg">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-white font-semibold mb-2">Growth Focused</h3>
              <p className="text-sm text-gray-400">
                Every response is designed to help grow and optimize your business
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}