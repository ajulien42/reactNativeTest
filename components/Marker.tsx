import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { Marker as MarkerType } from "../hooks/useMarkers";

interface Props {
  marker: MarkerType;
  onRemove: (id: string) => void;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
}

export default function Marker({
  marker,
  onRemove,
  translateX,
  translateY,
  scale,
}: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    left: marker.x * scale.value + translateX.value,
    top: marker.y * scale.value + translateY.value,
  }));

  return (
    <Animated.View style={[styles.pin, animatedStyle]}>
      <Pressable
        onLongPress={() => !marker.pending && onRemove(marker.id)}
        hitSlop={12}
        style={styles.pressable}
      >
        <View style={[styles.square, marker.pending && styles.pendingPin]} />
        {marker.label ? (
          <View style={styles.captionShadow}>
            <BlurView
              intensity={25}
              experimentalBlurMethod="dimezisBlurView"
              style={styles.captionBlur}
            >
              <Text style={styles.caption}>{marker.label}</Text>
            </BlurView>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const SQUARE = 82;

const styles = StyleSheet.create({
  pin: {
    position: "absolute",
    transform: [{ translateX: -(SQUARE / 2) }, { translateY: -(SQUARE / 2) }],
    alignItems: "center",
  },
  pressable: {
    alignItems: "flex-start",
    gap: 14,
  },
  square: {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#fff",
    opacity: 0.2,
  },
  pendingPin: {
    opacity: 1,
  },
  captionShadow: {
    marginLeft: 3,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  captionBlur: {
    overflow: "hidden",
    borderRadius: 8,
  },
  caption: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#DDD3",
  },
});
