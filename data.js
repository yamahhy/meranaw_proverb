const themeColors = {
  primary: "#6F1926", // Dark maroon
  secondary: "#942031", // Medium maroon
  accent: "#E5C121", // Gold
  textPrimary: "#E5C121", // Yellow
  textSecondary: "#6F1926", // Maroon
};
// Sample data for themes
const themes = [
  {
    id: 1,
    name: "Family & Relationships",
    borderColor: themeColors.primary,
    proverbs: [
      {
        id: 1,
        title: "Ped sa ama ped sa wata",
        content: "Like father, like son.",
        translation: "Children often inherit traits from their parents.",
        explanation:
          "This proverb emphasizes how children tend to adopt the behaviors, characteristics, and habits of their parents through both genetics and upbringing.",
      },
      {
        id: 2,
        title: "Da makapagolawla so marata a bok ko mapiya a pamilya",
        content: "Bad hair cannot destroy a good family.",
        translation: "One negative member cannot ruin a strong family.",
        explanation:
          "This proverb highlights the resilience of a strong family unit despite individual shortcomings.",
      },
    ],
  },
  {
    id: 2,
    name: "Wisdom & Knowledge",
    borderColor: themeColors.primary,
    proverbs: [
      {
        id: 3,
        title: "So katao na lagid o solo a di khada-dadas",
        content: "Knowledge is like a torch that never fades.",
        translation:
          "Education and wisdom are permanent possessions that cannot be taken away.",
        explanation:
          "Unlike material wealth, knowledge stays with a person throughout their life and can never be stolen.",
      },
      {
        id: 4,
        title: "So mapiya a katharo na lagid o margan a pamomolan",
        content: "Good words are like precious plants.",
        translation: "Wise speech is valuable like rare plants.",
        explanation:
          "This proverb teaches the importance of speaking thoughtfully and with wisdom.",
      },
    ],
  },
  {
    id: 3,
    name: "Work & Effort",
    borderColor: themeColors.secondary,
    proverbs: [
      {
        id: 5,
        title: "Kena o bagr i mala ko kasabar",
        content: "Not strength but patience is mighty.",
        translation: "Patience is more powerful than physical strength.",
        explanation:
          "This proverb emphasizes the value of patience and perseverance over brute force.",
      },
      {
        id: 6,
        title: "So kapamagogopa na makagaga ko madakl a palapa",
        content: "Cooperation can lift heavy burdens.",
        translation: "Working together makes difficult tasks easier.",
        explanation:
          "This proverb highlights the importance of community effort and cooperation.",
      },
    ],
  },
  {
    id: 4,
    name: "Character & Virtue",
    borderColor: themeColors.secondary,
    proverbs: [
      {
        id: 7,
        title: "So mapiya a adat na lagid o tamok a di madadag",
        content: "Good character is like wealth that cannot be destroyed.",
        translation: "Moral character is an enduring and invaluable asset.",
        explanation:
          "This proverb teaches that good character remains valuable regardless of circumstances.",
      },
      {
        id: 8,
        title: "So barasalang na maplk a kayo a di mapiya ipagolang",
        content: "Deceit is like a crooked wood not good for building.",
        translation: "Dishonesty creates a weak foundation.",
        explanation:
          "This proverb warns against using dishonesty as a basis for any endeavor.",
      },
    ],
  },
  {
    id: 5,
    name: "Nature & Life",
    borderColor: themeColors.accent,
    proverbs: [
      {
        id: 9,
        title: "So kababaloy o kaoy na pkhailaan ko ngari iyan",
        content: "A tree is known by its fruit.",
        translation: "People are judged by their actions, not their words.",
        explanation:
          "This proverb emphasizes that one's true character is revealed through their actions.",
      },
      {
        id: 10,
        title: "So mapiya a paratiya na lagid o odan ko masa a maramig",
        content: "Good faith is like rain in the dry season.",
        translation: "Trust is precious and valuable in difficult times.",
        explanation:
          "This proverb highlights how important trust becomes during challenging periods.",
      },
    ],
  },
  {
    id: 6,
    name: "Community & Society",
    borderColor: themeColors.accent,
    proverbs: [
      {
        id: 11,
        title: "Aya ipkhababaya o taw na ipkhababaya niyan ko pagari niyan",
        content: "What one wishes for himself, he should wish for his brother.",
        translation: "Treat others as you wish to be treated.",
        explanation:
          "This proverb teaches the golden rule of reciprocity and community harmony.",
      },
      {
        id: 12,
        title: "So bangsa a di phagosaya na matay",
        content: "A nation that does not unite will perish.",
        translation: "Unity is essential for community survival.",
        explanation:
          "This proverb emphasizes the importance of social cohesion and cooperation.",
      },
    ],
  },
];
