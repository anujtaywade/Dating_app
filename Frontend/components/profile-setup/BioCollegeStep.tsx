import React from "react";
import { Text } from "react-native";
import {
  EducationOrWorkPicker,
  Field,
  HeightPicker,
  RelationshipGoalPicker,
} from "./FormControls";
import { setupStyles as styles } from "./setupStyles";
import { FormState, UpdateField } from "./types";

type Props = {
  form: FormState;
  updateField: UpdateField;
};

export function BioCollegeStep({ form, updateField }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>About you</Text>
      <Text style={styles.stepSub}>Add the details that help people start a real conversation.</Text>
      <Field
        label="Bio"
        value={form.bio}
        multiline
        inputStyle={styles.textArea}
        onChangeText={(value) => updateField("bio", value)}
      />
      <Text style={styles.label}>Currently</Text>
      <EducationOrWorkPicker
        value={form.educationOrWork}
        onChange={(value) => updateField("educationOrWork", value)}
      />
      <HeightPicker
        feet={form.heightFeet}
        inches={form.heightInches}
        onFeetChange={(value) => updateField("heightFeet", value)}
        onInchesChange={(value) => updateField("heightInches", value)}
      />
      <Text style={styles.label}>Relationship goal</Text>
      <RelationshipGoalPicker
        value={form.relationshipGoal}
        onChange={(value) => updateField("relationshipGoal", value)}
      />
    </>
  );
}
