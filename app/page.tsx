'use client'

import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AuthModal from '@/components/AuthModal'
import Link from 'next/link'

export default function Home() {
  const supabase = createClient()
  // const router = useRouter()

  const [user, setUser] = useState<null | { id: string; email: string; fullName: string }>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const userMeta = session.user.user_metadata as { full_name?: string }
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: userMeta?.full_name ?? session.user.email ?? 'User',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    getSession()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    // full page reload to clear cached session and state
    window.location.href = '/'
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-6 py-12">
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Intern Tracker</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span>Hi, {user.fullName}</span>
            <Link href="/dashboard">
              <button className="btn">Dashboard</button>
            </Link>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
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
        {!user && <AuthModal />}
      </main>

      <footer className="text-sm text-gray-400">
        © {new Date().getFullYear()} Intern Tracker
      </footer>
    </div>
  )
}
