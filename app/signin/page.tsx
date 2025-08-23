'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignInPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      if (isSignUp) {
        // Sign Up
        if (!email || !password || !fullName) {
          setMessage('Email, password, and full name are required')
          setMessageType('error')
          return
        }

        const response = await fetch('/api/auth/production-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName,
            phoneNumber,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage(data.message)
          setMessageType('success')
          // Switch to sign in mode after successful signup
          setTimeout(() => {
            setIsSignUp(false)
            setMessage('Please sign in with your new account')
            setMessageType('success')
          }, 3000)
        } else {
          setMessage(data.error)
          setMessageType('error')
        }
      } else {
        // Sign In
        if (!email || !password) {
          setMessage('Email and password are required')
          setMessageType('error')
          return
        }

        const response = await fetch('/api/auth/production-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage('Sign in successful! Redirecting...')
          setMessageType('success')
          
          // Store session data in localStorage
          localStorage.setItem('supabase_session', JSON.stringify(data.session))
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          // Redirect to PRO dashboard
          setTimeout(() => {
            router.push('/pro')
          }, 1500)
        } else {
          setMessage(data.error)
          setMessageType('error')
        }
      }
    } catch (error: any) {
      setMessage(`Network error: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    }
    return digits
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        {/* Background with Welcome */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/backgrounds/Welcomeonin.png"
            alt="Welcome"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent" />
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/logos/SVTLOGO.png"
              alt="SAINT VISION"
              width={80}
              height={80}
              className="mx-auto mb-6 object-contain"
            />
            <h1 className="text-3xl font-light tracking-wider text-white mb-2">
              SaintVisionAI™
            </h1>
            <p className="text-sm text-gray-500 tracking-wider">
              Powered by: SaintSal
            </p>
          </div>

          {/* Form Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-light text-white mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Join the future of AI connection' : 'Sign in to your HACP™ account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none backdrop-blur-sm transition"
                required={isSignUp}
              />
            )}
            
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none backdrop-blur-sm transition"
              required
            />

            {isSignUp && (
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none backdrop-blur-sm transition"
                maxLength={14}
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none backdrop-blur-sm transition"
              required
            />

            {isSignUp && (
              <div className="text-xs text-gray-400 bg-gray-900/30 p-3 rounded-lg">
                <p className="mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Use a unique password (not common/weak)</li>
                  <li>Mix of letters, numbers, and symbols recommended</li>
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-400 hover:to-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setMessage('')
                  setEmail('')
                  setPassword('')
                  setFullName('')
                  setPhoneNumber('')
                }}
                className="ml-2 text-yellow-500 hover:text-yellow-400 transition"
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-900/50 text-green-300 border border-green-500/20' 
                : 'bg-red-900/50 text-red-300 border border-red-500/20'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-xs text-gray-500">OR</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Social Sign In */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition flex items-center justify-center space-x-3 backdrop-blur-sm">
              <span>🔷</span>
              <span className="font-light">Continue with Google</span>
            </button>
            
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition flex items-center justify-center space-x-3 backdrop-blur-sm">
              <span>Ⓜ️</span>
              <span className="font-light">Continue with Microsoft</span>
            </button>
            
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition flex items-center justify-center space-x-3 backdrop-blur-sm">
              <span>🍎</span>
              <span className="font-light">Continue with Apple</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - HACP Explanation */}
      <div className="hidden lg:flex flex-1 items-center justify-center px-8 bg-gradient-to-l from-yellow-900/5 to-transparent">
        <div className="max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-6">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs tracking-wider text-yellow-500">HACP™ ACTIVE</span>
            </div>
            
            <h2 className="text-4xl font-light text-white mb-4">
              Welcome to the future of
              <span className="block text-yellow-500">Human-AI Connection</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { icon: '🔐', title: 'Protected Intelligence', desc: 'HACP™ protocol ensures your data and interactions remain secure, private, and under your control.' },
              { icon: '🧠', title: 'Dual AI Processing', desc: 'GPT-5 and Claude Opus work together, giving you unprecedented analytical power.' },
              { icon: '⚡', title: 'Instant Deployment', desc: 'From sign-up to full productivity in minutes. No setup, no learning curve.' },
              { icon: '🚀', title: 'Scale Without Limits', desc: 'Whether you\'re a solo founder or Fortune 500, SAINT SAL adapts and grows with you.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-yellow-500">{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-light mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}