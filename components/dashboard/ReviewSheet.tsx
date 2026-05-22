"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface ReviewSheetData {
  id: string;
  repositoryFullName: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  status: string;
  summary: string | null;
  praise: string | null;
  bugs: {
    id: string;
    filename: string;
    line: number;
    severity: string;
    message: string;
    suggestion: string;
  }[];
}

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const severityStyle: Record<string, string> = {
  critical: "bg-danger/20 text-danger",
  high: "bg-orange/20 text-orange",
  medium: "bg-warning/20 text-warning",
  low: "bg-brand/20 text-brand",
};

const statusStyle: Record<string, string> = {
  in_progress: "bg-sky-500/20 text-sky-300",
  completed: "bg-success/20 text-success",
  failed: "bg-danger/20 text-danger",
};

export default function ReviewSheet({ review }: { review: ReviewSheetData }) {
  const bugs = [...review.bugs].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto">
        <SheetHeader className="border-b border-white/10">
          <SheetTitle className="text-xl font-semibold">
            {review.prTitle}
          </SheetTitle>
          <SheetDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge variant="outline">{review.repositoryFullName}</Badge>
              <Badge variant="outline">PR #{review.prNumber}</Badge>
              <Badge className={statusStyle[review.status] ?? "bg-white/10"}>
                {review.status.replace("_", " ")}
              </Badge>
            </div>
          </SheetDescription>
          <Button asChild variant="outline" size="sm" className="mt-4 w-fit">
            <Link href={review.prUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </SheetHeader>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            <div className="mt-2 border-l-2 border-brand pl-3 text-sm text-muted italic">
              {review.summary ?? "No summary available yet."}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Issues</h3>
            {bugs.length === 0 ? (
              <p className="mt-2 text-sm text-success">No issues found.</p>
            ) : (
              <div className="mt-3 space-y-4">
                {bugs.map((bug) => (
                  <div
                    key={bug.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={severityStyle[bug.severity] ?? "bg-white/10"}>
                        {bug.severity}
                      </Badge>
                      <span className="text-xs font-mono text-muted">
                        {bug.filename}:{bug.line}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {bug.message}
                    </p>
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value={`suggestion-${bug.id}`}>
                        <AccordionTrigger>Suggestion</AccordionTrigger>
                        <AccordionContent>{bug.suggestion}</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              What was done well
            </h3>
            <p className="mt-2 text-sm text-muted">
              {review.praise ?? "No praise available yet."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
