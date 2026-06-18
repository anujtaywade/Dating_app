import React from "react";
import { Text } from "react-native";
import { Field } from "./FormControls";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateList } from "./types";

type Props = {
  form: FormState;
  updateList: UpdateList;
};

export function PromptsStep({ form, updateList }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Prompts</Text>
      <Text style={styles.stepSub}>Answer at least 3 prompts so matches have something to open with.</Text>
      {form.prompts.map((prompt, index) => (
        <Field
          key={index}
          label={`Prompt ${index + 1}`}
          value={prompt}
          multiline
          inputStyle={styles.promptInput}
          onChangeText={(value) => updateList("prompts", index, value)}
        />
      ))}
    </>
  );
}
