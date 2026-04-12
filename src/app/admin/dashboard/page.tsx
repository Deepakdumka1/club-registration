"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Calendar, Activity, CheckCircle2, XCircle, Megaphone, Loader2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, arrayUnion, addDoc, setDoc, increment } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const { userData, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingRequests: 0,
    eventParticipation: "N/A"
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState({
    name: "",
    categoryId: "Environment",
    description: "",
    image: ""
  });
  const [creatingClub, setCreatingClub] = useState(false);

  const [myClub, setMyClub] = useState<any>(null);
  const [myClubMembers, setMyClubMembers] = useState(0);

  useEffect(() => {
    let unsubscribeClub: (() => void) | undefined;
    let unsubscribeMembers: (() => void) | undefined;
    
    if (user) {
      const qClub = query(collection(db, "clubs"), where("createdBy", "==", user.uid));
      unsubscribeClub = onSnapshot(qClub, (snap) => {
        if (!snap.empty) {
          const clubDoc = snap.docs[0];
          const clubData = { id: clubDoc.id, ...clubDoc.data() };
          setMyClub(clubData);

          // Setup a nested live listener for members of THIS specific club
          if (unsubscribeMembers) unsubscribeMembers();
          const qMembers = query(collection(db, "users"), where("joinedClubs", "array-contains", clubDoc.id));
          unsubscribeMembers = onSnapshot(qMembers, (memberSnap) => {
            setMyClubMembers(memberSnap.size);
          });
        } else {
          setMyClub(null);
          setMyClubMembers(0);
        }
      });
    }

    // Listen to live pending applications
    const q = query(collection(db, "applications"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(apps);
      setStats(prev => ({ ...prev, pendingRequests: apps.length }));
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const students = usersSnap.docs.filter(d => d.data().role === "student");
        
        let activeStudentsCount = 0;
        students.forEach(s => {
          const data = s.data();
          if (data.joinedClubs && Array.isArray(data.joinedClubs) && data.joinedClubs.length > 0) {
            activeStudentsCount++;
          }
        });

        const clubsSnap = await getDocs(collection(db, "clubs"));
        let totalEvents = 0;
        clubsSnap.docs.forEach(doc => {
          const c = doc.data();
          if (c.events && Array.isArray(c.events)) {
            totalEvents += c.events.length;
          }
        });

        setStats(prev => ({ 
          ...prev, 
          totalMembers: students.length, 
          activeMembers: activeStudentsCount,
          eventParticipation: totalEvents.toString()
        }));
      } catch (err) {
        console.warn("Could not load stats.", err);
      }
    };
    
    fetchStats();
    return () => {
      unsubscribe();
      if (unsubscribeClub) unsubscribeClub();
      if (unsubscribeMembers) unsubscribeMembers();
    };
  }, [user]);

  const handleRequest = async (applicationId: string, userId: string, clubId: string, action: "accept" | "reject") => {
    try {
      if (action === "accept") {
        await updateDoc(doc(db, "applications", applicationId), { status: "accepted" });
        await setDoc(doc(db, "users", userId), {
          joinedClubs: arrayUnion(clubId)
        }, { merge: true });
        
        await updateDoc(doc(db, "clubs", clubId), {
          members: increment(1)
        });

        toast.success("Application accepted!");
      } else {
        await updateDoc(doc(db, "applications", applicationId), { status: "rejected" });
        toast.success("Application rejected.");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to process request.");
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Not authenticated");
    if (!newClubData.name || !newClubData.description) return toast.error("Please fill in all required fields.");
    
    setCreatingClub(true);
    
    try {
      // Enforce 1 club per admin
      const clubsQuery = query(collection(db, "clubs"), where("createdBy", "==", user.uid));
      const myClubs = await getDocs(clubsQuery);
      
      if (!myClubs.empty) {
        toast.error("Admins are restricted to deploying 1 official club.");
        setCreatingClub(false);
        return;
      }

      // Slugify name for clean ID
      const clubId = newClubData.name.toLowerCase().replace(/\s+/g, '-');
      const defaultImage = newClubData.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000";
      
      await setDoc(doc(db, "clubs", clubId), {
        name: newClubData.name,
        category: newClubData.categoryId,
        description: newClubData.description,
        image: defaultImage,
        members: 0,
        leaders: [{ name: userData?.name || "System Admin", role: "Founder", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" }],
        events: [],
        announcements: [],
        createdAt: new Date(),
        createdBy: user.uid
      });
      
      toast.success(`${newClubData.name} created successfully!`);
      setIsModalOpen(false);
      setNewClubData({ name: "", categoryId: "Environment", description: "", image: "" });
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error("Failed to create club.");
    } finally {
      setCreatingClub(false);
    }
  };

  const statCards = [
    { title: "Total Members", value: stats.totalMembers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Active Members", value: stats.activeMembers, icon: Activity, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "Pending Requests", value: stats.pendingRequests, icon: UserPlus, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Event Participation", value: stats.eventParticipation, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5 text-blue-500" /> Create New Club</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateClub} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name *</label>
                  <input required placeholder="e.g. Finance Society" value={newClubData.name} onChange={e => setNewClubData({...newClubData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={newClubData.categoryId} onChange={e => setNewClubData({...newClubData, categoryId: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm">
                    {["Technology", "Arts", "Environment", "Athletics", "Literature", "Business", "Other"].map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image URL (Optional)</label>
                  <input placeholder="https://unsplash.com/..." value={newClubData.image} onChange={e => setNewClubData({...newClubData, image: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea required rows={3} placeholder="What is this club about?" value={newClubData.description} onChange={e => setNewClubData({...newClubData, description: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm resize-none"></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={creatingClub} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex justify-center items-center transition-colors">
                    {creatingClub ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Club"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? "-" : stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden h-full"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Applications</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-6 h-6" /></div>
              ) : requests.length === 0 ? (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="flex flex-col border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedAppId(expandedAppId === req.id ? null : req.id as string)}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                          {req.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{req.userName} <span className="font-normal text-gray-500 text-sm">applied to</span> {req.clubName}</p>
                          <div className="flex text-sm text-gray-500 gap-2">
                            <span>{req.userEmail}</span>
                            <span>•</span>
                            <span>{req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setExpandedAppId(expandedAppId === req.id ? null : req.id as string)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
                        >
                          Review Form
                        </button>
                        <button 
                          onClick={() => handleRequest(req.id, req.userId, req.clubId, "accept")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-200 dark:border-green-800/30"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                        <button 
                          onClick={() => handleRequest(req.id, req.userId, req.clubId, "reject")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/30"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedAppId === req.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-50/80 dark:bg-gray-900/50"
                        >
                          <div className="px-6 pb-6 pt-2">
                            {req.answers ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div><span className="font-bold text-gray-500">Course:</span> <span className="text-gray-900 dark:text-white">{req.answers.course}</span></div>
                                <div><span className="font-bold text-gray-500">Student ID:</span> <span className="text-gray-900 dark:text-white">{req.answers.studentId}</span></div>
                                <div><span className="font-bold text-gray-500">Reason:</span> <p className="text-gray-900 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 p-2 rounded-lg">{req.answers.reason}</p></div>
                                <div><span className="font-bold text-gray-500">Experience:</span> <p className="text-gray-900 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 p-2 rounded-lg">{req.answers.experience || "None"}</p></div>
                                {req.answers.driveLink && (
                                  <div className="sm:col-span-2">
                                    <span className="font-bold text-gray-500">Drive Link:</span> 
                                    <a href={req.answers.driveLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-2">Open Portfolio</a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No application form provided.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Admin Commands</h3>
            <p className="text-blue-100 text-sm mb-6 relative z-10">Expand your university's ecosystem by launching new official organizations.</p>
            <div className="space-y-3 relative z-10">
              <button onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl text-sm font-semibold backdrop-blur-sm transition-colors text-left px-4 flex justify-between items-center shadow-sm">
                <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Deploy New Club</span>
              </button>
              <Link href="/admin/announcements" className="block w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors px-4">
                <div className="flex justify-between items-center">
                  <span>Post Announcement</span>
                  <Megaphone className="w-4 h-4" />
                </div>
              </Link>
              <Link href="/admin/events" className="block w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors px-4">
                <div className="flex justify-between items-center">
                  <span>Schedule Event</span>
                  <Calendar className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </motion.div>

          {/* My Managed Organization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">My Organization</h3>
              {myClub && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>}
            </div>
            
            {myClub ? (
              <div className="p-5 space-y-4">
                <div className="h-32 w-full rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <img 
                    src={myClub.image || `https://picsum.photos/seed/${myClub.id}/400/200`} 
                    alt={myClub.name} 
                    onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${myClub.id}/400/200`; }}
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {myClub.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{myClub.name}</h4>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Users className="w-4 h-4" /> {myClubMembers} Total Members</p>
                </div>
                <Link href={`/student/clubs/${myClub.id}`} className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                  View Public Page
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm font-medium">You have not deployed a club yet.</p>
                <p className="text-xs mt-1">Use the command above to start one.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
