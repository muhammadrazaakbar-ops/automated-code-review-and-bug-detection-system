"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "check-run", label: "Check Run" },
  { value: "comments", label: "PR Comments" },
  { value: "dashboard", label: "Dashboard" },
];

export default function Demo() {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = React.useState("check-run");

  return (
    <section id="demo" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold md:text-4xl">See it in action</h2>
        </div>

        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <MockFrame>{renderMock(value)}</MockFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}

function MockFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/80 p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-danger/60" />
        <span className="h-3 w-3 rounded-full bg-warning/60" />
        <span className="h-3 w-3 rounded-full bg-success/60" />
      </div>
      {children}
    </div>
  );
}

function renderMock(value: string) {
  switch (value) {
    case "comments":
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">auth/login.ts</span>
              <span className="text-muted">Line 42</span>
            </div>
            <p className="mt-2 text-sm text-foreground">
              Secret key exposed in client bundle. Move to server-only env.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-danger" /> Critical
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">api/users.ts</span>
              <span className="text-muted">Line 87</span>
            </div>
            <p className="mt-2 text-sm text-foreground">
              Missing input validation. Sanitize payload before database write.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-orange" /> High
            </div>
          </div>
        </div>
      );
    case "dashboard":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Total Reviews
            </p>
            <p className="mt-2 text-2xl font-semibold">12,400</p>
            <p className="mt-2 text-xs text-success">+420 this week</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Bugs Caught
            </p>
            <p className="mt-2 text-2xl font-semibold">3,800</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-danger" /> 90
              <span className="h-2 w-2 rounded-full bg-orange" /> 210
              <span className="h-2 w-2 rounded-full bg-warning" /> 480
            </div>
          </div>
        </div>
      );
    case "check-run":
    default:
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                CodeHawk Check
              </p>
              <p className="text-lg font-semibold">2 issues found</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
              Completed
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span>Critical security issue</span>
              <span className="text-danger">Critical</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span>Input sanitization missing</span>
              <span className="text-orange">High</span>
            </div>
          </div>
        </div>
      );
  }
}
