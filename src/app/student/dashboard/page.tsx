"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, ChevronRight, Compass, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { userData, user } = useAuth();
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userData || !user) {
      if (!userData) setLoading(false);
      return;
    }

    // Real-time listener for all clubs to derive joined clubs and events
    const unsubClubs = onSnapshot(collection(db, "clubs"), (snapshot) => {
      let joined: any[] = [];
      let events: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Check if user is in joinedClubs array
        if (userData.joinedClubs?.includes(doc.id)) {
          joined.push({ ...data, id: doc.id });
          if (data.events) {
            events = [...events, ...data.events.map((e: any) => ({ ...e, club: data.name }))];
          }
        }
      });
      
      setMyClubs(joined);
      // Sort events by a proper date in real app, here we just slice
      setUpcomingEvents(events.slice(0, 4));
      setLoading(false);
    }, (err) => {
      console.warn("Failed to listen to clubs:", err);
      setLoading(false);
    });

    // Listen to personal applications for notifications
    const q = query(collection(db, "applications"), where("userId", "==", user.uid));
    const unsubApps = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(doc => {
        const data = doc.data();
        const timeStr = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
        return {
          id: doc.id,
          text: `Your request to join ${data.clubName} is ${data.status.toUpperCase()}`,
          time: timeStr,
          type: data.status === "accepted" ? "success" : "info"
        };
      }).sort((a, b) => b.id.localeCompare(a.id)); // Simple sort for newest
      setNotifications(notifs);
    }, (error) => console.log("Silent network error on notifications"));

    return () => {
      unsubClubs();
      unsubApps();
    };
  }, [userData, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Quick Stats / Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between h-40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div>
              <p className="text-white/80 font-medium text-sm">Joined Clubs</p>
              <h3 className="text-4xl font-bold mt-1">{loading ? "-" : myClubs.length}</h3>
            </div>
            <Link href="/student/clubs" className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors z-10">
              Discover more <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40"
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Upcoming Events</p>
              <h3 className="text-4xl font-bold mt-1 text-gray-900 dark:text-white">{loading ? "-" : upcomingEvents.length}</h3>
            </div>
            <button onClick={() => alert('Events module coming soon')} className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors w-max">
              View calendar <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* My Clubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-500" /> My Clubs
            </h2>
            <Link href="/student/clubs" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              See all
            </Link>
          </div>
          
          {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : myClubs.length === 0 ? (
             <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
               <p className="text-gray-500">You haven't joined any clubs yet.</p>
               <Link href="/student/clubs" className="inline-block mt-4 text-blue-600 hover:underline text-sm font-medium">Browse Clubs</Link>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myClubs.map((club) => (
                <Link key={club.id} href={`/student/clubs/${club.id}`}>
                  <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all h-full">
                    <div className="h-24 w-full overflow-hidden">
                      <img src={club.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">{club.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-8">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Updates</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No new notifications.</div>
            ) : notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <p className="text-sm text-gray-900 dark:text-gray-200 mb-1">{notif.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{notif.time}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events Mini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">Your Schedule</h2>
          </div>
          <div className="p-4 space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">No upcoming events.</p>
            ) : upcomingEvents.map((event, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                  <span className="text-xs font-bold uppercase">{event.date?.split(" ")[0]}</span>
                  <span className="text-lg font-bold leading-none">{event.date?.split(" ")[1]?.replace(',', '')}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{event.name}</h4>
                  <p className="text-xs text-gray-500">{event.club} • {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
