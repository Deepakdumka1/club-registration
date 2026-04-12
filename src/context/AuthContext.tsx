"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserData: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Setup real-time listener for user document
        unsubscribeUserData = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            const fallbackRole = currentUser.email?.toLowerCase().includes("admin") ? "admin" : "student";
            setUserData({ name: currentUser.email?.split('@')[0] || "User", role: fallbackRole });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user data:", error);
          const fallbackRole = currentUser.email?.toLowerCase().includes("admin") ? "admin" : "student";
          setUserData({ name: currentUser.email?.split('@')[0] || "User", role: fallbackRole });
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
        if (unsubscribeUserData) unsubscribeUserData();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserData) unsubscribeUserData();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
