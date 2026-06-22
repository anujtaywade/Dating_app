import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  PROMPT_CATEGORIES,
  PROMPT_OPTIONS,
  PromptCategory,
} from "./promptOptions";
import { setupStyles as styles } from "./setupStyles";
import { FormState, PromptResponse } from "./types";

const MAX_ANSWER_LENGTH = 160;

const categoryMeta: Record<
  PromptCategory,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; background: string }
> = {
  Funny: { icon: "happy-outline", color: "#b76821", background: "#fff0d9" },
  Flirty: { icon: "heart-outline", color: "#cc506b", background: "#ffe8ee" },
  Travel: { icon: "airplane-outline", color: "#347d79", background: "#e3f4f1" },
  Relationship: { icon: "people-outline", color: "#7157a5", background: "#eee8fa" },
};

type Props = {
  form: FormState;
  updatePrompt: (index: number, value: PromptResponse) => void;
};

export function PromptsStep({ form, updatePrompt }: Props) {
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);
  const answeredCount = form.prompts.filter(
    (item) => item.prompt && item.answer.trim()
  ).length;

  const selectedPrompts = useMemo(
    () => new Set(form.prompts.map((item) => item.prompt).filter(Boolean)),
    [form.prompts]
  );

  const closePicker = () => setActivePromptIndex(null);

  const selectPrompt = (prompt: string) => {
    if (activePromptIndex === null) return;

    const current = form.prompts[activePromptIndex];
    const usedElsewhere = form.prompts.some(
      (item, index) => index !== activePromptIndex && item.prompt === prompt
    );

    if (usedElsewhere) return;

    updatePrompt(activePromptIndex, {
      prompt,
      answer: current.prompt === prompt ? current.answer : "",
    });
    closePicker();
  };

  return (
    <>
      <View style={localStyles.headingRow}>
        <View style={localStyles.headingCopy}>
          <Text style={styles.stepTitle}>Show your personality</Text>
          <Text style={styles.stepSub}>
            Optional: answer up to three different prompts to give people something to reply to.
          </Text>
        </View>
        <View style={localStyles.progressBadge}>
          <Ionicons name="sparkles" size={15} color="#e8845a" />
          <Text style={localStyles.progressBadgeText}>{answeredCount}/3</Text>
        </View>
      </View>

      {form.prompts.map((item, index) => (
        <View
          key={index}
          style={[
            localStyles.promptCard,
            item.prompt && localStyles.promptCardSelected,
          ]}
        >
          <View style={localStyles.cardTopRow}>
            <View style={localStyles.numberBadge}>
              <Text style={localStyles.numberBadgeText}>{index + 1}</Text>
            </View>
            <Text style={localStyles.cardEyebrow}>PROMPT {index + 1}</Text>
            {item.prompt && item.answer.trim() ? (
              <Ionicons name="checkmark-circle" size={22} color="#4f9b79" />
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Choose question for prompt ${index + 1}`}
            onPress={() => setActivePromptIndex(index)}
            style={({ pressed }) => [
              localStyles.questionButton,
              pressed && localStyles.pressed,
            ]}
          >
            <View style={localStyles.questionCopy}>
              <Text
                style={[
                  localStyles.questionText,
                  !item.prompt && localStyles.questionPlaceholder,
                ]}
              >
                {item.prompt || "Choose a prompt"}
              </Text>
              {!item.prompt ? (
                <Text style={localStyles.questionHint}>Browse 28 conversation starters</Text>
              ) : null}
            </View>
            <View style={localStyles.chevronCircle}>
              <Ionicons name="chevron-down" size={18} color="#8a6142" />
            </View>
          </Pressable>

          {item.prompt ? (
            <View style={localStyles.answerWrap}>
              <TextInput
                accessibilityLabel={`Answer for prompt ${index + 1}`}
                multiline
                maxLength={MAX_ANSWER_LENGTH}
                placeholder="Write your answer here..."
                placeholderTextColor="#b48a66"
                style={localStyles.answerInput}
                textAlignVertical="top"
                value={item.answer}
                onChangeText={(answer) => updatePrompt(index, { ...item, answer })}
              />
              <Text
                style={[
                  localStyles.characterCount,
                  item.answer.length >= MAX_ANSWER_LENGTH && localStyles.characterCountFull,
                ]}
              >
                {item.answer.length}/{MAX_ANSWER_LENGTH}
              </Text>
            </View>
          ) : (
            <View style={localStyles.answerLocked}>
              <Ionicons name="create-outline" size={17} color="#b48a66" />
              <Text style={localStyles.answerLockedText}>
                Select a prompt to unlock your answer
              </Text>
            </View>
          )}
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={activePromptIndex !== null}
        onRequestClose={closePicker}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={localStyles.modalRoot}
        >
          <Pressable style={localStyles.backdrop} onPress={closePicker} />
          <View style={localStyles.sheet}>
            <View style={localStyles.sheetHandle} />
            <View style={localStyles.sheetHeader}>
              <View>
                <Text style={localStyles.sheetTitle}>Choose your prompt</Text>
                <Text style={localStyles.sheetSubtitle}>
                  Used prompts are unavailable
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close prompt picker"
                hitSlop={10}
                onPress={closePicker}
                style={localStyles.closeButton}
              >
                <Ionicons name="close" size={22} color="#5c351d" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={localStyles.promptList}
              showsVerticalScrollIndicator={false}
            >
              {PROMPT_CATEGORIES.map((category) => {
                const meta = categoryMeta[category];
                return (
                  <View key={category} style={localStyles.categorySection}>
                    <View style={localStyles.categoryHeader}>
                      <View
                        style={[
                          localStyles.categoryIcon,
                          { backgroundColor: meta.background },
                        ]}
                      >
                        <Ionicons name={meta.icon} size={17} color={meta.color} />
                      </View>
                      <Text style={[localStyles.categoryTitle, { color: meta.color }]}>
                        {category}
                      </Text>
                    </View>

                    {PROMPT_OPTIONS.filter((option) => option.category === category).map(
                      (option) => {
                        const isCurrent =
                          activePromptIndex !== null &&
                          form.prompts[activePromptIndex]?.prompt === option.text;
                        const isUsed = selectedPrompts.has(option.text) && !isCurrent;

                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isUsed, selected: isCurrent }}
                            disabled={isUsed}
                            key={option.text}
                            onPress={() => selectPrompt(option.text)}
                            style={({ pressed }) => [
                              localStyles.promptOption,
                              isCurrent && localStyles.promptOptionCurrent,
                              isUsed && localStyles.promptOptionUsed,
                              pressed && !isUsed && localStyles.pressed,
                            ]}
                          >
                            <Text
                              style={[
                                localStyles.promptOptionText,
                                isUsed && localStyles.promptOptionTextUsed,
                              ]}
                            >
                              {option.text}
                            </Text>
                            {isCurrent ? (
                              <Ionicons name="checkmark-circle" size={21} color="#e8845a" />
                            ) : isUsed ? (
                              <Text style={localStyles.usedLabel}>USED</Text>
                            ) : (
                              <Ionicons name="add-circle-outline" size={21} color="#b48a66" />
                            )}
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headingCopy: {
    flex: 1,
  },
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f0cbb7",
    backgroundColor: "#fff8f1",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  progressBadgeText: {
    color: "#8a4c31",
    fontSize: 12,
    fontWeight: "900",
  },
  promptCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#ecd9c6",
    backgroundColor: "#fffaf4",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#5c351d",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  promptCardSelected: {
    borderColor: "#eab392",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbe6d8",
  },
  numberBadgeText: {
    color: "#c9663f",
    fontSize: 12,
    fontWeight: "900",
  },
  cardEyebrow: {
    flex: 1,
    color: "#a07050",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 8,
  },
  questionButton: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#fdf1e6",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  questionCopy: {
    flex: 1,
    paddingRight: 10,
  },
  questionText: {
    color: "#3e2414",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  questionPlaceholder: {
    color: "#8a6142",
  },
  questionHint: {
    color: "#b07c59",
    fontSize: 11,
    marginTop: 3,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf4",
  },
  answerWrap: {
    position: "relative",
    marginTop: 12,
  },
  answerInput: {
    minHeight: 98,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e8d0b8",
    backgroundColor: "#ffffff",
    color: "#2d1a0e",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 30,
  },
  characterCount: {
    position: "absolute",
    right: 12,
    bottom: 9,
    color: "#b48a66",
    fontSize: 11,
    fontWeight: "700",
  },
  characterCountFull: {
    color: "#c84b2f",
  },
  answerLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 4,
    marginTop: 12,
  },
  answerLockedText: {
    color: "#a07050",
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.72,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 26, 14, 0.42)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#fffaf4",
    paddingTop: 10,
    overflow: "hidden",
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#ddc4ad",
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0dcc8",
  },
  sheetTitle: {
    color: "#2d1a0e",
    fontSize: 21,
    fontWeight: "900",
  },
  sheetSubtitle: {
    color: "#8a6142",
    fontSize: 12,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6e9dc",
  },
  promptList: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 42 : 26,
  },
  categorySection: {
    marginBottom: 22,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  promptOption: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ecd9c6",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },
  promptOptionCurrent: {
    borderColor: "#e8845a",
    backgroundColor: "#fff3eb",
  },
  promptOptionUsed: {
    backgroundColor: "#f4eee8",
    borderColor: "#e7ddd4",
  },
  promptOptionText: {
    flex: 1,
    color: "#4a2d1a",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  promptOptionTextUsed: {
    color: "#ad9b8d",
  },
  usedLabel: {
    color: "#9d8b7c",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
});
