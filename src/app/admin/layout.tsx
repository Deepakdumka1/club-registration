"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Megaphone, Calendar, Settings, LogOut, Loader2, ShieldCheck } from "lucide-react";

import { NotificationPanel } from "@/components/NotificationPanel";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?role=admin");
      } else if (userData && userData.role !== "admin") {
        router.push("/student/dashboard");
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || (userData && userData.role !== "admin")) {
    return null; // Will redirect in useEffect
  }

  const navItems = [
    { name: "Command Center", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/admin/applications", icon: Users },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "System Config", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-black">
      {/* Sidebar - Radically distinct dark/modern styling for admins */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-10 shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wide">ADMIN</span>
              <p className="text-xs text-orange-400 font-medium tracking-widest uppercase">Console</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Operations</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-sm font-bold text-white bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
        <header className="flex justify-between items-center px-10 py-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-0">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">System Authority</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All systems operational
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{userData?.name || "Admin User"}</p>
              <p className="text-xs text-orange-500 font-semibold">{userData?.clubName || "Global Security"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-md">
              {userData?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>
        <div className="p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

