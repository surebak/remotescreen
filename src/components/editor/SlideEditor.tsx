"use client";

import { useState, useRef, useEffect } from "react";
import { Slide, TextScrollConfig } from "@/types";
import { uploadMedia } from "@/lib/storage";

const GOOGLE_FONTS = [
  { label: "기본 (System)", value: "sans-serif" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Oswald", value: "Oswald" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Anton", value: "Anton" },
  { label: "Bebas Neue", value: "Bebas Neue" },
  { label: "Noto Sans KR", value: "Noto Sans KR" },
  { label: "Nanum Gothic", value: "Nanum Gothic" },
  { label: "Nanum Myeongjo", value: "Nanum Myeongjo" },
  { label: "Black Han Sans", value: "Black Han Sans" },
  { label: "Noto Serif KR", value: "Noto Serif KR" },
];

function useGoogleFont(fontFamily: string) {
  useEffect(() => {
    if (!fontFamily || fontFamily === "sans-serif") return;
    const fontId = `google-font-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(fontId)) return;
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }, [fontFamily]);
}

interface SlideEditorProps {
  slide: Slide;
  screenId: string;
  onChange: (updated: Slide) => void;
}

export default function SlideEditor({ slide, screenId, onChange }: SlideEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preload all Google Fonts for the dropdown preview
  useEffect(() => {
    GOOGLE_FONTS.forEach(({ value }) => {
      if (value === "sans-serif") return;
      const fontId = `google-font-${value.replace(/\s+/g, "-")}`;
      if (document.getElementById(fontId)) return;
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${value.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  // Keep current slide's font loaded
  useGoogleFont(slide.textScroll?.fontFamily ?? "sans-serif");

  const update = (partial: Partial<Slide>) => onChange({ ...slide, ...partial });
  const updateText = (partial: Partial<TextScrollConfig>) =>
    onChange({ ...slide, textScroll: { ...slide.textScroll!, ...partial } });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const { url, path } = await uploadMedia(screenId, slide.id, file, (p) =>
        setUploadProgress(p)
      );
      update({ mediaUrl: url, mediaStoragePath: path });
    } finally {
      setUploading(false);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Duration */}
      <section>
        <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">
          표시 시간
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            placeholder="초 단위 (없으면 무한)"
            value={slide.duration ?? ""}
            onChange={(e) =>
              update({ duration: e.target.value ? Number(e.target.value) : null })
            }
            className="w-44 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-white/20"
          />
          {slide.duration && (
            <button
              onClick={() => update({ duration: null })}
              className="text-xs text-white/40 hover:text-white"
            >
              무한으로 변경
            </button>
          )}
        </div>
        <p className="text-[11px] text-white/30 mt-1">
          {slide.duration
            ? `${slide.duration}초 후 다음 슬라이드로 전환`
            : "다음 Publish 전까지 무한 표시"}
        </p>
      </section>

      {/* Image */}
      {slide.type === "image" && (
        <section>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">이미지</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {slide.mediaUrl ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.mediaUrl}
                alt="slide"
                className="w-full max-h-48 object-contain rounded-lg bg-black/30 border border-white/10"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-sm text-white"
              >
                이미지 교체
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{Math.round(uploadProgress)}%</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🖼</span>
                  <span className="text-xs text-white/40">클릭하여 이미지 업로드</span>
                </>
              )}
            </button>
          )}
        </section>
      )}

      {/* Video */}
      {slide.type === "video" && (
        <section>
          <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">영상</label>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {slide.mediaUrl ? (
            <div className="relative group">
              <video
                src={slide.mediaUrl}
                controls
                className="w-full max-h-48 object-contain rounded-lg bg-black/30 border border-white/10"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-white/40 hover:text-white underline"
              >
                영상 교체
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{Math.round(uploadProgress)}%</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🎬</span>
                  <span className="text-xs text-white/40">클릭하여 영상 업로드</span>
                </>
              )}
            </button>
          )}
        </section>
      )}

      {/* Text scroll */}
      {slide.type === "text-scroll" && slide.textScroll && (
        <section className="flex flex-col gap-4">
          <label className="block text-xs text-white/50 uppercase tracking-wider">텍스트 스크롤</label>

          {/* Text content */}
          <div>
            <label className="block text-xs text-white/40 mb-1">텍스트 내용</label>
            <textarea
              value={slide.textScroll.text}
              onChange={(e) => updateText({ text: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Font family */}
          <div>
            <label className="block text-xs text-white/40 mb-1">폰트</label>
            <select
              value={slide.textScroll.fontFamily ?? "sans-serif"}
              onChange={(e) => updateText({ fontFamily: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              style={{ fontFamily: slide.textScroll.fontFamily ?? "sans-serif" }}
            >
              {GOOGLE_FONTS.map(({ label, value }) => (
                <option key={value} value={value} style={{ fontFamily: value }}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Font size + speed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">폰트 크기 (px)</label>
              <input
                type="number"
                min={12}
                max={300}
                value={slide.textScroll.fontSize}
                onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">속도 (px/s)</label>
              <input
                type="number"
                min={10}
                max={500}
                value={slide.textScroll.scrollSpeed}
                onChange={(e) => updateText({ scrollSpeed: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">텍스트 색상</label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <input
                  type="color"
                  value={slide.textScroll.textColor}
                  onChange={(e) => updateText({ textColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-white/50 font-mono">{slide.textScroll.textColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">배경 색상</label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <input
                  type="color"
                  value={slide.textScroll.backgroundColor}
                  onChange={(e) => updateText({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-white/50 font-mono">
                  {slide.textScroll.backgroundColor}
                </span>
              </div>
            </div>
          </div>


        </section>
      )}
    </div>
  );
}
