import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Pressable,
  Image as RNImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type Photo, usePhotos } from "../hooks/usePhotos";

const SAMPLE_PHOTO: Photo = {
  id: "__sample__",
  uri: RNImage.resolveAssetSource(require("../assets/images/bgImage.jpg")).uri,
  addedAt: 0,
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function pickFromGallery(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  return result.canceled ? null : result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({ quality: 1 });
  return result.canceled ? null : result.assets[0].uri;
}

export default function Index() {
  const { photos, addPhoto, removePhoto } = usePhotos();

  async function handleGallery() {
    const uri = await pickFromGallery();
    if (!uri) return;
    const photo = addPhoto(uri);
    router.push({
      pathname: "/annotate" as any,
      params: { id: photo.id, uri: photo.uri },
    });
  }

  async function handleCamera() {
    const uri = await pickFromCamera();
    if (!uri) return;
    const photo = addPhoto(uri);
    router.push({
      pathname: "/annotate" as any,
      params: { id: photo.id, uri: photo.uri },
    });
  }

  function openPhoto(photo: Photo) {
    router.push({
      pathname: "/annotate" as any,
      params: { id: photo.id, uri: photo.uri },
    });
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Annotations</Text>
      </View>
      <FlatList
        data={[SAMPLE_PHOTO, ...photos]}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <>
            <Pressable style={styles.actionRow} onPress={handleCamera}>
              <Text style={styles.actionRowText}>📷 Take a photo</Text>
            </Pressable>
            <View style={styles.actionRowSeparator} />
            <Pressable style={styles.actionRow} onPress={handleGallery}>
              <Text style={styles.actionRowText}>🖼️ Choose a photo</Text>
            </Pressable>
            <View style={styles.sectionDivider} />
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openPhoto(item)}>
            <Image
              source={item.uri}
              style={styles.thumbnail}
              contentFit="cover"
            />
            <Text style={styles.date}>
              {item.id === "__sample__" ? "Sample" : formatDate(item.addedAt)}
            </Text>
            {item.id !== "__sample__" && (
              <Pressable onPress={() => removePhoto(item.id)} hitSlop={12}>
                <Text style={styles.deleteBtn}>✕</Text>
              </Pressable>
            )}
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
  },
  actionRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionRowText: {
    fontSize: 16,
    color: "#007AFF",
  },
  actionRowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
    marginLeft: 20,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: "#f2f2f2",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e0e0e0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  date: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  deleteBtn: {
    fontSize: 18,
    color: "#aaa",
    paddingHorizontal: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
    marginLeft: 98,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 28,
  },
});
