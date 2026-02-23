import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import Marker from "../components/Marker";
import { useImageAnnotator } from "../hooks/useImageAnnotation";

export default function Annotate() {
  const { id, uri } = useLocalSearchParams<{ id: string; uri: string }>();

  const {
    imgSize,
    imageWidth,
    imageHeight,
    markers,
    removeMarker,
    gesture,
    animatedStyle,
    isPendingMarker,
    confirmMarker,
    cancelMarker,
    translateX,
    translateY,
    scale,
  } = useImageAnnotator(uri, id);

  const [labelText, setLabelText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function handleSubmit() {
    confirmMarker(labelText.trim());
    setLabelText("");
  }

  function handleCancel() {
    cancelMarker();
    setLabelText("");
  }

  if (!imgSize) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[
                {
                  width: imageWidth,
                  height: imageHeight,
                  transformOrigin: "top left",
                },
                animatedStyle,
              ]}
            >
              <Image
                source={uri}
                style={{ width: imageWidth, height: imageHeight }}
                contentFit="fill"
              />
            </Animated.View>
          </View>
        </GestureDetector>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              marker={marker}
              onRemove={removeMarker}
              translateX={translateX}
              translateY={translateY}
              scale={scale}
            />
          ))}
        </View>
      </GestureHandlerRootView>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <BlurView
          intensity={25}
          experimentalBlurMethod="dimezisBlurView"
          style={styles.backBtnBlur}
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </BlurView>
      </Pressable>
      <Modal
        visible={isPendingMarker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
        onShow={() => inputRef.current?.focus()}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
          <View style={styles.panelShadow}>
            <BlurView
              intensity={25}
              experimentalBlurMethod="dimezisBlurView"
              style={styles.panel}
            >
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Enter your text here…"
                placeholderTextColor="#666"
                value={labelText}
                onChangeText={setLabelText}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
              <View style={styles.actions}>
                <Pressable style={styles.btn} onPress={handleCancel}>
                  <Text style={styles.btnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, !labelText.trim() && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={!labelText.trim()}
                >
                  <Text style={styles.btnText}>Ok</Text>
                </Pressable>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  panelShadow: {
    borderRadius: 24,
    marginBottom: 30,
    marginHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  panel: {
    overflow: "hidden",
    borderRadius: 22,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 28,
    gap: 22,
    backgroundColor: "#DDD3",
  },
  input: {
    fontWeight: "300",
    fontSize: 21,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 3,
    alignItems: "center",
    backgroundColor: "#000",
  },
  btnDisabled: {
    backgroundColor: "#0003",
  },
  btnText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "200",
  },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  backBtnBlur: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#DDD3",
  },
  backBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
