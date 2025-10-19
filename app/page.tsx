import { Header } from "@/components/header";
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-screen-2xl py-8">
        <h1 className="text-3xl font-bold mb-6">ようこそ TravelShare へ</h1>
        <p className="text-muted-foreground">
          旅の思い出を共有しましょう
        </p>
      </main>
    </div>
  );
}
