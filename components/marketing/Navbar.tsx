"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { Github, Menu, X, Feather } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Navbar() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  const handleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const avatarUrl = session?.user?.user_metadata?.avatar_url as string | undefined;

  return (
    <motion.nav
      className={`sticky top-0 z-50 border-b transition ${
        scrolled ? "border-white/10 bg-black/50 backdrop-blur" : "border-transparent"
      }`}
      initial={false}
      animate={reduceMotion ? undefined : { opacity: 1 }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand">
            <Feather className="h-5 w-5" />
          </span>
          <span className="bg-linear-to-r from-brand to-sky-400 bg-clip-text text-lg font-semibold text-transparent">
            CodeHawk
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="h-8 w-8 rounded-full border border-white/10"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/10" />
              )}
              <Button asChild variant="brand" size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              className="border-border text-foreground hover:border-brand hover:bg-brand hover:text-white"
            >
              <Github className="h-4 w-4" />
              Sign in with GitHub
            </Button>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="border-t border-white/10 bg-black/70 px-6 py-4 backdrop-blur md:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            {session ? (
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                )}
                <Button asChild variant="brand" size="sm" className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
                className="w-full border-border text-foreground hover:border-brand hover:bg-brand hover:text-white"
              >
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
