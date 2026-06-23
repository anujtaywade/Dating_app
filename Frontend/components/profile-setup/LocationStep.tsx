import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  getDeviceLocation,
  LocationAccessError,
  LocationFailureReason,
  promptToEnableLocationServices,
} from "@/services/locationService";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateField } from "./types";

type LocationStatus = "loading" | "ready" | "blocked";

type Props = {
  form: FormState;
  updateField: UpdateField;
};

export function LocationStep({ form, updateField }: Props) {
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [failureReason, setFailureReason] = useState<LocationFailureReason | null>(null);
  const [message, setMessage] = useState("Finding your area...");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const updateFieldRef = useRef(updateField);
  const mountedRef = useRef(true);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    updateFieldRef.current = updateField;
  }, [updateField]);

  const requestLocation = useCallback(async () => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setStatus("loading");
    setMessage("Finding your area...");

    try {
      const location = await getDeviceLocation();
      if (!mountedRef.current) return;

      updateFieldRef.current("city", location.city);
      updateFieldRef.current("latitude", String(location.latitude));
      updateFieldRef.current("longitude", String(location.longitude));
      setDisplayName(location.displayName);
      setFailureReason(null);
      setStatus("ready");
    } catch (error) {
      if (!mountedRef.current) return;

      const locationError =
        error instanceof LocationAccessError
          ? error
          : new LocationAccessError(
              "unavailable",
              "Your location could not be detected. Please try again."
            );
      setFailureReason(locationError.reason);
      setCanAskAgain(locationError.canAskAgain);
      setMessage(locationError.message);
      setStatus("blocked");
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void requestLocation();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void requestLocation();
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
    };
  }, [requestLocation]);

  const handleAction = async () => {
    if (failureReason === "services-disabled") {
      if (Platform.OS === "android") {
        try {
          await promptToEnableLocationServices();
          await requestLocation();
          return;
        } catch {
          // Fall through to system settings when Android cannot show its provider dialog.
        }
      }

      await Linking.openSettings();
      return;
    }

    if (failureReason === "permission-denied" && !canAskAgain) {
      await Linking.openSettings();
      return;
    }

    await requestLocation();
  };

  const actionLabel =
    failureReason === "services-disabled"
      ? "Turn on location"
      : failureReason === "permission-denied" && !canAskAgain
        ? "Open app settings"
        : "Try again";

  return (
    <>
      <Text style={styles.stepTitle}>Your location</Text>
      <Text style={styles.stepSub}>
        Location is required to discover people near you. Keep it turned on while using the app.
      </Text>

      <View style={[localStyles.locationCard, status === "ready" && localStyles.readyCard]}>
        <View
          style={[
            localStyles.iconCircle,
            status === "ready" && localStyles.readyIconCircle,
          ]}
        >
          {status === "loading" ? (
            <ActivityIndicator color="#e8845a" />
          ) : (
            <Ionicons
              name={status === "ready" ? "location" : "location-outline"}
              size={30}
              color={status === "ready" ? "#ffffff" : "#c9663f"}
            />
          )}
        </View>

        {status === "ready" ? (
          <>
            <Text style={localStyles.statusLabel}>YOUR AREA</Text>
            <Text style={localStyles.locationName}>{displayName || form.city}</Text>
            <View style={localStyles.detectedRow}>
              <Ionicons name="checkmark-circle" size={17} color="#4f9b79" />
              <Text style={localStyles.detectedText}>Location detected</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={localStyles.locationName}>
              {status === "loading" ? "Checking location" : "Location needed"}
            </Text>
            <Text style={localStyles.message}>{message}</Text>
            {status === "blocked" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleAction()}
                style={({ pressed }) => [
                  localStyles.actionButton,
                  pressed && localStyles.pressed,
                ]}
              >
                <Ionicons name="navigate-outline" size={18} color="#ffffff" />
                <Text style={localStyles.actionButtonText}>{actionLabel}</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>

      <View style={localStyles.privacyNote}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#8a6142" />
        <Text style={localStyles.privacyText}>
          We display only your city or area—not your exact position. Coordinates are kept private
          and used for nearby discovery.
        </Text>
      </View>

      {status === "ready" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void requestLocation()}
          style={({ pressed }) => [localStyles.refreshButton, pressed && localStyles.pressed]}
        >
          <Ionicons name="refresh" size={17} color="#8a6142" />
          <Text style={localStyles.refreshText}>Refresh my location</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const localStyles = StyleSheet.create({
  locationCard: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#ecd3bd",
    backgroundColor: "#fffaf4",
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#5c351d",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  readyCard: {
    borderColor: "#b9d9c8",
    backgroundColor: "#f8fffb",
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbe6d8",
    marginBottom: 16,
  },
  readyIconCircle: {
    backgroundColor: "#4f9b79",
  },
  statusLabel: {
    color: "#6d9b84",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  locationName: {
    color: "#2d1a0e",
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  detectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  detectedText: {
    color: "#477c63",
    fontSize: 12,
    fontWeight: "800",
  },
  message: {
    color: "#8a6142",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#e8845a",
    paddingHorizontal: 20,
    marginTop: 18,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#f5e8db",
    padding: 14,
    marginTop: 16,
  },
  privacyText: {
    flex: 1,
    color: "#6f4a30",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  refreshButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  refreshText: {
    color: "#8a6142",
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.72,
  },
});
