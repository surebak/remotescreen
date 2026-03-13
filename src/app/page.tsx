"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getScreens, deleteScreen } from "@/lib/firestore";
import { Screen } from "@/types";

export default function HomePage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getScreens();
    setScreens(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 스크린을 삭제할까요?`)) return;
    await deleteScreen(id);
    setScreens((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">RemoteScreen</h1>
        <Link
          href="/screens/new"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 새 스크린
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center text-white/40 py-20">불러오는 중...</div>
        ) : screens.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg mb-4">스크린이 없습니다</p>
            <Link
              href="/screens/new"
              className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4"
            >
              첫 번째 스크린 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {screens.map((screen) => (
              <div
                key={screen.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-base truncate">{screen.name}</h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      {screen.width} × {screen.height}px &middot;{" "}
                      {screen.slides.length}개 슬라이드
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      screen.published
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {screen.published ? "게시됨" : "초안"}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                  <Link
                    href={`/screens/${screen.id}`}
                    className="flex-1 text-center text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    편집
                  </Link>
                  {screen.published && (
                    <Link
                      href={`/view/${screen.id}`}
                      target="_blank"
                      className="flex-1 text-center text-sm bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      보기 ↗
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(screen.id, screen.name)}
                    className="text-sm text-red-400/70 hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
