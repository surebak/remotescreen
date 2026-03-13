"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getScreens, deleteScreen } from "@/lib/firestore";
import { Screen } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">RemoteScreen</h1>
        <p className="text-white/40 text-sm mb-8">원격 스크린 관리 도구</p>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 bg-white text-gray-800 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors mx-auto"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 로그인
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading, signOutUser } = useAuth();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getScreens(user.uid);
    setScreens(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      load();
    } else if (!authLoading) {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white/40 text-sm">
        로딩 중...
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 스크린을 삭제할까요?`)) return;
    await deleteScreen(id);
    setScreens((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">RemoteScreen</h1>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm hidden sm:block">
            {user.displayName ?? user.email}
          </span>
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
          )}
          <Link
            href="/screens/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + 새 스크린
          </Link>
          <button
            onClick={signOutUser}
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            로그아웃
          </button>
        </div>
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
