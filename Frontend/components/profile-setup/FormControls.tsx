import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { setupStyles as styles } from "./setupStyles";
import { EducationOrWork, Gender, RelationshipGoal } from "./types";

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  inputStyle?: object;
};

export function Field({ label, inputStyle, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#b48a66"
        style={[styles.input, inputStyle]}
        {...props}
      />
    </View>
  );
}

export function Segmented({
  value,
  onChange,
}: {
  value: Gender | "";
  onChange: (value: Gender) => void;
}) {
  return (
    <View style={styles.segmented}>
      {(["male", "female"] as Gender[]).map((option) => {
        const isSelected = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
              {option === "male" ? "Male" : "Female"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RelationshipGoalPicker({
  value,
  onChange,
}: {
  value: RelationshipGoal | "";
  onChange: (value: RelationshipGoal) => void;
}) {
  const options: { label: string; value: RelationshipGoal }[] = [
    { label: "Long-term", value: "long-term" },
    { label: "Short-term", value: "short-term" },
    { label: "Casual", value: "casual" },
    { label: "Figuring out", value: "figuring-out" },
  ];

  return (
    <View style={styles.wrapOptions}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EducationOrWorkPicker({
  value,
  onChange,
}: {
  value: EducationOrWork | "";
  onChange: (value: EducationOrWork) => void;
}) {
  const options: { label: string; value: EducationOrWork }[] = [
    { label: "Studying", value: "studying" },
    { label: "Working", value: "working" },
  ];

  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HeightPicker({
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}: {
  feet: string;
  inches: string;
  onFeetChange: (value: string) => void;
  onInchesChange: (value: string) => void;
}) {
  const footOptions = ["4", "5", "6", "7"];
  const inchOptions = Array.from({ length: 12 }, (_, index) => String(index));
  const hasHeight = feet && inches;

  return (
    <View style={styles.heightPicker}>
      <View style={styles.heightHeader}>
        <Text style={styles.label}>Height</Text>
        <Text style={styles.heightValue}>
          {hasHeight ? `${feet}' ${inches}"` : "Select feet and inches"}
        </Text>
      </View>

      <Text style={styles.heightSubLabel}>Feet</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heightScroller}
      >
        {footOptions.map((option) => {
          const isSelected = feet === option;
          return (
            <Pressable
              key={option}
              style={[styles.heightChip, isSelected && styles.heightChipSelected]}
              onPress={() => onFeetChange(option)}
            >
              <Text style={[styles.heightChipText, isSelected && styles.heightChipTextSelected]}>
                {option} ft
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.heightSubLabel}>Inches</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heightScroller}
      >
        {inchOptions.map((option) => {
          const isSelected = inches === option;
          return (
            <Pressable
              key={option}
              style={[styles.heightChip, isSelected && styles.heightChipSelected]}
              onPress={() => onInchesChange(option)}
            >
              <Text style={[styles.heightChipText, isSelected && styles.heightChipTextSelected]}>
                {option} in
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
