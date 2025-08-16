'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CompanionPricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const pricingTiers = [
    {
      id: 'free',
      name: 'Free Tier',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out AI companions',
      features: [
        'GPT-4o solo companion',
        '1 task per thread',
        'Session-only memory',
        'Basic chat interface',
        'Community support'
      ],
      limitations: [
        'No CRM integration',
        'No voice capabilities',
        'No escalation support',
        'Limited to 50 messages/day'
      ],
      cta: 'Start Free',
      popular: false,
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 97, yearly: 970 },
      description: 'Full-featured AI companion for professionals',
      features: [
        'Dual GPT-5 + Azure AI engine',
        'Voice + text communication',
        'CRM & GHL integration',
        'Legal & cognitive tools',
        'Persistent memory (Supabase)',
        'Custom knowledge upload',
        'Scheduling & automation',
        'Pricing/quote builder',
        'Document review (OCR)',
        'Compliance tracking',
        'SuperSal helpdesk support'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'yellow'
    },
    {
      id: 'addon',
      name: 'Add-On Agent',
      price: { monthly: 47, yearly: 470 },
      description: 'Additional companion for existing Pro users',
      features: [
        'Full Pro capabilities',
        'Scoped + saved memory',
        'Specialized skillset',
        'Independent configuration',
        'SuperSal helpdesk support'
      ],
      limitations: [
        'Requires active Pro subscription'
      ],
      cta: 'Add Companion',
      popular: false,
      color: 'blue'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 297, yearly: 2970 },
      description: 'Complete AI ecosystem for organizations',
      features: [
        '5 full Pro accounts included',
        'Unlimited add-on agents',
        'Full memory persistence',
        'Custom AI model training',
        'White-label options',
        'Advanced analytics',
        'Priority SuperSal support',
        'Custom integrations',
        'SLA guarantees',
        'Dedicated success manager'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    },
    {
      id: 'whitelabel',
      name: 'White Label',
      price: { monthly: 497, yearly: 4970 },
      description: 'Resell AI companions under your brand',
      features: [
        '10 agents included',
        'Complete branding control',
        'Reseller portal access',
        'Revenue sharing program',
        'Custom domain support',
        'API white-labeling',
        'Partner training',
        'Marketing materials',
        'Technical support',
        'Dedicated partner manager'
      ],
      limitations: [],
      cta: 'Apply for Partnership',
      popular: false,
      color: 'green'
    }
  ]

  const getDiscountPercent = () => {
    return Math.round(((12 - 10) / 12) * 100) // 2 months free = ~17% off
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                AI Companion
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Intelligence Tiers
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              SAINTSAL™ intelligent agents powered by HACP™ protocol. 
              Choose the perfect tier for your AI companion needs.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 bg-gray-700 rounded-full transition"
              >
                <div className={`absolute top-1 w-4 h-4 bg-yellow-500 rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Save {getDiscountPercent()}%
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-lg border-2 p-6 ${
                    tier.popular 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-gray-800 bg-gray-900'
                  } ${tier.id === 'free' ? 'lg:col-span-1' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ${tier.price[billingCycle]}
                      </span>
                      {tier.price[billingCycle] > 0 && (
                        <span className="text-gray-400">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{tier.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Included Features</h4>
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <span className="text-green-400 mr-2 flex-shrink-0">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {tier.limitations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">⚠ Limitations</h4>
                        <ul className="space-y-2">
                          {tier.limitations.map((limitation, index) => (
                            <li key={index} className="text-sm text-gray-500 flex items-start">
                              <span className="text-gray-600 mr-2 flex-shrink-0">•</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (tier.id === 'free') {
                        router.push('/companions/create')
                      } else if (tier.id === 'enterprise' || tier.id === 'whitelabel') {
                        router.push('/contact/sales')
                      } else {
                        router.push(`/signup?tier=${tier.id}`)
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                      tier.popular
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                        : tier.color === 'gray'
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : tier.color === 'blue'
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : tier.color === 'purple'
                        ? 'bg-purple-600 text-white hover:bg-purple-500'
                        : 'bg-green-600 text-white hover:bg-green-500'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 px-6 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4">Features</th>
                    <th className="text-center py-4">Free</th>
                    <th className="text-center py-4">Pro</th>
                    <th className="text-center py-4">Add-On</th>
                    <th className="text-center py-4">Enterprise</th>
                    <th className="text-center py-4">White Label</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { feature: 'AI Model', free: 'GPT-4o', pro: 'GPT-5 + Azure', addon: 'GPT-5 + Azure', enterprise: 'GPT-5 + Azure + Custom', whitelabel: 'GPT-5 + Azure + Custom' },
                    { feature: 'Voice Communication', free: '❌', pro: '✅', addon: '✅', enterprise: '✅', whitelabel: '✅' },
                    { feature: 'CRM Integration', free: '❌', pro: '✅', addon: '✅', enterprise: '✅', whitelabel: '✅' },
                    { feature: 'Memory Persistence', free: 'Session Only', pro: 'Full', addon: 'Scoped', enterprise: 'Full', whitelabel: 'Full' },
                    { feature: 'Custom Knowledge', free: '❌', pro: '✅', addon: '✅', enterprise: '✅', whitelabel: '✅' },
                    { feature: 'Document Processing', free: '❌', pro: '✅', addon: '✅', enterprise: '✅', whitelabel: '✅' },
                    { feature: 'Support Level', free: 'Community', pro: 'SuperSal', addon: 'SuperSal', enterprise: 'Priority + Manager', whitelabel: 'Partner Support' },
                    { feature: 'API Access', free: '❌', pro: 'Limited', addon: 'Limited', enterprise: 'Full', whitelabel: 'White-label' },
                    { feature: 'Custom Branding', free: '❌', pro: '❌', addon: '❌', enterprise: 'Limited', whitelabel: '✅' },
                    { feature: 'Reseller Rights', free: '❌', pro: '❌', addon: '❌', enterprise: '❌', whitelabel: '✅' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-900">
                      <td className="py-4 font-medium">{row.feature}</td>
                      <td className="text-center py-4 text-gray-400">{row.free}</td>
                      <td className="text-center py-4 text-yellow-400">{row.pro}</td>
                      <td className="text-center py-4 text-blue-400">{row.addon}</td>
                      <td className="text-center py-4 text-purple-400">{row.enterprise}</td>
                      <td className="text-center py-4 text-green-400">{row.whitelabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* HACP Protocol Info */}
        <section className="py-20 px-6 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Powered by <span className="text-yellow-500">HACP™ Protocol</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              All tiers include our patented Human-AI Connection Protocol (US Patent #10,290,222) 
              for intelligent escalation and emotional calibration. No escalations route to humans - 
              SuperSal handles everything 24/7.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="font-semibold mb-2">Emotional Intelligence</h3>
                <p className="text-sm text-gray-400">Adaptive responses based on emotional context</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Smart Escalation</h3>
                <p className="text-sm text-gray-400">Intelligent routing without human intervention</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="font-semibold mb-2">Enterprise Security</h3>
                <p className="text-sm text-gray-400">Bank-grade encryption and compliance</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-t border-gray-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                {
                  q: "Can I upgrade or downgrade my plan anytime?",
                  a: "Yes, you can change your plan anytime. Upgrades take effect immediately, downgrades at the next billing cycle."
                },
                {
                  q: "What happens to my data if I cancel?",
                  a: "Your companion configurations and memory are preserved for 30 days. You can export all data before cancellation."
                },
                {
                  q: "Do you offer custom enterprise solutions?",
                  a: "Yes, we provide custom AI implementations for large organizations. Contact our enterprise team for details."
                },
                {
                  q: "How does the SuperSal helpdesk work?",
                  a: "SuperSal is our AI-powered support system available 24/7. It handles all escalations using HACP™ protocol - no human wait times."
                },
                {
                  q: "Can I use my companion on multiple domains?",
                  a: "Pro+ plans include subdomain hosting. Enterprise and White Label plans support custom domains."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}