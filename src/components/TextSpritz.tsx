"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function isKorean(cp: number): boolean {
  return (
    (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
    (cp >= 0x1100 && cp <= 0x11ff) || // Hangul Jamo
    (cp >= 0x3130 && cp <= 0x318f) || // Hangul Compatibility Jamo
    (cp >= 0xa960 && cp <= 0xa97f) || // Hangul Jamo Extended-A
    (cp >= 0xd7b0 && cp <= 0xd7ff) // Hangul Jamo Extended-B
  );
}

// 한글은 글자(음운) 단위, 영문은 단어 단위로 토큰화
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const cp = text.codePointAt(i)!;
    const char = String.fromCodePoint(cp);
    const charLen = char.length;

    if (/\s/.test(char)) {
      i += charLen;
      continue;
    }

    if (isKorean(cp)) {
      tokens.push(char);
      i += charLen;
    } else {
      // 한글이 아닌 문자: 공백/한글이 나올 때까지 단어로 묶기
      let word = char;
      i += charLen;
      while (i < text.length) {
        const nextCp = text.codePointAt(i)!;
        const nextChar = String.fromCodePoint(nextCp);
        if (isKorean(nextCp) || /\s/.test(nextChar)) break;
        word += nextChar;
        i += nextChar.length;
      }
      tokens.push(word);
    }
  }
  return tokens;
}

export default function TextSpritz({
  text,
  textColor,
  backgroundColor,
  fontSize,
  speed,
  fontFamily = "sans-serif",
}: {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  speed: number; // tokens per second
  fontFamily?: string;
}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Google Font 동적 로드
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

  // 속도 변경 시 인터벌 리셋
  useEffect(() => {
    if (tokens.length === 0) return;
    setIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = 1000 / Math.max(speed, 0.1);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % tokens.length);
    }, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tokens, speed]);

  const current = tokens[index] ?? "";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        key={`${index}-${current}`}
        style={{
          color: textColor,
          fontSize,
          fontFamily,
          fontWeight: 700,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {current}
      </span>
    </div>
  );
}
