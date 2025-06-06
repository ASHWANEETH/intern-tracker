// app/page.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export default function Home() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-6 py-12">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Intern Tracker</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Login / Signup</Button>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">Login or Signup</DialogTitle>
            </DialogHeader>
            {/* Placeholder for auth form */}
            <p className="text-sm text-gray-500">Auth form goes here...</p>
          </DialogContent>
        </Dialog>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center gap-6">
        <h2 className="text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>
        <Button onClick={() => setOpen(true)}>Get Started</Button>
      </main>

      {/* Footer */}
      <footer className="text-sm text-gray-400">
        © {new Date().getFullYear()} Intern Tracker
      </footer>
    </div>
  )
}
