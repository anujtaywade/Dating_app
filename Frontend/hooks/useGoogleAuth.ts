import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

export function useGoogleLogin() {
  const redirectUri = makeRedirectUri({
    scheme: "com.anujtaywade.offcampus",
    path: "oauthredirect",
    native: "com.anujtaywade.offcampus:/oauthredirect",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
    usePKCE: true,
    redirectUri,
  });

  return [request, response, promptAsync] as const;
}
