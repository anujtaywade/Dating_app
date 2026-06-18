import React from "react";
import { Text } from "react-native";
import { Field } from "./FormControls";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateField } from "./types";

type Props = {
  form: FormState;
  updateField: UpdateField;
};

export function LocationStep({ form, updateField }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepSub}>Your backend expects coordinates as longitude and latitude.</Text>
      <Field label="City" value={form.city} onChangeText={(value) => updateField("city", value)} />
      <Field
        label="Latitude"
        value={form.latitude}
        keyboardType="numeric"
        placeholder="28.6139"
        onChangeText={(value) => updateField("latitude", value)}
      />
      <Field
        label="Longitude"
        value={form.longitude}
        keyboardType="numeric"
        placeholder="77.2090"
        onChangeText={(value) => updateField("longitude", value)}
      />
    </>
  );
}
