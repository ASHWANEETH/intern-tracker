'use client'

import { useState } from 'react'

export default function Footer({
  renderTriggerLinks,
  showFullFooter = true,
}: {
  renderTriggerLinks?: ({
    setShowPrivacyModal,
    setShowTermsModal,
    setShowAboutModal,
  }: {
    setShowPrivacyModal: (val: boolean) => void
    setShowTermsModal: (val: boolean) => void
    setShowAboutModal: (val: boolean) => void
  }) => React.ReactNode
  showFullFooter?: boolean
}) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

  function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null

    const handleBackgroundClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    }

    return (
      <div
        onClick={handleBackgroundClick}
        className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
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
  <>
      {renderTriggerLinks?.({
        setShowPrivacyModal,
        setShowTermsModal,
        setShowAboutModal,
      })}

      {showFullFooter && (
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
      )}

      <Modal
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
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

      <Modal
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
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
          We might tweak stuff here and there (like UI improvements or adding unicorn mode 🦄). We’ll try to let you know.<br /><br />
        </p>
      </Modal>

      <Modal
        open={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About Us❌ Me✔️"
      >
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
    </>
  )
}
