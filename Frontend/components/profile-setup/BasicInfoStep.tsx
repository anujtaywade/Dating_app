import React from "react";
import { Text, View } from "react-native";
import { Field } from "./FormControls";
import { formatDobInput, getAgeFromDob } from "./dateUtils";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateField } from "./types";

type Props = {
  form: FormState;
  updateField: UpdateField;
};

export function BasicInfoStep({ form, updateField }: Props) {
  const age = getAgeFromDob(form.dob);

  return (
    <>
      <Text style={styles.stepTitle}>Your basics</Text>
      <Text style={styles.stepSub}>
        Give us the name people should see and your date of birth.
      </Text>
      <Field
        label="Display name"
        value={form.name}
        placeholder="Name people will see"
        onChangeText={(value) => updateField("name", value)}
      />
      <Field
        label="Date of birth"
        value={form.dob}
        placeholder="DD-MM-YYYY"
        keyboardType="number-pad"
        maxLength={10}
        onChangeText={(value) => updateField("dob", formatDobInput(value))}
      />
      {age !== null && (
        <View style={styles.agePill}>
          <Text style={styles.ageText}>Age {age}</Text>
        </View>
      )}
    </>
  );
}
