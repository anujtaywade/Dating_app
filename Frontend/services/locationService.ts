import { Platform } from "react-native";

type PermissionResponse = {
  granted: boolean;
  canAskAgain: boolean;
};

type GeocodedAddress = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
  country?: string | null;
};

type ExpoLocationModule = {
  Accuracy: {
    Balanced: number;
  };
  enableNetworkProviderAsync(): Promise<void>;
  getCurrentPositionAsync(options: { accuracy: number }): Promise<{
    coords: { latitude: number; longitude: number };
  }>;
  getForegroundPermissionsAsync(): Promise<PermissionResponse>;
  hasServicesEnabledAsync(): Promise<boolean>;
  requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
  reverseGeocodeAsync(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<GeocodedAddress[]>;
};

export type LocationFailureReason =
  | "services-disabled"
  | "permission-denied"
  | "unavailable";

export class LocationAccessError extends Error {
  constructor(
    public readonly reason: LocationFailureReason,
    message: string,
    public readonly canAskAgain = true
  ) {
    super(message);
    this.name = "LocationAccessError";
  }
}

function getLocationModule(): ExpoLocationModule {
  try {
    // Lazy loading prevents an outdated native client from crashing Expo Router at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-location") as ExpoLocationModule;
  } catch {
    throw new LocationAccessError(
      "unavailable",
      "Location is unavailable in this app build. Install the latest build and try again."
    );
  }
}

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  city: string;
  displayName: string;
};

function uniqueParts(parts: (string | null | undefined)[]): string[] {
  return parts.reduce<string[]>((result, value) => {
    const cleanValue = value?.trim();
    if (
      cleanValue &&
      !result.some((existing) => existing.toLowerCase() === cleanValue.toLowerCase())
    ) {
      result.push(cleanValue);
    }
    return result;
  }, []);
}

export async function getDeviceLocation(): Promise<DeviceLocation> {
  try {
    const Location = getLocationModule();
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new LocationAccessError(
        "services-disabled",
        "Turn on device location to continue."
      );
    }

    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Location.requestForegroundPermissionsAsync();
    }

    if (!permission.granted) {
      throw new LocationAccessError(
        "permission-denied",
        "Allow location access while using the app to continue.",
        permission.canAskAgain
      );
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const addresses = await Location.reverseGeocodeAsync(coordinates);
    const address = addresses[0];
    const city =
      address?.city ||
      address?.district ||
      address?.subregion ||
      address?.region ||
      "Current area";
    const displayName = uniqueParts([
      city,
      address?.region,
      address?.country,
    ]).join(", ");

    return {
      ...coordinates,
      city,
      displayName: displayName || city,
    };
  } catch (error) {
    if (error instanceof LocationAccessError) throw error;

    throw new LocationAccessError(
      "unavailable",
      error instanceof Error
        ? error.message
        : "Your location could not be detected. Please try again."
    );
  }
}

export async function promptToEnableLocationServices(): Promise<void> {
  if (Platform.OS !== "android") return;
  const Location = getLocationModule();
  await Location.enableNetworkProviderAsync();
}
