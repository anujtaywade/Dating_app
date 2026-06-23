import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { completeProfile, CompleteProfilePayload } from "@/services/authApi";
import { BasicInfoStep } from "@/components/profile-setup/BasicInfoStep";
import { BioCollegeStep } from "@/components/profile-setup/BioCollegeStep";
import { dobToIsoDate, isValidDob } from "@/components/profile-setup/dateUtils";
import { InterestedInStep } from "@/components/profile-setup/InterestedInStep";
import { LocationStep } from "@/components/profile-setup/LocationStep";
import { PhotosStep } from "@/components/profile-setup/PhotosStep";
import { PromptsStep } from "@/components/profile-setup/PromptsStep";
import { setupStyles as styles } from "@/components/profile-setup/setupStyles";
import {
  EducationOrWork,
  FormState,
  Gender,
  PromptResponse,
} from "@/components/profile-setup/types";

const TOTAL_STEPS = 6;

const initialForm: FormState = {
  name: "",
  dob: "",
  gender: "",
  intrestedIn: "",
  photos: Array(6).fill(""),
  bio: "",
  educationOrWork: "",
  heightFeet: "",
  heightInches: "",
  relationshipGoal: "",
  prompts: Array.from({ length: 3 }, () => ({ prompt: "", answer: "" })),
  city: "",
  latitude: "",
  longitude: "",
};

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const progress = useMemo(() => ((step + 1) / TOTAL_STEPS) * 100, [step]);

  const animateToStep = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -16,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateList = (key: "photos", index: number, value: string) => {
    setForm((current) => {
      const next = [...current[key]];
      next[index] = value;
      return { ...current, [key]: next };
    });
  };

  const updatePrompt = (index: number, value: PromptResponse) => {
    setForm((current) => {
      const next = [...current.prompts];
      next[index] = value;
      return { ...current, prompts: next };
    });
  };

  const getStepError = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Enter the display name people should see.";
      if (!isValidDob(form.dob)) return "Enter DOB as DD-MM-YYYY.";
    }

    if (step === 1) {
      if (!form.gender) return "Select your gender.";
      if (!form.intrestedIn) return "Select who you are interested in.";
    }

    if (step === 2 && !form.photos[0]?.trim()) {
      return "Add your main photo.";
    }

    if (step === 4) {
      if (form.prompts.some((item) => item.prompt && !item.answer.trim())) {
        return "Write an answer for each prompt you selected.";
      }
      const selectedPrompts = form.prompts
        .map((item) => item.prompt)
        .filter(Boolean);
      if (new Set(selectedPrompts).size !== selectedPrompts.length) {
        return "Choose a different question for each prompt.";
      }
    }

    if (step === 5) {
      if (!form.latitude || !form.longitude) {
        return "Turn on location and allow access to continue.";
      }

      const lat = Number(form.latitude);
      const lng = Number(form.longitude);

      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return "Your location could not be detected. Please refresh and try again.";
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return "Your location could not be detected. Please refresh and try again.";
      }
    }

    return "";
  };

  const handleNext = async () => {
    const validationError = getStepError();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (step < TOTAL_STEPS - 1) {
      animateToStep(step + 1);
      return;
    }

    await handleSubmit();
  };

  const handleBack = () => {
    if (step === 0 || isSaving) return;
    setError("");
    animateToStep(step - 1);
  };

  const handleSubmit = async () => {
    const heightCm =
      form.heightFeet && form.heightInches
        ? Math.round((Number(form.heightFeet) * 12 + Number(form.heightInches)) * 2.54)
        : undefined;

    const payload: CompleteProfilePayload = {
      name: form.name.trim(),
      dob: dobToIsoDate(form.dob),
      gender: form.gender as Gender,
      intrestedIn: form.intrestedIn as Gender,
      photos: form.photos.map((photo) => photo.trim()).filter(Boolean),
      ...(form.bio.trim() ? { bio: form.bio.trim() } : {}),
      ...(form.educationOrWork
        ? { educationOrWork: form.educationOrWork as EducationOrWork }
        : {}),
      heightCm,
      ...(form.relationshipGoal ? { relationshipGoal: form.relationshipGoal } : {}),
      prompts: form.prompts
        .filter(({ prompt, answer }) => prompt && answer.trim())
        .map(({ prompt, answer }) => ({
          prompt,
          answer: answer.trim(),
        })),
      location: {
        type: "Point",
        coordinates: [Number(form.longitude), Number(form.latitude)],
        city: form.city.trim(),
      },
    };

    try {
      setIsSaving(true);
      const result = await completeProfile(payload);

      if (!result.profileCompleted) {
        throw new Error("Profile saved, but required fields are still missing.");
      }

      router.replace("/(tabs)");
    } catch (submitError) {
      Alert.alert(
        "Profile setup failed",
        submitError instanceof Error ? submitError.message : "Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Profile setup</Text>
        <Text style={styles.title}>Step {step + 1} of {TOTAL_STEPS}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.panel,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {renderStep(step, form, updateField, updateList, updatePrompt)}
        </Animated.View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.secondaryButton, (step === 0 || isSaving) && styles.disabledButton]}
          onPress={handleBack}
          disabled={step === 0 || isSaving}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, isSaving && styles.disabledButton]}
          onPress={handleNext}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {step === TOTAL_STEPS - 1 ? "Save profile" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function renderStep(
  step: number,
  form: FormState,
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void,
  updateList: (key: "photos", index: number, value: string) => void,
  updatePrompt: (index: number, value: PromptResponse) => void
) {
  if (step === 0) {
    return <BasicInfoStep form={form} updateField={updateField} />;
  }

  if (step === 1) {
    return <InterestedInStep form={form} updateField={updateField} />;
  }

  if (step === 2) {
    return <PhotosStep form={form} updateList={updateList} />;
  }

  if (step === 3) {
    return <BioCollegeStep form={form} updateField={updateField} />;
  }

  if (step === 4) {
    return <PromptsStep form={form} updatePrompt={updatePrompt} />;
  }

  return <LocationStep form={form} updateField={updateField} />;
}
