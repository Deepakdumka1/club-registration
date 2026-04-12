"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Info, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to personal applications for notifications
    const q = query(collection(db, "applications"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: `Your request to join ${data.clubName} is ${data.status.toUpperCase()}`,
          time: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          type: data.status === "accepted" ? "success" : data.status === "rejected" ? "error" : "info",
          status: data.status
        };
      }).sort((a, b) => b.id.localeCompare(a.id));
      setNotifications(notifs);
    });

    // Close panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsub();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => n.status === "pending").length;

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all hover:scale-110 active:scale-95 shadow-sm"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Notifications
                {notifications.length > 0 && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No new updates yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
                        notif.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                        "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      }`}>
                        {notif.type === "success" ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium leading-relaxed">
                          {notif.text}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {notif.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
