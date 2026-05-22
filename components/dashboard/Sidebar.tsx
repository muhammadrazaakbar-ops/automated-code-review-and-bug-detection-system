"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  GitPullRequest,
  FolderGit2,
  BarChart3,
  Settings,
  Menu,
  Feather,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface DashboardUser {
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, section: "overview" },
  {
    label: "Reviews",
    href: "/dashboard?section=reviews",
    icon: GitPullRequest,
    section: "reviews",
  },
  {
    label: "Repositories",
    href: "/dashboard?section=repositories",
    icon: FolderGit2,
    section: "repositories",
  },
  {
    label: "Analytics",
    href: "/dashboard?section=analytics",
    icon: BarChart3,
    section: "analytics",
    disabled: true,
  },
  {
    label: "Settings",
    href: "/dashboard?section=settings",
    icon: Settings,
    section: "settings",
  },
];

export default function Sidebar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("section") ?? "overview";
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const renderNav = (withClose: boolean) => (
    <nav className="mt-8 flex flex-1 flex-col gap-2 px-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === "/dashboard" && currentSection === item.section && !item.disabled;
        const content = (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition",
              isActive && "bg-brand/10 text-foreground",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.disabled && (
              <Badge variant="outline" className="ml-auto text-[10px]">
                Soon
              </Badge>
            )}
          </div>
        );

        if (item.disabled) {
          return (
            <div key={item.label} aria-disabled>
              {content}
            </div>
          );
        }

        const link = (
          <Link key={item.label} href={item.href}>
            {content}
          </Link>
        );

        return withClose ? <SheetClose asChild key={item.label}>{link}</SheetClose> : link;
      })}
    </nav>
  );

  const avatar = user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt="User avatar"
      className="h-9 w-9 rounded-full border border-white/10"
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-white/10" />
  );

  const footer = (
    <div className="mt-auto border-t border-white/10 px-4 py-4">
      <div className="flex items-center gap-3">
        {avatar}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {user.username}
          </p>
          <p className="truncate text-xs text-muted">{user.email ?? ""}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="mt-4 w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand">
          <Feather className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold">CodeHawk</span>
      </div>
      {renderNav(false)}
      {footer}
    </div>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-border bg-surface/90 backdrop-blur md:block">
        {sidebarContent}
      </aside>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 border border-white/10 bg-surface/80 text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 px-4 pt-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand">
                  <Feather className="h-5 w-5" />
                </span>
                <span className="text-lg font-semibold">CodeHawk</span>
              </div>
              {renderNav(true)}
              {footer}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
