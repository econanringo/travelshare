'use client';

import { auth } from "@/lib/firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setCookie, deleteCookie } from 'cookies-next';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合
        setUser(user);
        // Cookieにトークンを保存
        user.getIdToken().then((token) => {
          setCookie('auth-token', token, {
            maxAge: 30 * 24 * 60 * 60, // 30日
            path: '/'
          });
        });
      } else {
        // ユーザーがログアウトしている場合
        setUser(null);
        // Cookieからトークンを削除
        deleteCookie('auth-token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}