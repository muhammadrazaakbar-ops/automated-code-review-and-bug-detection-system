import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const installUrl =
    process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ?? "https://github.com/apps/codehawk";

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Start protecting your codebase today
        </h2>
        <p className="mt-4 text-base text-muted">
          Free forever for public repos. One-click install.
        </p>
        <Button asChild variant="brand" size="lg" className="mt-8">
          <Link href={installUrl} target="_blank" rel="noreferrer">
            <Github className="h-5 w-5" />
            Install CodeHawk on GitHub
          </Link>
        </Button>
      </div>
    </section>
  );
}
