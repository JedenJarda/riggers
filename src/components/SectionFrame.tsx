"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Shared scroll-reveal frame for main page sections.
 * Fades + slides in from below the first time the section enters the
 * viewport. Children stagger themselves if they want finer choreography.
 */
export function SectionFrame({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative w-full ${className}`}
    >
      {children}
    </motion.section>
  );
}

/** Small violet tracker eyebrow shared by all sections. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="h-px w-12 bg-neon-400" />
      <span className="text-xs font-medium uppercase tracking-[0.32em] text-neon-300">
        {children}
      </span>
    </div>
  );
}
