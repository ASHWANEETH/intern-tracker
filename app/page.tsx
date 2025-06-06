'use client'

import AuthModal from '@/components/AuthModal'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-6 py-12">
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Intern Tracker</h1>

        <AuthModal />
      </header>

      <main className="flex-1 flex flex-col justify-center items-center gap-6">
        <h2 className="text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>
        <AuthModal />
      </main>

      <footer className="text-sm text-gray-400">
        © {new Date().getFullYear()} Intern Tracker
      </footer>
    </div>
  )
}
