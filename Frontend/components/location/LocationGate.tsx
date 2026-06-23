import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { updateCurrentLocation } from "@/services/authApi";
import {
  getDeviceLocation,
  LocationAccessError,
  LocationFailureReason,
  promptToEnableLocationServices,
} from "@/services/locationService";

type GateStatus = "checking" | "ready" | "blocked";

export function LocationGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [reason, setReason] = useState<LocationFailureReason | null>(null);
  const [message, setMessage] = useState("Checking your location...");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const statusRef = useRef<GateStatus>("checking");
  const requestInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const updateStatus = (nextStatus: GateStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const checkLocation = useCallback(async () => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    if (statusRef.current !== "ready") updateStatus("checking");

    try {
      const location = await getDeviceLocation();
      if (!mountedRef.current) return;

      setReason(null);
      updateStatus("ready");

      void updateCurrentLocation({
        type: "Point",
        coordinates: [location.longitude, location.latitude],
        city: location.city,
      }).catch(() => undefined);
    } catch (error) {
      if (!mountedRef.current) return;

      const locationError =
        error instanceof LocationAccessError
          ? error
          : new LocationAccessError(
              "unavailable",
              "Your location could not be detected. Please try again."
            );
      setReason(locationError.reason);
      setCanAskAgain(locationError.canAskAgain);
      setMessage(locationError.message);
      updateStatus("blocked");
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void checkLocation();

    const changeSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void checkLocation();
    });
    const focusSubscription =
      Platform.OS === "android"
        ? AppState.addEventListener("focus", () => void checkLocation())
        : null;

    return () => {
      mountedRef.current = false;
      changeSubscription.remove();
      focusSubscription?.remove();
    };
  }, [checkLocation]);

  const handleAction = async () => {
    if (reason === "services-disabled") {
      if (Platform.OS === "android") {
        try {
          await promptToEnableLocationServices();
          await checkLocation();
          return;
        } catch {
          // Use system settings if the Android location provider prompt is unavailable.
        }
      }

      await Linking.openSettings();
      return;
    }

    if (reason === "permission-denied" && !canAskAgain) {
      await Linking.openSettings();
      return;
    }

    await checkLocation();
  };

  if (status === "ready") return children;

  const buttonLabel =
    reason === "services-disabled"
      ? "Turn on location"
      : reason === "permission-denied" && !canAskAgain
        ? "Open app settings"
        : "Try again";

  return (
    <View style={gateStyles.root}>
      <View style={gateStyles.glow} />
      <View style={gateStyles.card}>
        <View style={gateStyles.iconCircle}>
          {status === "checking" ? (
            <ActivityIndicator size="large" color="#e8845a" />
          ) : (
            <Ionicons name="location-outline" size={38} color="#e8845a" />
          )}
        </View>
        <Text style={gateStyles.title}>
          {status === "checking" ? "Checking location" : "Location is required"}
        </Text>
        <Text style={gateStyles.message}>
          {status === "checking"
            ? "We use your area to keep nearby discovery relevant."
            : message}
        </Text>

        {status === "blocked" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleAction()}
            style={({ pressed }) => [
              gateStyles.button,
              pressed && gateStyles.pressed,
            ]}
          >
            <Ionicons name="navigate" size={18} color="#ffffff" />
            <Text style={gateStyles.buttonText}>{buttonLabel}</Text>
          </Pressable>
        ) : null}

        <View style={gateStyles.privacyRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#8a6142" />
          <Text style={gateStyles.privacyText}>
            Other people see only your general area, never your exact position.
          </Text>
        </View>
      </View>
    </View>
  );
}

const gateStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fdf6ee",
    padding: 24,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -100,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#f8dfcf",
    opacity: 0.7,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#edd4bf",
    backgroundColor: "#fffaf4",
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: "#5c351d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbe6d8",
    marginBottom: 20,
  },
  title: {
    color: "#2d1a0e",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    color: "#8a6142",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
  },
  button: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 15,
    backgroundColor: "#e8845a",
    marginTop: 22,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#f6e9dc",
    padding: 12,
    marginTop: 20,
  },
  privacyText: {
    flex: 1,
    color: "#6f4a30",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
});
