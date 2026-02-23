import { type ImageSource } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Image as RNImage, useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMarkers } from "./useMarkers";

export type AnnotatorSource = ImageSource | string | number;

const MIN_SCALE = 0.25;
const MAX_SCALE = 0.75;

function resolveSize(
  source: AnnotatorSource,
  onResolved: (w: number, h: number) => void,
) {
  if (typeof source === "number") {
    const asset = RNImage.resolveAssetSource(source);
    onResolved(asset.width, asset.height);
    return;
  }
  const uri = typeof source === "string" ? source : (source as ImageSource).uri;
  if (uri) RNImage.getSize(uri, onResolved);
}

export function useImageAnnotator(
  source: AnnotatorSource,
  photoId: string,
  propWidth?: number,
  propHeight?: number,
) {
  const {
    markers,
    addMarker,
    confirmMarker: confirmMarkerInStore,
    removeMarker,
  } = useMarkers(photoId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(
    propWidth && propHeight ? { w: propWidth, h: propHeight } : null,
  );

  useEffect(() => {
    if (propWidth && propHeight) {
      setImgSize({ w: propWidth, h: propHeight });
      return;
    }
    resolveSize(source, (w, h) => setImgSize({ w, h }));
  }, [source, propWidth, propHeight]);

  const imageWidth = imgSize?.w ?? 1;
  const imageHeight = imgSize?.h ?? 1;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const initialScaleSV = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  useEffect(() => {
    if (!imgSize) return;
    const s = screenWidth / imgSize.w;
    scale.value = s;
    initialScaleSV.value = s;
    savedScale.value = s;
  }, [imgSize, screenWidth, scale, initialScaleSV, savedScale]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      savedScale.value = scale.value;
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, savedScale.value * e.scale),
      );
      const scaleChange = nextScale / savedScale.value;
      translateX.value =
        focalX.value - scaleChange * (focalX.value - savedX.value);
      translateY.value =
        focalY.value - scaleChange * (focalY.value - savedY.value);
      scale.value = nextScale;
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(400)
    .onStart((e) => {
      const imgX = (e.x - translateX.value) / scale.value;
      const imgY = (e.y - translateY.value) / scale.value;
      const cx = Math.min(imageWidth, Math.max(0, imgX));
      const cy = Math.min(imageHeight, Math.max(0, imgY));
      const id = Date.now().toString();
      addMarker(id, cx, cy, true);
      setPendingId(id);
    })
    .runOnJS(true);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      scale.value = withTiming(initialScaleSV.value);
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Race(longPressGesture, panGesture, doubleTapGesture),
    pinchGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const confirmMarker = useCallback(
    (label: string) => {
      if (pendingId) {
        confirmMarkerInStore(pendingId, label);
        setPendingId(null);
      }
    },
    [pendingId, confirmMarkerInStore],
  );

  const cancelMarker = useCallback(() => {
    if (pendingId) removeMarker(pendingId);
    setPendingId(null);
  }, [pendingId, removeMarker]);

  return {
    /** null until image dimensions are resolved — render nothing until truthy */
    imgSize,
    imageWidth,
    imageHeight,
    markers,
    removeMarker,
    gesture,
    animatedStyle,
    isPendingMarker: pendingId !== null,
    confirmMarker,
    cancelMarker,

    translateX,
    translateY,
    scale,
  };
}
