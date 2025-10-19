"use client"

import { useEffect, useState } from "react";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { doc as firestoreDoc, updateDoc, deleteDoc, query as fsQuery, where as fsWhere, orderBy as fsOrderBy, onSnapshot as fsOnSnapshot } from "firebase/firestore";
import { Header } from "@/components/header";
// simple in-page modal will be used; no external modal component required

type TravelRecord = {
  id: string;
  title: string;
  prefectures?: string[];
  startDate?: string | null;
  endDate?: string | null;
  places?: string[];
  notes?: string | null;
  createdAt?: any;
  username?: string | null;
  published?: boolean;
};

export default function RecordsPage() {
  const { user, loading } = useAuth();
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editPlaces, setEditPlaces] = useState<Array<{ datetime: string; name: string }>>([]);
  const [tab, setTab] = useState<'mine' | 'published'>('mine');

  useEffect(() => {
    if (loading) return;
    if (!user && tab === 'mine') {
      setRecords([]);
      return;
    }

    let q;
    if (tab === 'mine' && user) {
      q = fsQuery(collection(db, "travelRecords"), fsWhere("uid", "==", user.uid), fsOrderBy("createdAt", "desc"));
    } else {
      q = fsQuery(collection(db, "travelRecords"), fsWhere("published", "==", true), fsOrderBy("createdAt", "desc"));
    }

    const unsub = fsOnSnapshot(q, (snap) => {
      const docs: TravelRecord[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setRecords(docs);
    }, (err) => {
      console.error(err);
      setError(err.message || '読み込みエラー');
    });

    return () => unsub();
  }, [user, loading, tab]);

  if (loading) {
    return <div className="p-6">読み込み中...</div>;
  }

  return (
    <>
    <Header />
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">旅行記録</h1>
          <div className="mt-2 flex gap-2">
            <Button variant={tab === 'mine' ? undefined : 'outline'} onClick={() => setTab('mine')}>自分の記録</Button>
            <Button variant={tab === 'published' ? undefined : 'outline'} onClick={() => setTab('published')}>公開された記録</Button>
          </div>
        </div>
        <div>
          <Button onClick={() => {
            if (user) router.push('/records/new');
            else router.push('/login');
          }}>新規作成</Button>
        </div>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      {!user ? (
        <div className="p-6">
          <p className="mb-3">マイページを表示するにはログインしてください。</p>
          <Button onClick={() => router.push('/login')}>ログイン</Button>
        </div>
      ) : records.length === 0 ? (
        <div className="p-6 bg-muted rounded">記録がありません。新しく作成してみましょう。</div>
      ) : (
        <div className="grid gap-4">
          {records.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.username ?? '匿名'}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {r.startDate ? r.startDate : ''}{r.endDate ? ` - ${r.endDate}` : ''}
                </div>
              </div>

              {r.places && r.places.length > 0 && (
                <ul className="mt-3 list-disc list-inside text-sm">
                  {r.places.map((p: any, i: number) => (
                    <li key={i}>
                      {typeof p === 'string' ? (
                        p
                      ) : (
                        <>
                          {p.datetime ? <span className="text-xs text-muted-foreground mr-2">{p.datetime}</span> : null}
                          <span>{p.name}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {r.notes && <div className="mt-3 text-sm">{r.notes}</div>}

              <div className="mt-3 flex gap-2">
                {tab === 'mine' && user && (
                  <>
                    <Button size="sm" onClick={() => {
                      setEditingRecord(r);
                      setEditTitle(r.title);
                      setEditNotes(r.notes || "");
                      setEditPublished(!!r.published);
                        // initialize editPlaces from r.places (support old string[] and new object[])
                        if (r.places && r.places.length > 0) {
                          const derived = r.places.map((p: any) => typeof p === 'string' ? { datetime: '', name: p } : { datetime: p.datetime || '', name: p.name || '' });
                          setEditPlaces(derived);
                        } else {
                          setEditPlaces([]);
                        }
                    }}>編集</Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                      if (!confirm('この記録を削除しますか？')) return;
                      try {
                        const ref = firestoreDoc(db, 'travelRecords', r.id);
                        await deleteDoc(ref);
                      } catch (err) {
                        console.error(err);
                        setError('削除に失敗しました');
                      }
                    }}>削除</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingRecord(null)} />
          <div className="relative z-10 w-full max-w-xl bg-background rounded p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">記録を編集</h2>
            <div className="flex flex-col gap-3">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
              <div className="flex items-center gap-2">
                <input id="published" type="checkbox" checked={editPublished} onChange={(e) => setEditPublished(e.target.checked)} />
                <label htmlFor="published" className="text-sm">公開する</label>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">訪れた場所</div>
                  <Button size="sm" onClick={() => setEditPlaces((s) => [...s, { datetime: '', name: '' }])}>場所を追加</Button>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  {editPlaces.map((pe, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input type="datetime-local" value={pe.datetime} onChange={(e) => setEditPlaces((s) => s.map((p,i) => i===idx?{...p, datetime: e.target.value}:p))} className="w-1/3" />
                      <Input value={pe.name} onChange={(e) => setEditPlaces((s) => s.map((p,i) => i===idx?{...p, name: e.target.value}:p))} className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => setEditPlaces((s) => s.filter((_,i)=>i!==idx))}>削除</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingRecord(null)}>キャンセル</Button>
              <Button onClick={async () => {
                if (!editingRecord) return;
                setSavingEdit(true);
                try {
                  const ref = firestoreDoc(db, 'travelRecords', editingRecord.id);
                  // save places as array of objects if editPlaces exists, otherwise keep existing
                  const placesToSave = editPlaces.length > 0 ? editPlaces : (editingRecord.places || []);
                  await updateDoc(ref, { title: editTitle, notes: editNotes || null, published: editPublished, places: placesToSave });
                  setEditingRecord(null);
                } catch (err) {
                  console.error(err);
                  setError('保存に失敗しました');
                } finally {
                  setSavingEdit(false);
                }
              }} disabled={savingEdit}>{savingEdit ? '保存中...' : '保存'}</Button>
              <Button variant="destructive" onClick={async () => {
                if (!editingRecord) return;
                if (!confirm('この記録を削除しますか？')) return;
                try {
                  const ref = firestoreDoc(db, 'travelRecords', editingRecord.id);
                  await deleteDoc(ref);
                  setEditingRecord(null);
                } catch (err) {
                  console.error(err);
                  setError('削除に失敗しました');
                }
              }}>削除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
