import { redirect } from "next/navigation";
import { ClipboardList, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { DashShell, type NavItem } from "@/components/layout/dash-shell";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/login");

  const nav: NavItem[] = [
    { label: "My Orders", href: "/account", icon: <ClipboardList size={18} /> },
    { label: "Profile", href: "/account/profile", icon: <User size={18} /> },
  ];

  return (
    <DashShell session={session} nav={nav} title="My Account">
      {children}
    </DashShell>
  );
}
