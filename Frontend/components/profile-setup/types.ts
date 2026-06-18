export type Gender = "male" | "female";
export type EducationOrWork = "studying" | "working";
export type RelationshipGoal = "long-term" | "short-term" | "casual" | "figuring-out";

export type FormState = {
  name: string;
  dob: string;
  gender: Gender | "";
  intrestedIn: Gender | "";
  photos: string[];
  bio: string;
  educationOrWork: EducationOrWork | "";
  heightFeet: string;
  heightInches: string;
  relationshipGoal: RelationshipGoal | "";
  prompts: string[];
  city: string;
  latitude: string;
  longitude: string;
};

export type UpdateField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

export type UpdateList = (key: "photos" | "prompts", index: number, value: string) => void;
