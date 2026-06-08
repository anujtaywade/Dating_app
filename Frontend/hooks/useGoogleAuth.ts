import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { ResponseType } from "expo-auth-session";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {

console.log(
  "REDIRECT URI:",
  AuthSession.makeRedirectUri({
    scheme: "frontend",
  })
);


  return Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: ResponseType.IdToken,
    scopes: ["profile", "email"],
  });
}
