import React from "react";
import { Text } from "react-native";
import { Segmented } from "./FormControls";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateField } from "./types";

type Props = {
  form: FormState;
  updateField: UpdateField;
};

export function InterestedInStep({ form, updateField }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Who should you meet?</Text>
      <Text style={styles.stepSub}>Choose your gender and who you are interested in seeing on discovery.</Text>
      <Text style={styles.label}>Gender</Text>
      <Segmented value={form.gender} onChange={(value) => updateField("gender", value)} />
      <Text style={styles.label}>Interested in</Text>
      <Segmented value={form.intrestedIn} onChange={(value) => updateField("intrestedIn", value)} />
    </>
  );
}
