"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Megaphone, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminAnnouncements() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
    if (!selectedClub || !title || !content) return toast.error("Please fill all fields.");
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "clubs", selectedClub), {
        announcements: arrayUnion({
          id: Date.now(),
          title,
          content,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          author: "Admin Control"
        })
      });
      toast.success("Announcement broadcasted successfully.");
      setTitle("");
      setContent("");
      setSelectedClub("");
    } catch (err) {
      toast.error("Failed to post announcement.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Broadcast Center</h2>
              <p className="text-white/80">Deploy mass communications directly to club boards.</p>
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Organization</label>
              <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border disabled:opacity-50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white">
                <option value="">-- Select a Club Array --</option>
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Headline</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Mandatory End of Year Review" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message Body</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={5} placeholder="Communicate details here..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white"></textarea>
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Broadcast Communications</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
