"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createScreen } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

const PRESETS = [
  { label: "Full HD (1920×1080)", w: 1920, h: 1080 },
  { label: "4K UHD (3840×2160)", w: 3840, h: 2160 },
  { label: "HD Ready (1280×720)", w: 1280, h: 720 },
  { label: "세로 Full HD (1080×1920)", w: 1080, h: 1920 },
];

export default function NewScreenPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    try {
      const screen = await createScreen(user.uid, name.trim(), width, height);
      router.push(`/screens/${screen.id}`);
    } catch (err) {
      console.error("스크린 생성 실패:", err);
      alert("스크린 생성에 실패했습니다. 콘솔을 확인해주세요.");
      setCreating(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white/40 text-sm">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm">
          ← 목록
        </Link>
        <h1 className="text-lg font-semibold">새 스크린 만들기</h1>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <div className="flex flex-col gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-white/60 mb-2">스크린 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 로비 디스플레이"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-white/20"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {/* Resolution presets */}
          <div>
            <label className="block text-sm text-white/60 mb-2">해상도 프리셋</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${
                    width === p.w && height === p.h
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom resolution */}
          <div>
            <label className="block text-sm text-white/60 mb-2">직접 입력 (px)</label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-center"
              />
              <span className="text-white/30 text-sm">×</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-center"
              />
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {creating ? "생성 중..." : "스크린 만들기"}
          </button>
        </div>
      </main>
    </div>
  );
}
