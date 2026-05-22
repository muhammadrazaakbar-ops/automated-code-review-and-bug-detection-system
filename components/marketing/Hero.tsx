"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Github, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const installUrl =
    process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ?? "https://github.com/apps/codehawk";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-size-[32px_32px] opacity-40" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-xs font-medium text-brand">
          <ShieldCheck className="h-4 w-4" />
          AI-Powered · Free to Install
        </div>

        <h1 className="text-balance text-4xl font-semibold text-foreground md:text-6xl">
          Catch bugs before
          <span className="block">
            they reach{" "}
            <span className="bg-linear-to-r from-danger to-orange bg-clip-text text-transparent">
              production
            </span>
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-muted md:text-lg">
          CodeHawk reviews every pull request automatically, finding critical
          issues, security flaws, and code smells with AI precision. Install
          once, protect forever.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="brand" size="lg">
            <Link href={installUrl} target="_blank" rel="noreferrer">
              <Github className="h-5 w-5" />
              Install GitHub App
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#demo">See a Demo Review</Link>
          </Button>
        </div>

        <motion.div
          className="relative mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
        >
          <div className="absolute -inset-6 rounded-[28px] border border-brand/30 opacity-30" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Pull Request
                </p>
                <h3 className="text-lg font-semibold">
                  feat: add user authentication
                </h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                Reviewed in 8s
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-surface/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-danger" />
                  CRITICAL
                  <span className="text-muted">auth/login.ts:42</span>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  JWT secret exposed in client bundle.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-surface/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-orange" />
                  HIGH
                  <span className="text-muted">api/users.ts:87</span>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  Missing input sanitization on user updates.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <span>2 issues found</span>
              <span>Inline review comments posted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
