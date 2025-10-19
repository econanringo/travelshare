import { Header } from "@/components/header";
import Image from "next/image"
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-screen-2xl py-8">
        <h1 className="text-3xl font-bold mb-6">ようこそ TravelShare へ</h1>
        <p className="text-muted-foreground">
          旅の思い出を共有しましょう
        </p>
        <div className="flex gap-4 mt-6">
          <Button asChild variant="default">
            <Link href="/records">自分の履歴を見る</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/public">公開された情報を見る</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
