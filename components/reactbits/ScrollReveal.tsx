import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  baseOpacity?: number;
  yOffset?: number;
  duration?: number;
  delay?: number;
  triggerStart?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  baseOpacity = 0,
  yOffset = 40,
  duration = 1,
  delay = 0,
  triggerStart = "top 80%",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useLayoutEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current!,
        start: triggerStart,
        toggleActions: "play none none none",
        animation: gsap.fromTo(
          ref.current,
          { opacity: baseOpacity, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: "power3.out",
            onComplete: () => {
              hasAnimated.current = true; // mark as animated
              // force visibility visible so it does not disappear
              gsap.set(ref.current, { clearProps: "all", opacity: 1, y: 0 });
            },
          }
        ),
      });
    }, ref);

    return () => {
      ctx.revert();
    };
  }, [baseOpacity, yOffset, duration, delay, triggerStart]);

  return <div ref={ref}>{children}</div>;
};

export default ScrollReveal;
