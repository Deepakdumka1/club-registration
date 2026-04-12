"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, Clock, Search, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventsCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clubs"), (snapshot) => {
      let allEvents: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const clubData = doc.data();
        if (clubData.events && Array.isArray(clubData.events)) {
          clubData.events.forEach((e: any) => {
            allEvents.push({
              ...e,
              clubId: doc.id,
              clubName: clubData.name
            });
          });
        }
      });

      setEvents(allEvents);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to fetch events:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredEvents = events.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.clubName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-2">
            <CalendarIcon className="w-3.5 h-3.5" /> Upcoming Schedule
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Campus Events</h1>
          <p className="text-blue-100 max-w-lg text-sm sm:text-base">Discover workshops, clean drives, meetings, and activities hosted by clubs across the university.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for an event or host club..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm">
          <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Upcoming Events</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">There are no events scheduled or clubs haven't added their activity rosters yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
            This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                      <span className="text-[10px] font-bold uppercase">{event.date?.split(" ")[0] || "TBA"}</span>
                      <span className="text-lg font-bold leading-none">{event.date?.split(" ")[1]?.replace(',', '') || "-"}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {event.clubName}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {event.name || "Untitled Event"}
                  </h3>
                  
                  <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-gray-400" /> {event.time || "Time TBA"}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400" /> {event.location || "Location TBA"}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => toast.success("Added to local calendar!")} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Save Date
                  </button>
                  <Link href={`/student/clubs/${event.clubId}`} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex justify-center items-center gap-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    Club Info <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
