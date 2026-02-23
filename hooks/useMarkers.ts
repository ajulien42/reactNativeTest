import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "image_annotator_markers";

export interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  pending?: boolean;
}

export function useMarkers() {
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setMarkers(JSON.parse(raw));
        } catch {
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    });
  }, []);

  const persist = useCallback((next: Marker[]) => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next.filter((m) => !m.pending)),
    );
  }, []);

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
