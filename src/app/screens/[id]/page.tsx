"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getScreen, updateScreen, publishScreen, newSlide } from "@/lib/firestore";
import { Screen, Slide } from "@/types";
import SlidePanel from "@/components/editor/SlidePanel";
import SlideEditor from "@/components/editor/SlideEditor";
import TextScroll from "@/components/TextScroll";
import { useAuth } from "@/contexts/AuthContext";

export default function ScreenEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/"); return; }
    getScreen(id).then((s) => {
      if (!s || s.userId !== user.uid) { router.push("/"); return; }
      setScreen(s);
      if (s.slides.length > 0) setSelectedSlideId(s.slides[0].id);
      setLoading(false);
    });
  }, [id, router, user, authLoading]);

  const save = useCallback(
    async (updatedScreen: Screen) => {
      setSaving(true);
      await updateScreen(updatedScreen.id, {
        name: updatedScreen.name,
        width: updatedScreen.width,
        height: updatedScreen.height,
        slides: updatedScreen.slides,
      });
      setSaving(false);
      setSaveLabel("저장됨");
      setTimeout(() => setSaveLabel(""), 2000);
    },
    []
  );

  const updateSlide = (updated: Slide) => {
    if (!screen) return;
    const slides = screen.slides.map((s) => (s.id === updated.id ? updated : s));
    const next = { ...screen, slides };
    setScreen(next);
    save(next);
  };

  const addSlide = (type: Slide["type"]) => {
    if (!screen) return;
    const slide = newSlide(type, screen.slides.length);
    const slides = [...screen.slides, slide];
    const next = { ...screen, slides };
    setScreen(next);
    setSelectedSlideId(slide.id);
    save(next);
  };

  const deleteSlide = (slideId: string) => {
    if (!screen) return;
    const slides = screen.slides
      .filter((s) => s.id !== slideId)
      .map((s, i) => ({ ...s, order: i }));
    const next = { ...screen, slides };
    setScreen(next);
    if (selectedSlideId === slideId) {
      setSelectedSlideId(slides.length > 0 ? slides[0].id : null);
    }
    save(next);
  };

  const reorderSlides = (slides: Slide[]) => {
    if (!screen) return;
    const next = { ...screen, slides };
    setScreen(next);
    save(next);
  };

  const handlePublishAll = async () => {
    if (!screen) return;
    if (screen.slides.length === 0) {
      alert("슬라이드가 없습니다.");
      return;
    }
    setSaving(true);
    await publishScreen(screen.id, "all", screen.slides);
    const updated = await getScreen(screen.id);
    if (updated) setScreen(updated);
    setSaving(false);
    setSaveLabel("게시됨");
    setTimeout(() => setSaveLabel(""), 2000);
  };

  const handlePublishCurrent = async () => {
    if (!screen || !selectedSlideId) return;
    const slide = screen.slides.find((s) => s.id === selectedSlideId);
    if (!slide) return;
    setSaving(true);
    await publishScreen(screen.id, "single", [slide]);
    const updated = await getScreen(screen.id);
    if (updated) setScreen(updated);
    setSaving(false);
    setSaveLabel("현재 슬라이드 게시됨");
    setTimeout(() => setSaveLabel(""), 2000);
  };

  const selectedSlide = screen?.slides.find((s) => s.id === selectedSlideId) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white/40">
        불러오는 중...
      </div>
    );
  }

  if (!screen) return null;

  return (
    <div className="h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <header className="h-12 shrink-0 border-b border-white/10 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors shrink-0">
            ← 목록
          </Link>
          <input
            value={screen.name}
            onChange={(e) => {
              const next = { ...screen, name: e.target.value };
              setScreen(next);
            }}
            onBlur={() => save(screen)}
            className="bg-transparent text-sm font-semibold focus:outline-none border-b border-transparent focus:border-white/30 truncate max-w-xs"
          />
          <span className="text-xs text-white/40">
            {screen.width}×{screen.height}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveLabel && (
            <span className="text-xs text-green-400">{saveLabel}</span>
          )}
          {saving && !saveLabel && (
            <span className="text-xs text-white/30">저장 중...</span>
          )}

          {/* Publish menu */}
          <div className="flex gap-1">
            {selectedSlideId && (
              <button
                onClick={handlePublishCurrent}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                현재 슬라이드 게시
              </button>
            )}
            <button
              onClick={handlePublishAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
            >
              전체 게시 (Publish)
            </button>
            {screen.published && (
              <Link
                href={`/view/${screen.id}`}
                target="_blank"
                className="text-xs px-3 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-600 transition-colors"
              >
                보기 ↗
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide panel */}
        <SlidePanel
          slides={screen.slides}
          selectedId={selectedSlideId}
          onSelect={setSelectedSlideId}
          onAdd={addSlide}
          onDelete={deleteSlide}
          onReorder={reorderSlides}
        />

        {/* Center: Preview + Right: Properties */}
        {selectedSlide ? (
          <>
            {/* Preview */}
            <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] p-6 overflow-auto">
              <SlidePreview slide={selectedSlide} screen={screen} />
            </div>

            {/* Right properties panel */}
            <div className="w-72 shrink-0 bg-[#141414] border-l border-white/10 overflow-y-auto p-4">
              <SlideEditor
                key={selectedSlide.id}
                slide={selectedSlide}
                screenId={screen.id}
                onChange={updateSlide}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
            좌측에서 슬라이드를 선택하거나 추가하세요
          </div>
        )}
      </div>
    </div>
  );
}

// Inline preview component
function SlidePreview({ slide, screen }: { slide: Slide; screen: Screen }) {
  // Scale to fit in the preview area (max ~600px wide)
  const maxW = 600;
  const scale = Math.min(maxW / screen.width, 400 / screen.height, 1);
  const w = Math.round(screen.width * scale);
  const h = Math.round(screen.height * scale);

  return (
    <div>
      <p className="text-xs text-white/30 text-center mb-2">
        {screen.width}×{screen.height}px 미리보기
      </p>
      <div
        style={{ width: w, height: h }}
        className="relative overflow-hidden rounded-lg border border-white/10 bg-black"
      >
        {slide.type === "image" && slide.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.mediaUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {slide.type === "image" && !slide.mediaUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">
            이미지 없음
          </div>
        )}
        {slide.type === "video" && slide.mediaUrl && (
          <video
            src={slide.mediaUrl}
            className="absolute inset-0 w-full h-full object-contain"
            controls
          />
        )}
        {slide.type === "video" && !slide.mediaUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">
            영상 없음
          </div>
        )}
        {slide.type === "text-scroll" && slide.textScroll && (
          <TextScroll
            text={slide.textScroll.text}
            textColor={slide.textScroll.textColor}
            backgroundColor={slide.textScroll.backgroundColor}
            fontSize={slide.textScroll.fontSize * scale}
            scrollSpeed={slide.textScroll.scrollSpeed * scale}
            fontFamily={slide.textScroll.fontFamily}
          />
        )}
      </div>
    </div>
  );
}
