"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import FooterWithModals from "@/components/Footer";

const supabase = createClient();

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // Modal wrapper to handle outside click and close

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
            <Button onClick={() => router.push("/dashboard")} size="sm">
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
          Intern Tracker helps students stay organized, reduce stress, and land
          the perfect role.
        </p>

        {user ? (
          <>
            <span className="text-lg font-medium">
              Hey {user.full_name ?? user.email} !
            </span>
            <Button onClick={() => router.push("/dashboard")}>
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
          If something breaks, tell us! We’ll fix it faster than a chai break.
          ☕
        </p>
        <p className="text-blue-600 mt-1 font-medium">
          ✉️ &nbsp;{" "}
          <a href="mailto:report.interntracker@gmail.com" className="underline">
            report.interntracker@gmail.com
          </a>
        </p>
        <FooterWithModals
          showFullFooter={false}
          renderTriggerLinks={({
            setShowPrivacyModal,
            setShowTermsModal,
            setShowAboutModal,
          }) => (
            <p className="text-sm text-gray-500 mt-4 text-center">
              <span className="block sm:inline">
                Got a few extra seconds? Have a laugh (or a cry) reading
                our&nbsp;
                <br />
              </span>
              <button
                className="underline text-blue-500"
                onClick={() => setShowAboutModal(true)}
              >
                About Us
              </button>
              ,&nbsp;
              <button
                className="underline text-blue-500"
                onClick={() => setShowPrivacyModal(true)}
              >
                Privacy Policy
              </button>
              , and&nbsp;
              <button
                className="underline text-blue-500"
                onClick={() => setShowTermsModal(true)}
              >
                Terms
              </button>
              .
            </p>
          )}
        />
      </section>

      <section
        id="quotes"
        className="w-full py-16 px-4 bg-muted rounded-xl text-center"
      >
        <h2 className="text-3xl font-bold mb-6">
          Student Motivation Corner 🎓😄
        </h2>
        <ul className="space-y-4 text-lg text-muted-foreground">
          <li>
            📚 &quot;If you’re going to procrastinate, at least do it with
            confidence.&quot;
          </li>
          <li>
            ☕ &quot;Coffee: because adulting is hard and studying is
            harder.&quot;
          </li>
          <li>
            📝 &quot;Study tip: Stand up. Stretch. Take a walk. Go to the
            airport. Get on a plane. Never return.&quot;
          </li>
          <li>
            📖 &quot;I’m not lazy, I’m just in energy-saving mode for
            finals.&quot;
          </li>
          <li>
            🎯 &quot;Some people graduate with honors, I am just honored to
            graduate.&quot;
          </li>
        </ul>
      </section>

      <FooterWithModals />
    </div>
  );
}
