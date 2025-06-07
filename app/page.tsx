'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AuthModal from '@/components/AuthModal'
import { Button } from '@/components/ui/button'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null)

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: (session.user.user_metadata as { full_name?: string })?.full_name,
        })
      } else {
        setUser(null)
      }
    }

    getSession()

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getSession()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-6 py-12">
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Intern Tracker</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">Hi, {user.full_name ?? user.email}</span>
            <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <AuthModal />
        )}
      </header>

      <main className="flex-1 flex flex-col justify-center items-center gap-6">
        <h2 className="text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>

        {user ? (
          <>
            <span className="text-lg font-medium">Hi, {user.full_name ?? user.email}</span>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </>
        ) : (
          <AuthModal />
        )}
      </main>

      <footer className="text-sm text-gray-400">© {new Date().getFullYear()} Intern Tracker</footer>
    </div>
  )
}
