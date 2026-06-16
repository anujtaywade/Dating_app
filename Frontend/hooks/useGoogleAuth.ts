import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ["profile", "email"],
  usePKCE: true,
});

  console.log("REQUEST IS READY:", !!request);
  console.log("ANDROID ID:", process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
console.log("WEB ID:", process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  return [request, response, promptAsync] as const;
}