'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SuperSalPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Auto-redirect to console with SuperSal agent
    router.push('/console?agent=supersal-production')
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Launching SuperSal...</p>
      </div>
    </div>
  )
}