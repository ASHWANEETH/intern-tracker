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

  // New modal states for footer links
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

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

  // Modal wrapper to handle outside click and close
  function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null

    const handleBackgroundClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    }

    return (
      <div
        onClick={handleBackgroundClick}
        className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
      >
        <div className="bg-white rounded-lg max-w-lg w-full p-6 relative shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-lg font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <div className="text-gray-700 max-h-[60vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-4 py-5 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl mx-auto px-2 sm:px-3 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
          <Image
            src="/logo.svg"
            alt="Intern Tracker Logo"
            width={40}
            height={40}
            priority
            className="sm:w-12 sm:h-12 w-10 h-10"
          />
          <h1 className="text-xl sm:text-2xl tracking-tight text-gray-800 text-center sm:text-left">
            Intern Tracker
          </h1>
        </div>

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
            <span className="font-medium text-gray-700 whitespace-nowrap hidden sm:inline">
              Hello {user.full_name ?? user.email} !
            </span>
            <Button onClick={() => router.push('/dashboard')} size="sm">
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              Hey Buddy ! &nbsp;
              <AuthModal />
            </div>
          </>
        )}
      </header>

      <Image
        src="/main.png"
        alt="Yoo bro the image didn't load !! wait"
        width={600}
        height={500}
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 700px"
        className="my-5 w-full max-w-4xl h-auto object-contain"
      />

      <main className="flex-1 flex flex-col items-center gap-6 px-2 sm:px-0">
        <h2 className="text-3xl sm:text-4xl font-bold max-w-xl leading-tight">
          Track your internship applications with ease.
        </h2>
        <p className="text-gray-600 max-w-md px-3 sm:px-0">
          Intern Tracker helps students stay organized, reduce stress, and land the perfect role.
        </p>

        {user ? (
          <>
            <span className="text-lg font-medium">Hey {user.full_name ?? user.email} !</span>
            <Button onClick={() => router.push('/dashboard')}>
              Let&apos;s gooo !
            </Button>
          </>
        ) : (
          <>
          <AuthModal />
          Let&apos;s gooooo !!
          </>
        )}
      </main>

      
      <section className="w-full py-16 px-4 bg-muted rounded-xl text-center mt-7">
        <h3 className="text-2xl font-semibold mb-3">How We Help You ?</h3>
        <ul className="text-gray-700 space-y-2 text-base">
          <li>✅ Effortless tracking of all your internship applications</li>
          <li>📅 Keep tabs on deadlines, interviews, and follow-ups</li>
          <li>📈 Analytics to help you understand your application trends</li>
          <li>🔒 Secure login and data storage with Supabase</li>
          <li>💬 Friendly reminders and a dashboard built just for students</li>
        </ul>
      </section>
      
      <section className="w-full max-w-xl text-center my-8 px-4">
        <h3 className="text-xl font-semibold mb-2">Ping Us Anytime !</h3>
        <p className="text-gray-600">
          If something breaks, tell us! We’ll fix it faster than a chai break. ☕
        </p>
        <p className="text-blue-600 mt-1 font-medium">
          ✉️ &nbsp; <a href="mailto:ashwaneeth@gmail.com" className="underline">ashwaneeth@gmail.com</a>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Got a few extra seconds? Have a laugh (or a cry) reading our&nbsp;<br />
          <button className="underline text-blue-500" onClick={() => setShowAboutModal(true)}>About Us</button>,&nbsp;
          <button className="underline text-blue-500" onClick={() => setShowPrivacyModal(true)}>Privacy Policy</button>, and&nbsp;
          <button className="underline text-blue-500" onClick={() => setShowTermsModal(true)}>Terms</button>.
        </p>
      </section>
      
      <section id="quotes" className="w-full py-16 px-4 bg-muted rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-6">Student Motivation Corner 🎓😄</h2>
        <ul className="space-y-4 text-lg text-muted-foreground">
          <li>📚 &quot;If you’re going to procrastinate, at least do it with confidence.&quot;</li>
          <li>☕ &quot;Coffee: because adulting is hard and studying is harder.&quot;</li>
          <li>📝 &quot;Study tip: Stand up. Stretch. Take a walk. Go to the airport. Get on a plane. Never return.&quot;</li>
          <li>📖 &quot;I’m not lazy, I’m just in energy-saving mode for finals.&quot;</li>
          <li>🎯 &quot;Some people graduate with honors, I am just honored to graduate.&quot;</li>
        </ul>
      </section>
      <footer className="text-sm text-gray-400 mt-8 mb-4 flex flex-col sm:flex-row justify-center items-center gap-3">
        <span>© {new Date().getFullYear()} Intern Tracker</span>
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="underline hover:text-gray-600"
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setShowTermsModal(true)}
          className="underline hover:text-gray-600"
        >
          Terms of Service 
        </button>
        <button
          onClick={() => setShowAboutModal(true)}
          className="underline hover:text-gray-600"
        >
          About Us
        </button>
      </footer>

      {/* Footer Modals */}
      <Modal open={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
        <p>
          Welcome to Intern Tracker, where your data is safer than your snacks in a locked tiffin box.<br /><br />

          What We Collect:<br />
          Just the basics — your name, email, phone number, and how many times you open the app like a curious squirrel.<br /><br />

          How We Use It:<br />
          We use your info to make things smoother, like butter on toast. No spam, no weird surprises. Pinky promise.<br /><br />

          Who Sees It:<br />
          Only us (and maybe our super-trusted tech buddies like Supabase — but they&apos;re cool, we checked).<br /><br />

          Security Stuff:<br />
          We guard your info like it’s the last slice of pizza at a party. 🔒🍕<br /><br />

          You Control It:<br />
          Want to vanish like a ninja? You can delete your account anytime. No drama, no tears.<br /><br />

        </p>
      </Modal>

      <Modal open={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms of Service">
        <p>
          By using Intern Tracker, you agree to the following terms. Don’t worry, it’s not a trap — just friendly rules:<br /><br />

          Play Nice:<br />
          No funny business. Use the app as intended: track internships, not world domination.<br /><br />

          Your Stuff:<br />
          You own your data. We just borrow it to help you stay organized. Like a helpful roommate who doesn’t eat your fries.<br /><br />
          No Bots Allowed:<br />
          Real humans only. If you’re a robot, please go back to the Matrix.<br /><br />

          Bugs & Glitches:<br />
          If something breaks, tell us! We’ll fix it faster than a chai break.<br /><br />

          We Can Change Things:<br />
          We might tweak stuff here and there (like UI improvements or adding unicorn mode 🦄). We’ll try to let you know.   <br /><br />
        </p>
      </Modal>

      <Modal open={showAboutModal} onClose={() => setShowAboutModal(false)} title="About Us❌  Me✔️">
        <p>
          Hi, I&apos;m just one ambitious human (not a robot… yet 🤖) behind Intern Tracker.<br /><br />
          I built this because keeping track of internships on sticky notes, Excel sheets, and mental Post-its was driving me bonkers.<br /><br />
          So I thought — &quot;Why not build something that doesn’t crash, judge me, or disappear when I close the tab?&quot;<br /><br />

          Thus, Intern Tracker was born 💥<br /><br /><br />
          My goals?<br /><br />

          Help students stay organized<br /><br />

          Look cool doing it<br /><br />

          Maybe impress one HR manager someday 👀<br /><br />

          If it makes your life 1% easier, my job here is done.<br /><br />

          Made with ☕, 💻, and way too many browser tabs.<br /><br />
        </p>
      </Modal>
    </div>
  )
}
