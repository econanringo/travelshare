import { Header } from "@/components/header";
// import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="grid md:grid-cols-2 h-[calc(100vh-3.5rem)]">
          {/* Left side: Main image and overlay text */}
          <div className="relative h-full">
            <img
              src="/IMG_4894.jpeg"
              alt="Main travel image"
              className="object-cover w-full h-full absolute inset-0"
              loading="eager"
            />
            <div className="absolute inset-0 md:hidden bg-black/40" />
          </div>

          {/* Right side: Secondary image and content */}
          <div className="relative bg-black/5 backdrop-blur-sm p-8 flex flex-col">
            <div className="relative h-60 mb-8 overflow-hidden rounded-lg">
              <img
                src="/IMG_4797.jpeg"
                alt="Secondary travel image"
                className="object-cover w-full h-full absolute inset-0"
                loading="lazy"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                思い出の場所を
                <br />
                記録しよう
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                旅の思い出を記録して、共有しましょう。
                <br />
                あなたの大切な瞬間をTravelShareで残しませんか？
              </p>
              <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="text-lg">
                  <Link href="/records/new">
                    旅の記録を作成する
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/public">
                    みんなの記録を見る
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <Link href="/records" className="hover:underline">
                自分の記録を見る →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
