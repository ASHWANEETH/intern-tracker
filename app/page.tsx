"use client";

declare module "aos";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import FooterWithModals from "@/components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import ScrambledText from "@/components/reactbits/ScrambledText";
import SplitText from "@/components/reactbits/SplitText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ScrollReveal from "@/components/reactbits/ScrollReveal";

const supabase = createClient();
const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);

  useEffect(() => {
    AOS.init({
      once: true, // run only once per element
      duration: 800,
      easing: "ease-out-cubic",
    });
  }, []);
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between text-center px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md py-3 px-4 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Image
            src="/logo.svg"
            alt="Intern Tracker Logo"
            width={48}
            height={48}
            priority
            className="sm:w-10 sm:h-10 w-10 h-10"
          />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-800">
            Intern Tracker
          </h1>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-4 text-sm sm:text-base">
            <span className="font-medium text-gray-700">
              Hello {user.full_name ?? user.email} !
            </span>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button onClick={() => router.push("/dashboard")} size="sm">
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-4">
            <span className="font-medium text-gray-700">Hey Buddy !</span>
            <AuthModal />
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex flex-col md:flex-row items-center justify-center gap-12 px-4 sm:px-8 md:px-10 py-10 w-full max-w-6xl mx-auto">
        {/* Text */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 max-w-lg">
          <ScrambledText
            className="text-5xl sm:text-4xl md:text-4xl lg:text-6xl font-bold leading-tight text-gray-900"
            radius={30}
            duration={1}
            speed={0.5}
            scrambleChars=".:"
          >
            Track your <br />
            Applications <br /> with ease.
          </ScrambledText>

          <p className="text-gray-600 text-1xl sm:text-xl md:text-xl font-mono">
            stay organized, reduce stress and land the perfect role.
          </p>
        </div>

        {/* Image */}
        <div className="hidden md:block flex-shrink-0 md:max-w-[320px] lg:max-w-[340px]">
          <Image
            src="/home.svg"
            alt="Intern Tracker illustration"
            width={340}
            height={340}
            priority
            sizes="(max-width: 1024px) 30vw, 340px"
            className="w-full h-auto object-contain"
          />
        </div>
      </main>

      <section className="w-full py-8 px-4 text-center">
        <h3 className="text-3xl font-bold mb-8">
          <SplitText
            text="How We Help You ?"
            className="font-mono text-2xl font-semibold text-center"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </h3>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {[
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
          ].map((item, idx) => (
            <ScrollReveal key={idx}>
              <SpotlightCard
                className={`custom-spotlight-card rounded-xl p-8 mx-7 flex flex-col md:flex-row items-center md:text-left shadow-xl hover:scale-[1.01] hover:shadow-2xl`}
                spotlightColor="rgba(139, 92, 246, 0.25)"
              >
                {/* Icon wrapper */}
                <div className="w-[140px] h-[140px] flex-shrink-0 mb-6 md:mb-0 md:mx-8 flex items-center justify-center">
                  <Image
                    src={item.img}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>

                {/* Text content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-2xl font-mono text-black font-semibold mb-3">
                    {item.title}
                  </h4>
                  <p className="text-black text-base font-mono">{item.desc}</p>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-xl text-center my-12 px-4">
        <h3 className="text-xl font-semibold mb-3">Ping Us Anytime !</h3>
        <p className="text-gray-600 mb-2">
          If something breaks, tell us! We’ll fix it faster than a chai break.
          ☕
        </p>
        <p className="text-blue-600 font-medium">
          ✉️{" "}
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
                Got a few extra seconds? Have a laugh (or a cry) reading our{" "}
              </span>
              <button
                className="underline text-blue-500"
                onClick={() => setShowAboutModal(true)}
              >
                About Us
              </button>
              ,{" "}
              <button
                className="underline text-blue-500"
                onClick={() => setShowPrivacyModal(true)}
              >
                Privacy Policy
              </button>
              , and{" "}
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

      {/* Footer */}
      <FooterWithModals />
    </div>
  );
}
