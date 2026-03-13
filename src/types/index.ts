export type MediaType = "image" | "video" | "text-scroll";

export interface TextScrollConfig {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number; // px
  scrollSpeed: number; // px per second
}

export interface Slide {
  id: string;
  order: number;
  type: MediaType;
  duration: number | null; // seconds; null = show forever until next publish
  // image / video
  mediaUrl?: string;
  mediaStoragePath?: string; // for deletion from storage
  // text-scroll
  textScroll?: TextScrollConfig;
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
