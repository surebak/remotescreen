"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Screen, Slide } from "@/types";

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <div className="min-h-screen bg-black flex items-center justify-center text-white/30 text-sm">
        Loading...
      </div>
    );
  }

  if (!screen.published || slides.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/30 text-sm">
        게시된 콘텐츠가 없습니다
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: screen.width,
          height: screen.height,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {currentSlide && <SlideRenderer slide={currentSlide} onVideoEnd={advance} />}
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
    const { text, textColor, backgroundColor, fontSize, scrollSpeed } = slide.textScroll;

    return (
      <TextScroll
        text={text}
        textColor={textColor}
        backgroundColor={backgroundColor}
        fontSize={fontSize}
        scrollSpeed={scrollSpeed}
      />
    );
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

function TextScroll({
  text,
  textColor,
  backgroundColor,
  fontSize,
  scrollSpeed,
}: {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  scrollSpeed: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [duration, setDuration] = useState(10);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;
    const tw = textRef.current.scrollWidth;
    const cw = containerRef.current.offsetWidth;
    setTextWidth(tw);
    // Duration = time to traverse (text width + container width) at scrollSpeed px/s
    const totalDistance = tw + cw;
    setDuration(totalDistance / scrollSpeed);
  }, [text, fontSize, scrollSpeed]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <p
        ref={textRef}
        style={{
          color: textColor,
          fontSize,
          whiteSpace: "nowrap",
          willChange: "transform",
          animation: textWidth > 0 ? `scrollText ${duration}s linear infinite` : "none",
        }}
      >
        {text}
      </p>
      <style>{`
        @keyframes scrollText {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-${textWidth}px); }
        }
      `}</style>
    </div>
  );
}
