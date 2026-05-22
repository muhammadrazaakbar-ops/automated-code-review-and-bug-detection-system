import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { getHasUnread } from "@/app/dashboard/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const hasUnread = await getHasUnread(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        user={{
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
      />
      <div className="md:pl-60">
        <Header username={user.username} hasUnread={hasUnread} />
        <main className="px-6 pb-16">{children}</main>
      </div>
    </div>
  );
}