export type PromptCategory = "Funny" | "Flirty" | "Travel" | "Relationship";

export type PromptOption = {
  category: PromptCategory;
  text: string;
};

// App-ready version of the prompt catalog maintained in Frontend/prompts.md.
export const PROMPT_OPTIONS: PromptOption[] = [
  { category: "Funny", text: "My most irrational fear is..." },
  { category: "Funny", text: "The weirdest thing I secretly enjoy is..." },
  { category: "Funny", text: "I'll never recover from the time I..." },
  { category: "Funny", text: "My toxic trait is..." },
  { category: "Funny", text: "The fastest way to make me laugh is..." },
  { category: "Funny", text: "My most controversial opinion is..." },
  { category: "Funny", text: "If my life were a sitcom, the title would be..." },

  { category: "Flirty", text: "The way to win me over is..." },
  { category: "Flirty", text: "Let's make sure we..." },
  { category: "Flirty", text: "I'll fall for you if..." },
  { category: "Flirty", text: "Our first date should be..." },
  { category: "Flirty", text: "You should leave a comment if..." },
  { category: "Flirty", text: "Together, we could..." },
  { category: "Flirty", text: "The greenest flag in a partner is..." },

  { category: "Travel", text: "My dream destination is..." },
  { category: "Travel", text: "The best trip I've ever taken was..." },
  { category: "Travel", text: "A place I could visit again and again is..." },
  { category: "Travel", text: "My travel personality is..." },
  { category: "Travel", text: "The first thing I pack for a trip is..." },
  { category: "Travel", text: "Let's book tickets to..." },
  { category: "Travel", text: "My ideal weekend getaway looks like..." },

  { category: "Relationship", text: "The key to a healthy relationship is..." },
  { category: "Relationship", text: "My love language is..." },
  { category: "Relationship", text: "I feel most appreciated when..." },
  { category: "Relationship", text: "The biggest green flag is..." },
  { category: "Relationship", text: "The biggest red flag is..." },
  { category: "Relationship", text: "Dating me means..." },
  { category: "Relationship", text: "I'm looking for someone who..." },
];

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Funny",
  "Flirty",
  "Travel",
  "Relationship",
];
