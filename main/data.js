// Theme and Proverb Data Structure

export type ThemeKey =
  | "courtship/marriage"
  | "leadership"
  | "conflict resolution"
  | "argumentation"
  | "death sermon"
  | "enthronement/genealogy"
  | "moral teaching";

export interface Theme {
  id: ThemeKey;
  title: string;
  class: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  description?: string;
}

export interface Proverb {
  id: string;
  meranaw_pananaroon: string;
  literal_meaning: string;
  english_translation: string;
  theme: ThemeKey;
  source?: string;
  dateAdded?: string;
  status?: "pending" | "approved" | "rejected";
  interpretation?: string;
}

// Themes definition
export const themes: Record<ThemeKey, Theme> = {
  courtship_marriage: {
    id: "courtship_marriage",
    title: "Courtship & Marriage",
    class: "courtship-marriage-box",
    color: "#d97706",
    bgColor: "rgba(217, 119, 6, 0.05)",
    hoverColor: "rgba(217, 119, 6, 0.1)",
    description:
      "Themes related to romantic relationships, proposals, and marital values.",
  },
  leadership: {
    id: "leadership",
    title: "Leadership",
    class: "leadership-box",
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.05)",
    hoverColor: "rgba(37, 99, 235, 0.1)",
    description:
      "Proverbs that reflect leadership qualities, responsibilities, and governance.",
  },
  conflict_resolution: {
    id: "conflict_resolution",
    title: "Conflict Resolution",
    class: "conflict-resolution-box",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.05)",
    hoverColor: "rgba(220, 38, 38, 0.1)",
    description: "Addresses peacemaking, mediation, and settling disputes.",
  },
  argumentation: {
    id: "argumentation",
    title: "Argumentation",
    class: "argumentation-box",
    color: "#9333ea",
    bgColor: "rgba(147, 51, 234, 0.05)",
    hoverColor: "rgba(147, 51, 234, 0.1)",
    description: "Deals with debate, dialogue, and rhetorical wisdom.",
  },
  death_sermon: {
    id: "death_sermon",
    title: "Death Sermon",
    class: "death-sermon-box",
    color: "#1f2937",
    bgColor: "rgba(31, 41, 55, 0.05)",
    hoverColor: "rgba(31, 41, 55, 0.1)",
    description: "Reflects on mortality, remembrance, and funeral traditions.",
  },
  enthronement_genealogy: {
    id: "enthronement_genealogy",
    title: "Enthronement & Genealogy",
    class: "enthronement-genealogy-box",
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.05)",
    hoverColor: "rgba(5, 150, 105, 0.1)",
    description:
      "Proverbs related to ancestry, succession, and traditional authority.",
  },
  moral_teaching: {
    id: "moral_teaching",
    title: "Moral Teaching & Self -Reflection",
    class: "moral-teaching-box",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.05)",
    hoverColor: "rgba(245, 158, 11, 0.1)",
    description: "Encourages virtue, ethical behavior, and personal insight.",
  },
};
