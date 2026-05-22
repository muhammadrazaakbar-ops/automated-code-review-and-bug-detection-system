import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  username: string;
  hasUnread: boolean;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Header({ username, hasUnread }: HeaderProps) {
  const installUrl =
    process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ?? "https://github.com/apps/codehawk";

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-surface/60 px-6 py-6 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-muted">Dashboard</p>
        <h1 className="text-2xl font-semibold">
          {getGreeting()}, {username}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-full border border-white/10 bg-white/5 p-2 text-foreground">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
          )}
        </button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-brand/40 text-brand hover:border-brand hover:bg-brand/10"
        >
          <Link href={installUrl} target="_blank" rel="noreferrer">
            <Plus className="h-4 w-4" />
            Add Repository
          </Link>
        </Button>
      </div>
    </header>
  );
}
