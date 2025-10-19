'use client';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { auth, db } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useRouter } from "next/navigation"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ confirmPassword, setConfirmPassword ] = useState("");
  const [ username, setUsername ] = useState("");
  const [ displayName, setDisplayName ] = useState("");
  const [ error, setError ] = useState("");
  const router = useRouter()

  const handleSignUp = async () => {
    setError("");
    
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        // Firestoreにユーザー情報を保存
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          username: username,
          displayName: displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        router.push("/");  // サインアップ成功後はホームページへ
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      // Firebase AuthのエラーメッセージをJapaneseで表示
      if (error.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に使用されています");
      } else if (error.code === "auth/invalid-email") {
        setError("無効なメールアドレスです");
      } else if (error.code === "auth/weak-password") {
        setError("パスワードは6文字以上である必要があります");
      } else {
        setError("アカウントの作成に失敗しました");
      }
    }
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        handleSignUp();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">アカウントを作成</h1>
          <p className="text-muted-foreground text-sm text-balance">
            以下の情報を入力してアカウントを作成してください
          </p>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Field>
          <FieldLabel htmlFor="username">ユーザーID</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="example123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="^[a-zA-Z0-9_]{3,15}$"
            title="3～15文字の半角英数字とアンダースコアが使用できます"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="displayName">表示名</FieldLabel>
          <Input
            id="displayName"
            type="text"
            placeholder="表示される名前"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">パスワード</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="6文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">パスワード（確認）</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="パスワードを再入力"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </Field>
        <Field>
          <Button type="submit">アカウント作成</Button>
        </Field>
        <FieldSeparator>または</FieldSeparator>
        <Field>
          <FieldDescription className="text-center">
            すでにアカウントをお持ちですか？{" "}
            <a href="/login" className="underline underline-offset-4">
              ログイン
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}