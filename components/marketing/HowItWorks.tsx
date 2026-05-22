"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Download, GitPullRequest, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Download,
    title: "Install the App",
    body: "Add CodeHawk to any GitHub repo in one click. No config files, no CI setup required.",
  },
  {
    icon: GitPullRequest,
    title: "Open a Pull Request",
    body: "Push your code and open a PR like you normally would. CodeHawk wakes up automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Receive AI Review",
    body: "Within seconds, get inline comments, severity ratings, and a full check run inside GitHub.",
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold md:text-4xl">Dead simple setup</h2>
        </div>

        <div ref={ref} className="relative grid gap-6 md:grid-cols-3">
          <div className="absolute left-6 right-6 top-10 hidden border-t border-dashed border-border md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.12, duration: 0.5 }}
              >
                <div className="absolute left-4 top-4 text-2xl font-semibold text-brand/70 font-mono">
                  0{index + 1}
                </div>
                <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
