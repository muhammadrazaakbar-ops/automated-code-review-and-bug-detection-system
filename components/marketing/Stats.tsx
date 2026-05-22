"use client";

import * as React from "react";
import { CountUp } from "@/components/ui/count-up";

const stats = [
  { label: "PRs Reviewed", value: 12400 },
  { label: "Bugs Caught", value: 3800 },
  { label: "Critical Issues Flagged", value: 94, suffix: "%" },
  { label: "Average Review Time", value: 30, prefix: "< ", suffix: "s" },
];

export default function Stats() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 border-border md:grid-cols-4 md:divide-x md:divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <p className="text-3xl font-semibold">
                {stat.prefix ?? ""}
                <CountUp value={stat.value} />
                {stat.suffix ?? ""}
              </p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
