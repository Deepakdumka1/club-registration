"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <header className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            ClubSync
          </span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            About
          </Link>
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
            <ThemeToggle />
            <Link 
              href="/login?role=student" 
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Student Login
            </Link>
            <Link 
              href="/login?role=admin" 
              className="text-sm font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Admin Portal
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 border border-blue-100 dark:border-blue-800/50">
            <Zap className="w-4 h-4" />
            <span>The ultimate club management platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
            Manage your campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              communities effortlessly.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A real-time, unified platform for students to discover clubs and for admins to manage members, events, and announcements with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login?role=student"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all"
            >
              Join a Club <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login?role=admin"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-semibold text-lg flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              Admin Access
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-4"
        >
          {[
            {
              icon: <Users className="w-6 h-6 text-blue-500" />,
              title: "Student Portal",
              desc: "Discover clubs, register for events, and get real-time notifications about campus life."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
              title: "Admin Dashboard",
              desc: "Effortlessly manage applications, members, and announcements in one unified workspace."
            },
            {
              icon: <Zap className="w-6 h-6 text-amber-500" />,
              title: "Real-Time Sync",
              desc: "Powered by Firebase, updates happen instantly. No refreshing required."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
