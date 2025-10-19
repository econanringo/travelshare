import { getDoc, doc as firestoreDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";

type Props = { params: { id: string } };

export default async function PublicRecordPage({ params }: Props) {
    const id = params.id;
    try {
        const ref = firestoreDoc(db, 'travelRecords', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return notFound();
        const data = snap.data() as any;
        if (!data.published) return notFound();

        return (
            <>
                <Header />
                <div className="max-w-3xl mx-auto p-6">
                    <Card className="p-6">
                        <h1 className="text-2xl font-semibold">{data.title}</h1>
                        <div className="text-sm text-muted-foreground">投稿者: {data.username ?? '匿名'}</div>
                        <div className="mt-4">
                            {data.places && data.places.length > 0 && (
                                <ul className="list-disc list-inside">
                                    {data.places.map((p: any, i: number) => (
                                        <li key={i}>{typeof p === 'string' ? p : `${p.datetime ? p.datetime + ' ' : ''}${p.name}`}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {data.notes && <div className="mt-4">{data.notes}</div>}
                    </Card>
                </div>
            </>
        );
    } catch (err) {
        console.error(err);
        return notFound();
    }
}
