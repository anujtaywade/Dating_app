import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  return Google.useAuthRequest({
    webClientId: "YOUR_WEB_CLIENT_ID",
  });
}