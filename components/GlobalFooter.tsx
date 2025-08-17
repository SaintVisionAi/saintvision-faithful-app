'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function GlobalFooter() {
  const pathname = usePathname()
  
  if (pathname === '/splash' || pathname.includes('/warroom')) return null

  return (
    <footer className="border-t border-gray-900 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="mb-4 flex items-center space-x-3">
              <Image
                src="/logos/THE BEST MAIN LOGO + COOKIN.png"
                alt="SaintVisionAI"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <div className="text-lg font-light tracking-wider text-white">SAINTVISIONAI</div>
                <div className="text-xs text-gray-600 tracking-widest mt-1">RESPONSIBLE INTELLIGENCE</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 leading-relaxed">
              HACP™ Protocol Protected
              <br />
              Patent #10,290,222
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-widest text-gray-400 mb-4">PLATFORM</h4>
            <div className="space-y-2">
              <a href="/warroom" className="block text-sm text-gray-600 hover:text-white transition">WarRoom</a>
              <a href="/companions" className="block text-sm text-gray-600 hover:text-white transition">AI Agents</a>
              <a href="/workstation" className="block text-sm text-gray-600 hover:text-white transition">Workstation</a>
              <a href="/crm" className="block text-sm text-gray-600 hover:text-white transition">GHL Integration</a>
              <a href="/connectivity" className="block text-sm text-gray-600 hover:text-white transition">Connectivity</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-widest text-gray-400 mb-4">COMPANY</h4>
            <div className="space-y-2">
              <a href="/institute" className="block text-sm text-gray-600 hover:text-white transition">Institute</a>
              <a href="/svg" className="block text-sm text-gray-600 hover:text-white transition">SVG Brokerage</a>
              <a href="/why" className="block text-sm text-gray-600 hover:text-white transition">Why SaintVision</a>
              <a href="/enterprise" className="block text-sm text-gray-600 hover:text-white transition">Enterprise</a>
              <a href="/legal" className="block text-sm text-gray-600 hover:text-white transition">Legal & Compliance</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-widest text-gray-400 mb-4">SUPPORT</h4>
            <div className="space-y-2">
              <a href="/help" className="block text-sm text-gray-600 hover:text-white transition">24/7 Help Desk</a>
              <a href="/pricing/companions" className="block text-sm text-gray-600 hover:text-white transition">Pricing</a>
              <a href="/connectivity" className="block text-sm text-gray-600 hover:text-white transition">System Status</a>
              <div className="mt-4 pt-4 border-t border-gray-900">
                <div className="text-xs text-green-500">● All Systems Operational</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            © 2024 Saint Visions I.P. Holdings, LP. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
