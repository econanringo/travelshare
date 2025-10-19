import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default async function PublicIndexPage() {
  try {
    const q = query(collection(db, 'travelRecords'), where('published', '==', true), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    return (
      <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">公開された旅行記録</h1>
        {docs.length === 0 ? (
          <div className="p-6 bg-muted rounded">公開された記録はありません。</div>
        ) : (
          <div className="grid gap-4">
            {docs.map((d: any) => (
              <Card key={d.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">{d.title}</div>
                    <div className="text-sm text-muted-foreground">投稿者: {d.username ?? '匿名'}</div>
                  </div>
                  <Link href={`/public/${d.id}`}>
                    <Button>見る</Button>
                  </Link>
                </div>
                {d.places && d.places.length > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">{Array.isArray(d.places) ? (typeof d.places[0] === 'string' ? d.places.slice(0,2).join(', ') : d.places.slice(0,2).map((p:any)=>p.name).join(', ')) : ''}</div>
                )}
                {d.notes && <div className="mt-2 text-sm">{d.notes.slice(0,200)}</div>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
    );
  } catch (err) {
    console.error(err);
    return (
      <div className="p-6">エラーが発生しました。</div>
    );
  }
}
