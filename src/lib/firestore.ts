import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Screen, PublishedContent, Slide } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SCREENS = "screens";

export async function getScreens(): Promise<Screen[]> {
  const q = query(collection(db, SCREENS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Screen);
}

export async function getScreen(id: string): Promise<Screen | null> {
  const snap = await getDoc(doc(db, SCREENS, id));
  return snap.exists() ? (snap.data() as Screen) : null;
}

export async function createScreen(
  name: string,
  width: number,
  height: number
): Promise<Screen> {
  const id = uuidv4();
  const now = Date.now();
  const screen: Screen = {
    id,
    name,
    width,
    height,
    slides: [],
    published: null,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, SCREENS, id), screen);
  return screen;
}

export async function updateScreen(
  id: string,
  data: Partial<Omit<Screen, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, SCREENS, id), { ...data, updatedAt: Date.now() });
}

export async function deleteScreen(id: string): Promise<void> {
  await deleteDoc(doc(db, SCREENS, id));
}

export async function publishScreen(
  id: string,
  mode: "all" | "single",
  slides: Slide[]
): Promise<void> {
  const published: PublishedContent = {
    mode,
    slides,
    publishedAt: Date.now(),
  };
  await updateDoc(doc(db, SCREENS, id), {
    published,
    updatedAt: Date.now(),
  });
}

export function newSlide(type: Slide["type"], order: number): Slide {
  const base: Slide = {
    id: uuidv4(),
    order,
    type,
    duration: null,
  };
  if (type === "text-scroll") {
    base.textScroll = {
      text: "텍스트를 입력하세요",
      textColor: "#ffffff",
      backgroundColor: "#000000",
      fontSize: 48,
      scrollSpeed: 80,
    };
  }
  return base;
}
