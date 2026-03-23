"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Screen, Slide } from "@/types";
import TextScroll from "@/components/TextScroll";
import TextSpritz from "@/components/TextSpritz";

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
        console.log('Wake Lock acquired');
      }
    } catch (err) {
      console.error(`Wake Lock error: ${err}`);
    }
  };

  const handleInteraction = async () => {
    setHasInteracted(true);
    try {
      if (!document.fullscreenElement) {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
    await requestWakeLock();
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && document.fullscreenElement) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.error);
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Real-time listener: only updates when published changes
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "screens", id), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Screen;
        setScreen(data);
        setCurrentIndex(0);
      }
    });
    return () => unsub();
  }, [id]);

  const slides: Slide[] = screen?.published?.slides ?? [];
  const currentSlide = slides[currentIndex] ?? null;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance based on duration
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!currentSlide || slides.length <= 1) return;
    if (currentSlide.duration) {
      timerRef.current = setTimeout(advance, currentSlide.duration * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slides.length, advance]);

  if (!screen) {
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "#000", display: "grid", placeItems: "center" }}
        className="text-white/30 text-sm"
      >
        Loading...
      </div>
    );
  }

  if (!screen.published || slides.length === 0) {
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "#000", display: "grid", placeItems: "center" }}
        className="text-white/30 text-sm"
      >
        게시된 콘텐츠가 없습니다
      </div>
    );
  }

  return (
    <div
      onClick={handleInteraction}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
        cursor: "pointer",
      }}
      title="클릭하여 전체 화면 및 화면 꺼짐 방지 설정"
    >
      {!hasInteracted && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
          color: "rgba(255,255,255,0.7)",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: "14px",
          pointerEvents: "none",
        }}>
          💡 한 번 터치(클릭)하면 전체 화면이 되고 화면이 꺼지지 않습니다.
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${currentSlide?.offsetX ?? 0}px), calc(-50% + ${currentSlide?.offsetY ?? 0}px))`,
          width: screen.width,
          height: screen.height,
          overflow: "hidden",
        }}
      >
        {currentSlide && (
          <div style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${(currentSlide.scale ?? 100) / 100})`,
            transformOrigin: "center center",
          }}>
            <SlideRenderer slide={currentSlide} onVideoEnd={advance} />
          </div>
        )}
      </div>
    </div>
  );
}

function SlideRenderer({
  slide,
  onVideoEnd,
}: {
  slide: Slide;
  onVideoEnd: () => void;
}) {
  if (slide.type === "image" && slide.mediaUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.mediaUrl}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
        }}
      />
    );
  }

  if (slide.type === "video" && slide.mediaUrl) {
    return (
      <video
        key={slide.id}
        src={slide.mediaUrl}
        autoPlay
        muted={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
        }}
        onEnded={slide.duration ? undefined : onVideoEnd}
      />
    );
  }

  if (slide.type === "text-scroll" && slide.textScroll) {
    return <TextScroll {...slide.textScroll} />;
  }

  if (slide.type === "text-spritz" && slide.textSpritz) {
    return <TextSpritz {...slide.textSpritz} />;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.2)",
        fontSize: 16,
      }}
    >
      콘텐츠 없음
    </div>
  );
}

