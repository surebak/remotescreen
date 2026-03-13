"use client";

import { useEffect, useRef, useState } from "react";

export default function TextScroll({
  text,
  textColor,
  backgroundColor,
  fontSize,
  scrollSpeed,
  fontFamily = "sans-serif",
}: {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  scrollSpeed: number;
  fontFamily?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [animConfig, setAnimConfig] = useState<{
    duration: number;
    textWidth: number;
    containerWidth: number;
  } | null>(null);

  // Dynamically load Google Font when fontFamily changes
  useEffect(() => {
    if (!fontFamily || fontFamily === "sans-serif" || fontFamily === "serif" || fontFamily === "monospace") return;
    const fontId = `google-font-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(fontId)) return;
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }, [fontFamily]);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;
    const tw = textRef.current.scrollWidth;
    const cw = containerRef.current.offsetWidth;
    setAnimConfig({
      duration: (tw + cw) / scrollSpeed,
      textWidth: tw,
      containerWidth: cw,
    });
  }, [text, fontSize, scrollSpeed, fontFamily]);

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
          fontFamily,
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
