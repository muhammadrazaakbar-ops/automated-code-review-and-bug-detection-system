"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bug, ShieldAlert, Zap, GitBranch, BarChart3, Layers } from "lucide-react";

const features = [
  {
    icon: Bug,
    title: "Critical Bug Detection",
    body: "Catches crashes, data loss risks, and logic errors before they hit your users.",
    color: "text-danger",
    bg: "bg-danger/15",
  },
  {
    icon: ShieldAlert,
    title: "Security Scanning",
    body: "Identifies exposed secrets, injection vulnerabilities, and insecure patterns automatically.",
    color: "text-warning",
    bg: "bg-warning/15",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    body: "Reviews land in under 30 seconds. No waiting, no blocking momentum.",
    color: "text-brand",
    bg: "bg-brand/15",
  },
  {
    icon: GitBranch,
    title: "Inline Comments",
    body: "Issues are pinned to exact line numbers with collapsible fix suggestions.",
    color: "text-success",
    bg: "bg-success/15",
  },
  {
    icon: BarChart3,
    title: "Review Analytics",
    body: "Track bug trends, severity patterns, and team improvement over time.",
    color: "text-brand",
    bg: "bg-brand/15",
  },
  {
    icon: Layers,
    title: "Multi-Repo Support",
    body: "One installation covers all repos. Manage everything from a single dashboard.",
    color: "text-warning",
    bg: "bg-warning/15",
  },
];

export default function Features() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Everything you need to ship confidently
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${feature.bg}`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
