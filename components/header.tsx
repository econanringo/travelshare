'use client';

import { auth, db } from "@/lib/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  displayName: string;
  username: string;
}

export function Header() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <header className="w-full border-b">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="TravelShare" className="h-8 w-8 object-contain" />
            <span>TravelShare</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {userData && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                こんにちは！{userData.displayName}さん
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            className="text-sm font-medium"
            onClick={handleSignOut}
          >
            ログアウト
          </Button>
        </nav>
      </div>
    </header>
  );
}