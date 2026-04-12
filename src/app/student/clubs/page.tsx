"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Users, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function ExploreClubs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [clubMemberCounts, setClubMemberCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Live listener for clubs
    const unsubClubs = onSnapshot(collection(db, "clubs"), (snapshot) => {
      setAllClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Live listener for users to calculate precise member counts for EVERY club
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(userDoc => {
        const data = userDoc.data();
        if (data.joinedClubs && Array.isArray(data.joinedClubs)) {
          data.joinedClubs.forEach((clubId: string) => {
            counts[clubId] = (counts[clubId] || 0) + 1;
          });
        }
      });
      setClubMemberCounts(counts);
    });

    return () => {
      unsubClubs();
      unsubUsers();
    };
  }, []);

  const filteredClubs = allClubs.filter(club => {
    const matchesSearch = club.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         club.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search clubs by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {["All", "Technology", "Arts", "Environment", "Athletics", "Literature", "Business", "Engineering"].map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filteredClubs.length === 0 ? (
        <div className="py-20 text-center text-gray-500">No clubs found in the database. Ask an admin to create some!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/student/clubs/${club.id}`} className="block h-full">
                <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col cursor-pointer">
                  <div className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                    <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-900 dark:text-white shadow-sm">
                      {club.category}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                    <img 
                      src={club.image || `https://picsum.photos/seed/${club.id}/600/400`} 
                      alt={club.name} 
                      onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${club.id}/600/400`; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{club.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                      {club.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 text-blue-500" /> {clubMemberCounts[club.id] || 0} members
                      </span>
                      <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
