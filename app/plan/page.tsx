"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MapPin, Plus } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"

interface TravelPlan {
  id: string
  title: string
  prefectures: string[]
  startDate: string
  endDate: string
  location: string
  datetime: string
  createdAt: number
}

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
]

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function TravelPlanApp() {
  const [plans, setPlans] = useState<TravelPlan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    prefectures: [] as string[],
    startDate: "",
    endDate: "",
    location: "",
    datetime: "",
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const q = query(collection(db, "travelPlans"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const loadedPlans: TravelPlan[] = []
      querySnapshot.forEach((doc) => {
        loadedPlans.push({ id: doc.id, ...doc.data() } as TravelPlan)
      })
      setPlans(loadedPlans)
    } catch (error) {
      console.error("Error loading plans:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newPlan = {
        ...formData,
        createdAt: Date.now(),
      }

      await addDoc(collection(db, "travelPlans"), newPlan)
      await loadPlans()

      setFormData({
        title: "",
        prefectures: [],
        startDate: "",
        endDate: "",
        location: "",
        datetime: "",
      })
      setShowForm(false)
    } catch (error) {
      console.error("Error saving plan:", error)
      alert("保存中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const togglePrefecture = (prefecture: string) => {
    setFormData((prev) => ({
      ...prev,
      prefectures: prev.prefectures.includes(prefecture)
        ? prev.prefectures.filter((p) => p !== prefecture)
        : [...prev.prefectures, prefecture],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">旅行プラン作成</h1>
          <p className="text-gray-600">あなたの旅行の思い出を記録しましょう</p>
        </header>

        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            {showForm ? "閉じる" : "新しい旅行プランを作成"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle>旅行プラン入力フォーム</CardTitle>
              <CardDescription>旅行の詳細を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">旅行タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: 夏の北海道旅行"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>訪問した都道府県</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                    {PREFECTURES.map((prefecture) => (
                      <div key={prefecture} className="flex items-center space-x-2">
                        <Checkbox
                          id={prefecture}
                          checked={formData.prefectures.includes(prefecture)}
                          onCheckedChange={() => togglePrefecture(prefecture)}
                        />
                        <label
                          htmlFor={prefecture}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {prefecture}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">開始日 *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">終了日 *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">場所</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例: 札幌市、函館市"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime">日時</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={formData.datetime}
                      onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" disabled={loading}>
                  {loading ? "保存中..." : "旅行プランを保存"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">保存された旅行プラン</h2>
          {plans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500">まだ旅行プランがありません。新しいプランを作成してください。</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="shadow-md hover:shadow-lg transition-shadow border-indigo-100">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium">期間:</span> {plan.startDate} 〜 {plan.endDate}
                      </div>
                    </div>

                    {plan.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">場所:</span> {plan.location}
                        </div>
                      </div>
                    )}

                    {plan.prefectures.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">訪問都道府県:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.prefectures.map((pref) => (
                            <span key={pref} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.datetime && (
                      <div className="text-sm">
                        <span className="font-medium">日時:</span> {new Date(plan.datetime).toLocaleString("ja-JP")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
