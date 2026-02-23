import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "photos";

export interface Photo {
  id: string;
  uri: string;
  addedAt: number;
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setPhotos(JSON.parse(raw));
        } catch {
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    });
  }, []);

  const persist = useCallback((next: Photo[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPhoto = useCallback(
    (uri: string): Photo => {
      const photo: Photo = {
        id: Date.now().toString(),
        uri,
        addedAt: Date.now(),
      };
      setPhotos((prev) => {
        const next = [photo, ...prev];
        persist(next);
        return next;
      });
      return photo;
    },
    [persist],
  );

  const removePhoto = useCallback(
    (id: string) => {
      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { photos, addPhoto, removePhoto };
}
