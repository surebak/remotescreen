"use client";

import { useEffect, useRef, useState } from "react";

export default function TextScroll({
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
  const [animConfig, setAnimConfig] = useState<{
    duration: number;
    textWidth: number;
    containerWidth: number;
  } | null>(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;
    const tw = textRef.current.scrollWidth;
    const cw = containerRef.current.offsetWidth;
    setAnimConfig({
      duration: (tw + cw) / scrollSpeed,
      textWidth: tw,
      containerWidth: cw,
    });
  }, [text, fontSize, scrollSpeed]);

  // Unique name per speed so the browser starts a fresh animation on speed change
  const animName = animConfig
    ? `scrollText-${animConfig.textWidth}-${Math.round(scrollSpeed * 100)}`
    : "scrollTextNone";

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
          animation: animConfig ? `${animName} ${animConfig.duration}s linear infinite` : "none",
        }}
      >
        {text}
      </p>
      {animConfig && (
        <style>{`
          @keyframes ${animName} {
            0%   { transform: translateX(${animConfig.containerWidth}px); }
            100% { transform: translateX(-${animConfig.textWidth}px); }
          }
        `}</style>
      )}
    </div>
  );
}
