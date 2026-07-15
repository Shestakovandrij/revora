import { redirect } from "next/navigation";
import { LayoutDashboard, Truck, ShieldCheck, ClipboardList, Star, BarChart3, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashShell, type NavItem } from "@/components/layout/dash-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MODERATOR")) redirect("/login");

  const pending = await prisma.carrier.count({ where: { verificationStatus: "PENDING" } });
  const pendingReviews = await prisma.review.count({ where: { status: "PENDING" } });

  const nav: NavItem[] = [
    { label: "Overview", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Verification", href: "/admin/carriers?tab=pending", icon: <ShieldCheck size={18} />, badge: pending || undefined },
    { label: "Carriers", href: "/admin/carriers", icon: <Truck size={18} /> },
    { label: "Orders", href: "/admin/orders", icon: <ClipboardList size={18} /> },
    { label: "Reviews", href: "/admin/reviews", icon: <Star size={18} />, badge: pendingReviews || undefined },
    { label: "Customers", href: "/admin/customers", icon: <Users size={18} /> },
    { label: "Statistics", href: "/admin/stats", icon: <BarChart3 size={18} /> },
  ];

  return (
    <DashShell session={session} nav={nav} title="Admin Panel">
      {children}
    </DashShell>
  );
}
