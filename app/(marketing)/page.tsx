import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import Demo from "@/components/marketing/Demo";
import Stats from "@/components/marketing/Stats";
import CTA from "@/components/marketing/CTA";

export const metadata: Metadata = {
  title: "CodeHawk — AI Code Review for GitHub",
  description:
    "Catch bugs before they reach production with AI-powered pull request reviews.",
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <HowItWorks />
      <Features />
      <Demo />
      <Stats />
      <CTA />
    </div>
  );
}
