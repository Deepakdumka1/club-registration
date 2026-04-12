import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdfnn0Sb8TE8nno5LCHoV1fR5BalEDieM",
  authDomain: "pbl-sk.firebaseapp.com",
  projectId: "pbl-sk",
  storageBucket: "pbl-sk.firebasestorage.app",
  messagingSenderId: "176249832522",
  appId: "1:176249832522:web:70d36d754b55b82d5d12b3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function seed() {
  console.log("Seeding authentic clubs...");
  for (const club of dummyClubs) {
    const { id, ...data } = club;
    await setDoc(doc(db, "clubs", id), data);
    console.log(`- Created club: ${club.name}`);
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
