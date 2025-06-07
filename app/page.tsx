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
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-4 py-5 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center px-2 sm:px-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Intern Tracker Logo"
            width={50}
            height={50}
            priority
            className="sm:w-12 sm:h-12 w-10 h-10"
          />
          <h1 className="text-xl sm:text-2xl tracking-tight text-gray-800">
            Intern Tracker
          </h1>
        </div>

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
            <span className="font-medium text-gray-700 whitespace-nowrap">Hi, {user.full_name ?? user.email}</span>
            <Button onClick={() => router.push('/dashboard')} size="sm">
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <AuthModal />
        )}
      </header>

      <Image
        src="/main.png"
        alt="Yoo bro the image didn't load !! wait"
        width={700}
        height={500}
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
        className="my-5 w-full max-w-4xl h-auto object-contain"
      />

      <main className="flex-1 flex flex-col items-center gap-6 px-2 sm:px-0">
        <h2 className=" text-3xl sm:text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md px-3 sm:px-0">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>

        {user ? (
          <>
            <span className="text-lg font-medium">Hi, {user.full_name ?? user.email} !</span>
            <Button onClick={() => router.push('/dashboard')}>
              Let&apos;s gooo !
            </Button>
          </>
        ) : (
          <AuthModal />
        )}
      </main>

      <footer className="text-sm text-gray-400 mt-8 mb-4">
        © {new Date().getFullYear()} Intern Tracker
      </footer>
    </div>
  )
}
