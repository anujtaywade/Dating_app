import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from "react-native";
import { uploadProfilePhotos } from "@/services/authApi";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateList } from "./types";

type Props = {
  form: FormState;
  updateList: UpdateList;
};

const MAX_UPLOAD_WIDTH = 1200;
const JPEG_COMPRESSION = 0.8;

export function PhotosStep({ form, updateList }: Props) {
  const [localPreviews, setLocalPreviews] = useState<string[]>(Array(6).fill(""));
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const pickPhoto = async (index: number) => {
    try {
      const ImagePicker = await loadImagePicker();
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Photo access needed", "Allow photo library access to add profile photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.82,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      const uri = result.assets[0].uri;
      setLocalPreviews((current) => replaceAt(current, index, uri));
      setUploadingIndex(index);

      const optimizedUri = await optimizePhoto(uri);
      const uploadResult = await uploadProfilePhotos([optimizedUri]);
      const uploadedUrl = uploadResult.photos[0];

      if (!uploadedUrl) {
        throw new Error("Upload finished without a photo URL.");
      }

      updateList("photos", index, uploadedUrl);
    } catch (error) {
      setLocalPreviews((current) => replaceAt(current, index, ""));
      updateList("photos", index, "");
      Alert.alert(
        "Photo upload failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const removePhoto = (index: number) => {
    setLocalPreviews((current) => replaceAt(current, index, ""));
    updateList("photos", index, "");
  };

  return (
    <>
      <Text style={styles.stepTitle}>Photos</Text>
      <Text style={styles.stepSub}>Add a main photo to continue. The other 5 photos are optional.</Text>
      <View style={styles.photoGrid}>
        {form.photos.map((photo, index) => {
          const previewUri = localPreviews[index] || photo;
          const isUploading = uploadingIndex === index;

          return (
            <Pressable
              key={index}
              style={styles.photoSlot}
              onPress={() => pickPhoto(index)}
              disabled={isUploading}
            >
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoSlotText}>
                  Add{"\n"}{index === 0 ? "Main Photo" : `Photo ${index + 1}`}
                </Text>
              )}

              {previewUri && !isUploading && (
                <Pressable style={styles.photoRemoveButton} onPress={() => removePhoto(index)}>
                  <Text style={styles.photoRemoveText}>x</Text>
                </Pressable>
              )}

              {isUploading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.photoBadge}>
                  <Text style={styles.photoBadgeText}>{index === 0 ? "Main" : `${index + 1}`}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

function replaceAt(items: string[], index: number, value: string) {
  const next = [...items];
  next[index] = value;
  return next;
}

async function loadImagePicker() {
  try {
    return await import("expo-image-picker");
  } catch {
    throw new Error(
      "Image picker is installed in JavaScript, but the Android native app has not been rebuilt with it. Stop Expo, run `npx expo run:android` from Frontend, then start again."
    );
  }
}

async function optimizePhoto(uri: string) {
  try {
    const ImageManipulator = await loadImageManipulator();
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_UPLOAD_WIDTH } }],
      {
        compress: JPEG_COMPRESSION,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Image manipulator")) {
      throw error;
    }

    return uri;
  }
}

async function loadImageManipulator() {
  try {
    return await import("expo-image-manipulator");
  } catch {
    throw new Error(
      "Image manipulator is installed in JavaScript, but the Android native app has not been rebuilt with it. Stop Expo, run `npx expo run:android` from Frontend, then start again."
    );
  }
}
