"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Search, Loader2, Filter, FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "applications"), (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      apps.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setApplications(apps);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (appId: string, userId: string, clubId: string, action: "accepted" | "rejected") => {
    try {
      if (action === "accepted") {
        await updateDoc(doc(db, "applications", appId), { status: "accepted" });
        await setDoc(doc(db, "users", userId), { joinedClubs: arrayUnion(clubId) }, { merge: true });
        await updateDoc(doc(db, "clubs", clubId), { members: increment(1) });
        toast.success("Application officially accepted.");
      } else {
        await updateDoc(doc(db, "applications", appId), { status: "rejected" });
        toast.success("Application rejected.");
      }
    } catch (e) {
      toast.error("Process failed.");
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter !== "all" && app.status !== filter) return false;
    if (search && !app.userName?.toLowerCase().includes(search.toLowerCase()) && !app.clubName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Global Applications Ledger</h2>
          <p className="text-gray-500 text-sm">Review incoming comprehensive membership queries.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student or club name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 dark:text-white shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 dark:text-white shadow-sm appearance-none min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <p>No applications match your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredApps.map((app, idx) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={app.id} className="flex flex-col">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border ${app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30' : app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30' : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30'}`}>
                      {app.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{app.userName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300">Target: {app.clubName}</span>
                        <span>•</span>
                        <span>{app.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)} 
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" /> View Form {expandedId === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {app.status === "pending" ? (
                      <>
                        <button onClick={() => handleAction(app.id, app.userId, app.clubId, "accepted")} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => handleAction(app.id, app.userId, app.clubId, "rejected")} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 ${app.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Form Display */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20"
                    >
                      <div className="p-6">
                        {app.answers ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course / Major</h5>
                                <p className="text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">{app.answers.course || "Not provided"}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Student ID</h5>
                                <p className="text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">{app.answers.studentId || "Not provided"}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Portfolio / Drive Link</h5>
                                {app.answers.driveLink ? (
                                  <a href={app.answers.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
                                    <ExternalLink className="w-4 h-4" /> Open Link
                                  </a>
                                ) : (
                                  <p className="text-sm font-medium text-gray-400 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800">No link provided</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reason for joining</h5>
                                <div className="text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 min-h-[80px]">
                                  {app.answers.reason || "No reason provided."}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Past Experience</h5>
                                <div className="text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 min-h-[80px]">
                                  {app.answers.experience || "No prior experience listed."}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <p>This is a legacy application. It does not contain comprehensive form data.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
