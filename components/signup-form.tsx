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
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            GitHubで登録
          </Button>
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