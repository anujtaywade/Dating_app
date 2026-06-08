const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type BackendLoginResponse = {
  success: boolean;
  token: string;
  user: unknown;
};

export async function loginWithFirebaseToken(
  firebaseToken: string
): Promise<BackendLoginResponse> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firebaseToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Firebase login failed");
  }

  return data;
}
