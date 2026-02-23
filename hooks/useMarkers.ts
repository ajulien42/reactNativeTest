import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  pending?: boolean;
}

export function useMarkers(photoId: string) {
  const storageKey = `markers_${photoId}`;
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    setMarkers([]);
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (raw) {
        try {
          setMarkers(JSON.parse(raw));
        } catch {
          AsyncStorage.removeItem(storageKey);
        }
      }
    });
  }, [storageKey]);

  const persist = useCallback(
    (next: Marker[]) => {
      AsyncStorage.setItem(
        storageKey,
        JSON.stringify(next.filter((m) => !m.pending)),
      );
    },
    [storageKey],
  );

  const addMarker = useCallback(
    (id: string, x: number, y: number, pending = false) => {
      setMarkers((prev) => {
        const next: Marker[] = [...prev, { id, x, y, label: "", pending }];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const confirmMarker = useCallback(
    (id: string, label: string) => {
      setMarkers((prev) => {
        const next = prev.map((m) =>
          m.id === id ? { ...m, label, pending: false } : m,
        );
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeMarker = useCallback(
    (id: string) => {
      setMarkers((prev) => {
        const next = prev.filter((m) => m.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { markers, addMarker, confirmMarker, removeMarker };
}
