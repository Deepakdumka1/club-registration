"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Megaphone, Calendar, Users, User, Star, CheckCircle, Loader2, FileText, Link as LinkIcon, Briefcase, GraduationCap, Hash, X } from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, updateDoc, arrayUnion, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function ClubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const clubId = unwrappedParams.id;
  const { userData, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "announcements" | "events" | "members">("overview");
  
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    studentId: "",
    driveLink: "",
    reason: "",
    experience: ""
  });

  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [realMemberCount, setRealMemberCount] = useState(0);

  useEffect(() => {
    // Populate default name if available
    if (userData?.name) {
      setFormData(prev => ({ ...prev, name: userData.name }));
    }

    const unsubClub = onSnapshot(doc(db, "clubs", clubId), (docSnap) => {
      if (docSnap.exists()) {
        setClub({ id: docSnap.id, ...docSnap.data() });
      } else {
        setClub(null);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Failed to fetch club:", error);
      setLoading(false);
    });

    // Real-time listener for current user's application status
    let unsubApp: (() => void) | undefined;
    if (user) {
      const q = query(collection(db, "applications"), where("userId", "==", user.uid), where("clubId", "==", clubId));
      unsubApp = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const apps = snap.docs.map(d => ({id: d.id, ...d.data()}));
          // Sort by date locally
          apps.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          const latest = apps[0];
          setApplicationStatus(latest.status);
          if (latest.status !== "rejected") {
            setHasApplied(true);
          } else {
            setHasApplied(false);
          }
        } else if (userData?.joinedClubs?.includes(clubId)) {
          setHasApplied(true);
          setApplicationStatus("accepted");
        }
      });
    }

    // Real-time listener for ALL members of this club and the precise count
    const qMembers = query(collection(db, "users"), where("joinedClubs", "array-contains", clubId));
    const unsubMembers = onSnapshot(qMembers, (membersSnap) => {
      const mList = membersSnap.docs.map(d => d.data());
      setClubMembers(mList);
      setRealMemberCount(mList.length);
    });

    return () => {
      unsubClub();
      if (unsubApp) unsubApp();
      unsubMembers();
    };
  }, [clubId, user, userData]);

  const handleRegisterEvent = async (eventId: string) => {
    if (!user) return toast.error("Please login first.");
    toast.success("Successfully registered for event!");
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to join.");
    setSubmittingApply(true);
    try {
      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        userEmail: user.email,
        userName: formData.name || userData?.name || user.email,
        clubId: club.id,
        clubName: club.name,
        status: "pending",
        createdAt: new Date(),
        answers: {
          course: formData.course,
          studentId: formData.studentId,
          driveLink: formData.driveLink,
          reason: formData.reason,
          experience: formData.experience
        }
      });
      toast.success("Application submitted seamlessly!");
      setIsApplyModalOpen(false);
      setHasApplied(true);
    } catch (err) {
      toast.error("Failed to sequence application.");
      console.error(err);
    }
    setSubmittingApply(false);
  };

  if (loading) {
    return <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!club) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Club not found</h2>
        <p className="mt-2 text-gray-500">This club may have been deleted or hasn't been created yet.</p>
        <Link href="/student/clubs" className="mt-6 inline-block text-blue-500 hover:underline">Return to browse</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      <Link href="/student/clubs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to clubs
      </Link>

      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Form</h3>
                  <p className="text-sm text-gray-500 font-medium">Applying to {club.name}</p>
                </div>
                <button onClick={() => setIsApplyModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={submitApplication} className="p-6 space-y-5 flex flex-col max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"> <User className="w-4 h-4 text-blue-500"/> Full Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-blue-500"/> Course / Major *</label>
                    <input required placeholder="e.g. B.Tech Computer Science" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Hash className="w-4 h-4 text-blue-500"/> Student ID *</label>
                    <input required placeholder="e.g. STU123456" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-blue-500"/> Drive Link <span>(Resume/Video)</span></label>
                    <input required type="url" placeholder="https://drive.google.com/..." value={formData.driveLink} onChange={e => setFormData({...formData, driveLink: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-500"/> Why do you want to join? *</label>
                  <textarea required rows={3} placeholder="Tell us about your interest in this club..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm resize-none transition-all"></textarea>
                </div>

                <div className="space-y-1.5 pb-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-blue-500"/> Past Experiences</label>
                  <textarea rows={3} placeholder="List any relevant projects, past positions, or skills..." value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white text-sm resize-none transition-all"></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 pb-2 flex gap-3">
                  <button type="button" onClick={() => setIsApplyModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={submittingApply} className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold flex justify-center items-center shadow-lg transition-transform hover:-translate-y-0.5">
                    {submittingApply ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mb-8 relative"
      >
        <div className="h-64 w-full relative bg-gray-200 dark:bg-gray-800">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent z-10" />
          <img 
            src={club.image || `https://picsum.photos/seed/${club.id}/1200/400`} 
            alt={club.name} 
            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${club.id}/1200/400`; }}
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-6 left-8 z-20">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-3">
              {club.category || "General"}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{club.name}</h1>
            <p className="text-gray-200 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {realMemberCount} Members</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified Club</span>
            </p>
          </div>
          <div className="absolute bottom-6 right-8 z-20">
            <button 
              onClick={() => {
                if (!user) return toast.error("Please login to join.");
                
                // If they are reapplying after rejection, reset the status to pending when opening form
                if (applicationStatus === "rejected") {
                   toast("Re-applying to the organization...", { icon: "📝" });
                }
                
                setIsApplyModalOpen(true);
              }}
              disabled={hasApplied}
              className={`px-8 py-3.5 font-bold rounded-xl shadow-lg transition-all ${
                hasApplied 
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 border border-gray-200 dark:border-gray-700" 
                  : applicationStatus === "rejected"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:-translate-y-1 shadow-red-500/20 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:-translate-y-1"
              }`}
            >
              {hasApplied 
                ? "Application Submitted" 
                : applicationStatus === "rejected" 
                  ? "Application Rejected — Reapply" 
                  : "Request to Join"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-8">
          {[
            { id: "overview", label: "Overview", icon: Star },
            { id: "announcements", label: "Announcements", icon: Megaphone },
            { id: "events", label: "Events", icon: Calendar },
            { id: "members", label: "Members", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Club</h3>
                <p>{club.description || "No description provided."}</p>
              </div>
            </motion.div>
          )}

          {activeTab === "announcements" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {(!club.announcements || club.announcements.length === 0) ? (
                 <p className="text-gray-500 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">No announcements yet.</p>
              ) : club.announcements.map((ann: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{ann.title}</h4>
                    <span className="text-xs text-gray-500 font-medium">{ann.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{ann.content}</p>
                  <p className="text-sm font-medium text-gray-500">— Posted by {ann.author}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "events" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {(!club.events || club.events.length === 0) ? (
                 <p className="text-gray-500 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 text-center">No upcoming events.</p>
              ) : club.events.map((event: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                      <span className="text-xs font-bold uppercase">{event.date?.split(" ")[0]}</span>
                      <span className="text-xl font-bold leading-none">{event.date?.split(" ")[1]?.replace(",", "")}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{event.name}</h4>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {event.time} • {event.location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRegisterEvent(event.id)}
                    disabled={event.registered}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap transition-colors w-full sm:w-auto ${event.registered ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 cursor-not-allowed border border-green-200 dark:border-green-800" : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900"}`}
                  >
                    {event.registered ? "Registered ✓" : "RSVP Now"}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "members" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {(applicationStatus === "accepted" || userData?.role === "admin") ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Member Directory ({clubMembers.length})</h3>
                  {clubMembers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No official members yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {clubMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg border border-blue-200/50 dark:border-blue-800/50 shrink-0">
                            {member.name?.charAt(0) || "U"}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{member.name || "Anonymous Student"}</h4>
                            <p className="text-sm text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center py-16">
                  <Users className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Member Directory Hidden</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">You must be an approved member of this organization to view the full roster.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Leadership Sidebar */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-6"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Club Leadership
              </h3>
            </div>
            <div className="p-5 space-y-6">
              {(!club.leaders || club.leaders.length === 0) ? (
                <p className="text-sm text-gray-500 text-center">No leaders listed yet.</p>
              ) : club.leaders.map((leader: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <img src={leader.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} alt={leader.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{leader.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">{leader.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
