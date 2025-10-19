"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, getDoc, doc as firestoreDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";

import { Field, FieldLabel, FieldContent, FieldError, FieldSet, FieldLegend, FieldGroup, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/header";

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

export default function NewRecordPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [places, setPlaces] = useState("");
  const [placeEntries, setPlaceEntries] = useState<Array<{ datetime: string; name: string }>>([]);
  const [notes, setNotes] = useState("");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePref = (pref: string) => {
    setSelectedPrefs((s) =>
      s.includes(pref) ? s.filter((p) => p !== pref) : [...s, pref]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("ログインが必要です");
      return;
    }

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setLoading(true);
    try {
      // users コレクションのプロフィールを参照して username を優先的に取得
      let username: string | null = null;
      try {
        const uRef = firestoreDoc(db, "users", user.uid);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) {
          const ud = uSnap.data() as any;
          username = ud.username || ud.displayName || null;
        }
      } catch (err) {
        console.warn("ユーザープロファイル読み取りエラー", err);
      }

      // フォールバック: Firebase Auth の displayName -> email のローカルパート -> uid
      if (!username) {
        username = user.displayName || (user.email ? user.email.split('@')[0] : null) || user.uid;
      }

      const doc = {
        title: title.trim(),
        prefectures: selectedPrefs,
        startDate: startDate || null,
        endDate: endDate || null,
        // 保存時は placeEntries があればそれを使い、なければ旧来の places テキストを配列として保存
        places: placeEntries.length > 0 ? placeEntries : places.split('\n').map(p => p.trim()).filter(Boolean),
        notes: notes || null,
        createdAt: serverTimestamp(),
        uid: user.uid,
        username,
        published: false,
      };

      await addDoc(collection(db, "travelRecords"), doc);
      // 成功メッセージを一瞬表示してトップに戻る
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "保存中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">旅行記録を作成</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field>
          <FieldLabel>タイトル</FieldLabel>
          <FieldContent>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="旅行のタイトル" />
          </FieldContent>
        </Field>

        <FieldSet>
          <FieldLegend>訪れた都道府県</FieldLegend>
          <FieldGroup data-slot="checkbox-group" className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PREFECTURES.map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={selectedPrefs.includes(p)} onCheckedChange={() => togglePref(p)} />
                <span className="text-sm">{p}</span>
              </label>
            ))}
          </FieldGroup>
        </FieldSet>

        <div className="grid md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>開始日</FieldLabel>
            <FieldContent>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>終了日</FieldLabel>
            <FieldContent>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>旅行した場所（日時＋名前を複数追加）</FieldLabel>
          <FieldContent>
            <div className="flex flex-col gap-2">
              {placeEntries.map((pe, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input type="datetime-local" value={pe.datetime} onChange={(e) => {
                    const v = e.target.value;
                    setPlaceEntries((s) => s.map((p, i) => i === idx ? { ...p, datetime: v } : p));
                  }} className="w-1/3" />
                  <Input value={pe.name} onChange={(e) => {
                    const v = e.target.value;
                    setPlaceEntries((s) => s.map((p, i) => i === idx ? { ...p, name: v } : p));
                  }} placeholder="場所の名前" className="flex-1" />
                  <Button variant="ghost" type="button" onClick={() => setPlaceEntries((s) => s.filter((_, i) => i !== idx))}>削除</Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="button" onClick={() => setPlaceEntries((s) => [...s, { datetime: '', name: '' }])}>場所を追加</Button>
                <div className="text-sm text-muted-foreground">または従来の形式で入力: 下のテキストエリアに1行ごとに場所名を入力</div>
              </div>

              <Textarea value={places} onChange={(e) => setPlaces(e.target.value)} placeholder="（旧形式）例: 東京タワー\n浅草寺" />
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>感想</FieldLabel>
          <FieldContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="旅行の感想やメモ" />
          </FieldContent>
        </Field>

        {error && <div className="text-destructive">{error}</div>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>キャンセル</Button>
        </div>
      </form>
    </div>
    </>
  );
}
