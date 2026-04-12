"use client";

import { Settings2, Shield, Save, Database, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";

const dummyClubs = [
  {
    id: "aero-dynamics",
    name: "Aeromodelers Society",
    category: "Engineering",
    description: "The Aeromodelers Society is a premier student organization dedicated to the design, manufacturing, and piloting of unmanned aerial vehicles (UAVs) and model aircraft.\n\nWe provide resources, funding, and mentorship for students to compete in the annual DBF (Design, Build, Fly) competitions. No prior flight experience is required; we will teach you how to CAD, wire electronics, and fly!",
    members: 142,
    image: "https://picsum.photos/seed/aero/1200/400",
    announcements: [
      { title: "First General Meeting", content: "Join us in Engineering Hall 101 to discuss our budget for the semester and our DBF contest entry.", date: "Sept 10", author: "Sarah Connor" }
    ],
    events: [
      { id: "e1", name: "Propulsion 101 Workshop", date: "Sep 15", time: "5:00 PM", location: "Lab 3", registered: false }
    ],
    leaders: [
      { name: "Sarah Connor", role: "President", image: "https://picsum.photos/seed/sarah/100/100" },
      { name: "John Smith", role: "Lead Engineer", image: "https://picsum.photos/seed/john/100/100" }
    ]
  },
  {
    id: "fintech-club",
    name: "FinTech Innovation Group",
    category: "Business",
    description: "Bridging the gap between code and capital. We bring in industry speakers from top global financial institutions to discuss algorithms, quantitative trading, and blockchain engineering.\n\nWe also manage a mock portfolio worth $50,000 where our analysts pit their predictive software models against real-time market data.",
    members: 85,
    image: "https://picsum.photos/seed/fintech/1200/400",
    announcements: [
      { title: "Goldman Speaker Next Week", content: "We secured a VP from quantitative strategies. Bring your resumes!", date: "Oct 1", author: "Mike Ross" }
    ],
    events: [
      { id: "f1", name: "Intro to Algo Trading", date: "Oct 05", time: "6:00 PM", location: "Business Bldg 10A", registered: false },
      { id: "f2", name: "Bloomberg Terminal Session", date: "Oct 12", time: "4:00 PM", location: "Trading Lab", registered: true }
    ],
    leaders: [
      { name: "Mike Ross", role: "President", image: "https://picsum.photos/seed/mike/100/100" },
      { name: "Harvey Specter", role: "Head of Operations", image: "https://picsum.photos/seed/harvey/100/100" }
    ]
  },
  {
    id: "the-art-collective",
    name: "The Art Collective",
    category: "Creative Arts",
    description: "We are an inclusive community of painters, sculptors, digital artists, and musicians. \n\nEvery semester we host the campus-wide 'Glow Gala' where students can showcase their pieces, sell prints, and network with local gallery curators. We provide all drafting and painting supplies at our studio in the basement of the Arts Center.",
    members: 220,
    image: "https://picsum.photos/seed/art/1200/400",
    announcements: [
      { title: "Studio Access Resumes", content: "The basement studio has been cleared. You can use your ID cards to enter at any time.", date: "Sept 20", author: "Frida K." }
    ],
    events: [
      { id: "a1", name: "Midnight Painting Session", date: "Sept 25", time: "11:00 PM", location: "Basement Studio", registered: false }
    ],
    leaders: [
      { name: "Frida K.", role: "Creative Director", image: "https://picsum.photos/seed/frida/100/100" }
    ]
  }
];

export default function AdminSettings() {
  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      for (const club of dummyClubs) {
        const { id, ...data } = club;
        await setDoc(doc(db, "clubs", id), data);
      }
      toast.success("Database heavily populated with authentic mock data!");
    } catch (e) {
      toast.error("Failed to seed database.");
    }
    setSeeding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Environment Variables</h2>
        <p className="text-gray-500">Configure global restrictions and platform features here.</p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-900 dark:text-red-400 mb-2">
            <Database className="w-5 h-5" /> Development Operations
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300/80 max-w-md">
            Click here to inject highly realistic, authentic dummy organizations into the live Firestore database. This helps preview the beautiful native layouts.
          </p>
        </div>
        <button 
          onClick={handleSeedDatabase} 
          disabled={seeding}
          className="px-6 py-3 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all font-mono tracking-tight disabled:opacity-50"
        >
          {seeding ? <><Loader2 className="w-4 h-4 animate-spin" /> INJECTING...</> : "INJECT MOCK CLUBS"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
          <Shield className="w-5 h-5 text-orange-500" /> Security Protocol
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Strict Student Verification</p>
            <p className="text-sm text-gray-500">Require all users to verify .edu emails before joining.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Allow Auto-Acceptance</p>
            <p className="text-sm text-gray-500">Bypass Admin ledger and let students join automatically.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
          <Settings2 className="w-5 h-5 text-blue-500" /> Platform Maintenance
        </h3>
        
        <div>
          <p className="font-bold text-gray-900 dark:text-white mb-2">Max Active Clubs per User</p>
          <input type="number" defaultValue="5" className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white" />
        </div>
        
        <div className="pt-4">
           <button onClick={() => toast.success("Configuration preserved in local memory.")} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-bold rounded-xl flex items-center gap-2 transition-all">
             <Save className="w-4 h-4" /> Save System Config
           </button>
        </div>
      </div>
    </div>
  );
}
