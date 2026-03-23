export type MediaType = "image" | "video" | "text-scroll" | "text-spritz";

export interface TextScrollConfig {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number; // px
  scrollSpeed: number; // px per second
  fontFamily?: string; // Google Fonts family name, e.g. "Noto Sans KR"
}

export interface TextSpritzConfig {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number; // px
  speed: number; // tokens per second (한글=글자, 영문=단어)
  fontFamily?: string;
}

export interface Slide {
  id: string;
  order: number;
  type: MediaType;
  duration: number | null; // seconds; null = show forever until next publish
  offsetX?: number;
  offsetY?: number;
  scale?: number; // percent, default 100
  // image / video
  mediaUrl?: string;
  mediaStoragePath?: string; // for deletion from storage
  // text-scroll
  textScroll?: TextScrollConfig;
  // text-spritz
  textSpritz?: TextSpritzConfig;
}

export interface PublishedContent {
  mode: "all" | "single";
  slides: Slide[];
  publishedAt: number; // Unix ms
}

export interface Screen {
  id: string;
  userId: string;
  name: string;
  width: number;
  height: number;
  slides: Slide[];
  published: PublishedContent | null;
  createdAt: number;
  updatedAt: number;
}
