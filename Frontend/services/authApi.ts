import Constants from "expo-constants";
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
  user: unknown;
};

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
