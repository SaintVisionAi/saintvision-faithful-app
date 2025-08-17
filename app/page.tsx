'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'

export default function HomePage() {
  const router = useRouter()

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-8 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/backgrounds/FUTURESV.png"
              alt="Future of Responsible Intelligence"  
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            {/* HACP Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-xs tracking-[0.3em] text-yellow-500 font-medium">HACP™ PROTOCOL ACTIVE</span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Main Logo */}
            <div className="mb-12">
              <Image
                src="/logos/THE BEST MAIN LOGO + COOKIN.png?v=2"
                alt="SAINTVISIONAI"
                width={400}
                height={200}
                className="mx-auto object-contain"
                priority
                unoptimized
              />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8">
              <span className="block text-white">Welcome to</span>
              <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text font-bold">
                SaintVision AI™
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
              Where artificial intelligence meets divine purpose. Experience the future of responsible AI 
              with our patented HACP™ technology and faith-guided innovation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => router.push('/warroom')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition text-lg"
              >
                🚀 Enter WarRoom
              </button>
              <button
                onClick={() => router.push('/why')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition text-lg"
              >
                💡 Learn Why
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 border border-yellow-500/50 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition text-lg"
              >
                🎯 Try Demo
              </button>
            </div>
          </div>
        </section>

        {/* Quick Features */}
        <section className="py-24 px-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gradient-to-b from-yellow-500/10 to-yellow-600/5 rounded-2xl border border-yellow-500/20">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-white mb-4">Patented HACP™</h3>
                <p className="text-gray-400 text-sm">
                  Our Human-AI Connection Protocol (U.S. Patent 10,290,222) provides emotional intelligence and adaptive escalation.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gradient-to-b from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20">
                <div className="text-4xl mb-4">💚</div>
                <h3 className="text-xl font-semibold text-white mb-4">Faith-Guided AI</h3>
                <p className="text-gray-400 text-sm">
                  Technology with purpose. Every feature built with principles of service, integrity, and genuine care.
                </p>
              </div>
              
              <div className="text-center p-8 bg-gradient-to-b from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-white mb-4">Enterprise Ready</h3>
                <p className="text-gray-400 text-sm">
                  GDPR, CCPA, SOC 2 compliant with AES-256 encryption and enterprise-grade security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-normal mb-8">
              Ready to Experience <span className="text-yellow-500">Responsible AI</span>?
            </h2>
            
            <p className="text-lg text-gray-400 mb-12">
              Join thousands who've discovered what happens when technology serves the heart and innovation changes lives.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition"
              >
                🎯 Get Started Free
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
              >
                📊 View Pricing
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}