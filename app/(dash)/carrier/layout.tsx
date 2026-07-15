import { redirect } from "next/navigation";
import {
  LayoutDashboard, Inbox, CalendarClock, CheckCircle2, Star,
  User, Truck, FileText, PoundSterling, CalendarDays,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashShell, type NavItem } from "@/components/layout/dash-shell";

export default async function CarrierLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CARRIER") redirect("/login");

  const carrier = await prisma.carrier.findUnique({ where: { userId: session.sub } });
  const newCount = carrier
    ? await prisma.order.count({ where: { carrierId: carrier.id, status: "NEW" } })
    : 0;

  const nav: NavItem[] = [
    { label: "Dashboard", href: "/carrier", icon: <LayoutDashboard size={18} /> },
    { label: "New Bookings", href: "/carrier/jobs?tab=new", icon: <Inbox size={18} />, badge: newCount || undefined },
    { label: "Upcoming Jobs", href: "/carrier/jobs?tab=upcoming", icon: <CalendarClock size={18} /> },
    { label: "Completed", href: "/carrier/jobs?tab=completed", icon: <CheckCircle2 size={18} /> },
    { label: "Reviews", href: "/carrier/reviews", icon: <Star size={18} /> },
    { label: "Profile", href: "/carrier/profile", icon: <User size={18} /> },
    { label: "Vehicles", href: "/carrier/vehicles", icon: <Truck size={18} /> },
    { label: "Documents", href: "/carrier/documents", icon: <FileText size={18} /> },
    { label: "Pricing", href: "/carrier/pricing", icon: <PoundSterling size={18} /> },
    { label: "Calendar", href: "/carrier/calendar", icon: <CalendarDays size={18} /> },
  ];

  return (
    <DashShell session={session} nav={nav} title="Carrier Dashboard">
      {children}
    </DashShell>
  );
}
