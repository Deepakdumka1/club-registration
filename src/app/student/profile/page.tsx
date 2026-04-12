"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Shield, Award, Edit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function StudentProfile() {
  const { userData } = useAuth();
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "clubs"), (snapshot) => {
      let joined: any[] = [];
      snapshot.docs.forEach(doc => {
        if (userData.joinedClubs?.includes(doc.id)) {
          joined.push({ ...doc.data(), id: doc.id });
        }
      });
      setMyClubs(joined);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to listen to clubs in profile:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [userData]);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-4xl text-purple-600 dark:text-purple-400 font-bold shadow-sm">
              {userData?.name?.charAt(0) || "S"}
            </div>
            <div className="text-center sm:text-left pt-2 sm:pt-14">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData?.name || "Student User"}</h1>
              <p className="text-gray-500 font-medium tracking-wide text-sm">{userData?.email}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-8"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{userData?.name || "Student User"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{userData?.email || "student@university.edu"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> Role Assignment</p>
                <p className="font-medium text-purple-600 dark:text-purple-400 capitalize">{userData?.role || "Student"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" /> Organization Memberships
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
              ) : myClubs.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven't joined any clubs yet.</p>
              ) : (
                myClubs.map(club => (
                  <Link href={`/student/clubs/${club.id}`} key={club.id}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors mb-4">
                      <div className="flex items-center gap-4">
                        <img src={club.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{club.name}</h4>
                          <p className="text-sm text-gray-500">Official Member</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">Active</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Campus Star</h3>
            <p className="text-blue-100 text-sm mb-4">You are heavily participating across campus. Keep it up!</p>
            <div className="bg-white/10 rounded-xl p-4 flex justify-around">
              <div>
                <p className="text-2xl font-bold">{myClubs.length}</p>
                <p className="text-xs uppercase tracking-wider text-blue-100">Clubs</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
