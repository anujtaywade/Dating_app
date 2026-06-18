import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  const hostUri = (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
  const expoHost = hostUri?.split(":")[0];

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
}

type BackendLoginResponse = {
  success: boolean;
  token: string;
  user: BackendUser;
};

export type BackendUser = {
  _id?: string;
  profileCompleted?: boolean;
};

export type CompleteProfilePayload = {
  name: string;
  dob: string;
  gender: "male" | "female";
  intrestedIn: "male" | "female";
  photos: string[];
  bio: string;
  educationOrWork: "studying" | "working";
  heightCm?: number;
  relationshipGoal: "long-term" | "short-term" | "casual" | "figuring-out";
  prompts: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
  };
};

export const AUTH_TOKEN_KEY = "authToken";

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getPostLoginRoute(user?: BackendUser): "/complete-profile" | "/(tabs)" {
  return user?.profileCompleted ? "/(tabs)" : "/complete-profile";
}

export async function loginWithFirebaseToken(
  firebaseToken: string
): Promise<BackendLoginResponse> {
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = `${apiBaseUrl}/auth/firebase-login`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firebaseToken }),
    });
  } catch (error) {
    throw new Error(
      `Cannot reach backend at ${endpoint}. Make sure the backend is running and EXPO_PUBLIC_API_BASE_URL points to this computer's reachable IP address.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Firebase login failed");
  }

  return data;
}

export async function completeProfile(
  payload: CompleteProfilePayload
): Promise<{ message: string; profileCompleted: boolean; user: BackendUser }> {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    throw new Error("Missing auth token. Please login again.");
  }

  const apiBaseUrl = getApiBaseUrl();
  const endpoint = `${apiBaseUrl}/profile/profile`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Profile update failed");
  }

  return data;
}

export async function uploadProfilePhotos(
  photoUris: string[]
): Promise<{ success: boolean; photos: string[] }> {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    throw new Error("Missing auth token. Please login again.");
  }

  const formData = new FormData();

  photoUris.forEach((uri, index) => {
    const extension = uri.split(".").pop()?.split("?")[0] || "jpg";
    const mimeType = extension.toLowerCase() === "png" ? "image/png" : "image/jpeg";

    formData.append("photos", {
      uri,
      name: `profile-photo-${index + 1}.${extension}`,
      type: mimeType,
    } as unknown as Blob);
  });

  const apiBaseUrl = getApiBaseUrl();
  const endpoint = `${apiBaseUrl}/upload/upload-photos`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Photo upload failed");
  }

  return data;
}
