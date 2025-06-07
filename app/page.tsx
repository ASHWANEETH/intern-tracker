'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AuthModal from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const supabase = createClient()

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata?.full_name,
        })
      } else {
        setUser(null)
      }
    }

    getSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata?.full_name,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-6 py-5">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center px-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Intern Tracker Logo"
            width={50}
            height={50}
            priority
          />
          <h1 className={`text-xl tracking-tight text-gray-800`}>
            Intern Tracker
          </h1>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Hi, {user.full_name ?? user.email}</span>
            <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <AuthModal />
        )}
      </header>

          <Image
            src="/main.png" // Replace with your image path
            alt="Yoo bro the image didn't load !! wait"
            width={600}           // Adjust size as needed
            height={400}
            className="my-6"
            priority
          />

      <main className="flex-1 flex flex-col justify-center items-center gap-6">
        <h2 className="text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>

        {user ? (
          <>
            <span className="text-lg font-medium">Hi, {user.full_name ?? user.email} !</span>
            <Button onClick={() => router.push('/dashboard')}>Let&apos;s gooo !</Button>
          </>
        ) : (
          <AuthModal />
        )}
      </main>

      <footer className="text-sm text-gray-400">© {new Date().getFullYear()} Intern Tracker</footer>
    </div>
  )
}
