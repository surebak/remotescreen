import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadMedia(
  screenId: string,
  slideId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop();
  const path = `screens/${screenId}/slides/${slideId}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path });
      }
    );
  });
}

export async function deleteMedia(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // ignore if already deleted
  }
}
