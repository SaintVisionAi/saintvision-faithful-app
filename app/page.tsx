'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to splash page immediately
    router.push('/splash')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-yellow-500">Redirecting to SAINTVISIONAI...</p>
      </div>
    </div>
  )
}