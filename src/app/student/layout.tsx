"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Compass, Calendar, User, LogOut, Loader2, Bell } from "lucide-react";

import { NotificationPanel } from "@/components/NotificationPanel";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?role=student");
      } else if (userData && userData.role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user || (userData && userData.role === "admin")) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Explore Clubs", href: "/student/clubs", icon: Compass },
    { name: "My Events", href: "/student/events", icon: Calendar },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Student Portal</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {userData?.name?.split(' ')[0] || "Student"}</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening on campus today.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
              {userData?.name?.charAt(0) || "S"}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

