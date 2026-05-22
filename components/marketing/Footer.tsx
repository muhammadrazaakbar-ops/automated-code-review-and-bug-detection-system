import Link from "next/link";
import { Feather, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand">
            <Feather className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">CodeHawk</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="#">Docs</Link>
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </Link>
          <Link href="#">Privacy</Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Heart className="h-4 w-4 text-brand" />
          Built with care and AI
        </div>
      </div>
    </footer>
  );
}
