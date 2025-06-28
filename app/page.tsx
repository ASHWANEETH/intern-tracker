"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import FooterWithModals from "@/components/Footer";
// import dynamic from "next/dynamic";
import { Moon, Sun } from "lucide-react";
import ScrambledText from "@/components/reactbits/ScrambledText";
import SplitText from "@/components/reactbits/SplitText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ClickSpark from "@/components/reactbits/ClickSpark";

// Dynamically import AOS only on client side
const loadAOS = async () => {
  const AOS = (await import("aos")).default;
  import("aos/dist/aos.css");
  AOS.init({ once: true, duration: 800, easing: "ease-out-cubic" });
};

const supabase = createClient();
const handleAnimationComplete = () => console.log("All letters have animated!");

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);

  const [isDark, setIsDark] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // to avoid hydration mismatch

  // Theme Initialization
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark = theme === "dark" || (!theme && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
    setHasMounted(true); // mark that client rendered
    loadAOS(); // lazy load AOS only on client
  }, []);

  // Theme Toggle Handler
  const handleThemeToggle = useCallback(() => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }, [isDark]);

  // Auth Listener
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
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? "",
              full_name: session.user.user_metadata?.full_name,
            }
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // Prevent hydration mismatch
  if (!hasMounted) return null;

  return (
    <ClickSpark
      sparkColor={isDark ? "#fff" : "#000"}
      sparkSize={5}
      sparkRadius={10}
      sparkCount={7}
      duration={400}
    >
      <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 select-none">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0d0d0d]/80 backdrop-blur-md py-3 px-4 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Image
              src={isDark ? "/logod.svg" : "/logo.svg"}
              alt="Intern Tracker Logo"
              width={48}
              height={48}
              priority
              className="sm:w-8 sm:h-10 w-10 h-10 pb-2"
            />
            <h1 className="text-1xl sm:text-xl font-semibold tracking-tight">
              Intern Tracker
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            <button
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={handleThemeToggle}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                <span className="text-sm sm:text-base font-medium">
                  Hello {user.full_name ?? user.email}!
                </span>
                <Button onClick={() => router.push("/dashboard")} size="sm">
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <span className="font-medium text-sm sm:text-base">
                  Hey Buddy!
                </span>

                <AuthModal />
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col md:flex-row items-center justify-center gap-10 py-12 md:px-2 sm:py-14 md:py-16 w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 max-w-lg">
            <ScrambledText className="text-5xl font-bold leading-tight dark:text-white">
              Track your <br /> Applications <br /> with ease.
            </ScrambledText>
            <p className="text-gray-600 dark:text-gray-300 text-xl">
              Stay organized, reduce stress and land the perfect role.
            </p>
          </div>
          <div className="hidden md:block md:max-w-[340px]">
            <Image
              src="/home.svg"
              alt="Illustration"
              width={340}
              height={340}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </main>

        {/* Features */}
        <section className="w-full py-8 px-4 text-center">
          <h3 className="text-3xl font-bold mb-8">
            <SplitText
              text="How We Help You ?"
              className="text-2xl font-semibold text-center"
              delay={100}
              duration={0.6}
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </h3>
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {features.map((item, idx) => (
              <SpotlightCard
                key={idx}
                className="rounded-xl py-6 sm:py-8 md:py-10 mx-7 flex flex-col md:flex-row items-center md:text-left shadow-xl dark:shadow-gray-900 hover:scale-[1.01] transition"
                spotlightColor="rgba(139, 92, 246, 0.2)"
              >
                <div className="w-[140px] h-[140px] mb-6 md:mb-0 md:mx-8 flex items-center justify-center">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-2xl font-semibold mb-3 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-base text-black dark:text-gray-300">
                    {item.desc}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="w-full max-w-xl text-center my-12 px-4">
          <h3 className="text-xl font-semibold mb-3">Ping Us Anytime!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            If something breaks, tell us! We’ll fix it faster than a chai break.
            ☕
          </p>
          <p className="text-blue-600 font-medium">
            ✉️{" "}
            <a
              href="mailto:report.interntracker@gmail.com"
              className="underline"
            >
              report.interntracker@gmail.com
            </a>
          </p>
        </section>

        <FooterWithModals />
      </div>
    </ClickSpark>
  );
}

const features = [
  {
    title: "Effortless Tracking",
    desc: "Keep all your internship applications organized in one place and never miss a deadline.",
    img: "/easytrack.svg",
  },
  {
    title: "Stay on Top of Deadlines",
    desc: "Manage upcoming interviews, exams, and application dates with ease.",
    img: "/deadline.svg",
  },
  {
    title: "Analytics & Insights",
    desc: "Get helpful trends and insights on your application journey.",
    img: "/analytics.svg",
  },
  {
    title: "Friendly Reminders",
    desc: "Stay motivated with helpful reminders and an easy-to-use dashboard.",
    img: "/notify.svg",
  },
];
