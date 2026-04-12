"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, Loader2, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminEvents() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState("");
  const [name, setName] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clubs"), (snap) => {
      setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.warn(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !name || !dateStr || !time || !location) return toast.error("Complete the roster fields.");
    setIsSubmitting(true);
    try {
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      await updateDoc(doc(db, "clubs", selectedClub), {
        events: arrayUnion({
          id: Date.now(),
          name,
          date: formattedDate,
          time,
          location,
          registered: false
        })
      });
      toast.success("Event scheduled on global calendar.");
      setName(""); setDateStr(""); setTime(""); setLocation(""); setSelectedClub("");
    } catch (err) {
      toast.error("Failed to inject event.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Event Roster Injection</h2>
              <p className="text-slate-400">Schedule official campus operations globally.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : (
          <form onSubmit={handlePost} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Host Organization</label>
              <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white">
                <option value="">-- Assign Club Authority --</option>
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Operation Code (Event Name)</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Robotics Exhibition 2026" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date Frame</label>
                <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Timestamp (Time)</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Coordinates (Location)</label>
              <input value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Science Block, Room 402" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-2 transition-all">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Execute Schedule</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
