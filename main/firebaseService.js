window.firebaseService = {
  getAllProverbs: async function () {
    try {
      const db = window.firebase.firestore();
      const proverbsCollection = await db.collection("meranaw_proverb").get();

      if (proverbsCollection.empty) {
        console.log("No proverbs found");
        return [];
      }

      return proverbsCollection.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.meranaw_proverb || "",
          literalMeaning: data.literal_translation_meranaw || "",
          translation: data.english_translation || "",
          theme: data.theme || "general",
        };
      });
    } catch (error) {
      console.error("Error getting proverbs:", error);
      throw error;
    }
  },

  // Get proverbs filtered by theme
  getProverbsByTheme: async function (themeKey) {
    try {
      const db = window.firebase.firestore();

      // Updated theme mapping to match actual database values
      const themeMapping = {
        leadership: "Leadership",
        conflict_resolution: "Conflict Resolution",
        argumentation: "Argumentation",
        death_sermon: "Death Sermon",
        courtship_marriage: "Courtship/Marriage",
        moral_teaching: "Moral Teaching and Self -Reflection",
        enthronement_genealogy: "Enthronment/Genealogy",
      };

      const themeName = themeMapping[themeKey] || themeKey;
      console.log(`Searching for proverbs with theme: ${themeName}`);

      // Fetch all proverbs and filter manually with improved filtering
      const allProverbsSnapshot = await db.collection("meranaw_proverb").get();

      const matchingDocs = allProverbsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        if (!data.theme) return false;

        // Check if theme contains the search term (either exactly or as part of compound theme)
        return (
          data.theme === themeName ||
          data.theme.includes(themeName) ||
          // For compound themes like "Moral Teaching and Self -Reflection/Leadership"
          (themeName === "Moral Teaching and Self -Reflection" &&
            data.theme.startsWith("Moral Teaching and Self -Reflection")) ||
          (themeName === "Enthronement/Genealogy" &&
            data.theme.startsWith("Enthronement/Genealogy"))
        );
      });

      return matchingDocs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.meranaw_proverb || "",
          literalMeaning: data.literal_translation_meranaw || "",
          translation: data.english_translation || "",
          theme: data.theme || "general",
        };
      });
    } catch (error) {
      console.error(`Error getting proverbs for theme ${themeKey}:`, error);
      throw error;
    }
  },

  // Get a single proverb by ID
  getProverbById: async function (proverbId) {
    try {
      const db = window.firebase.firestore();
      const proverbDoc = await db
        .collection("meranaw_proverb")
        .doc(proverbId)
        .get();

      if (!proverbDoc.exists) {
        console.log("No proverb found with ID:", proverbId);
        return null;
      }

      const data = proverbDoc.data();
      return {
        id: proverbDoc.id,
        text: data.meranaw_proverb || "",
        literalMeaning: data.literal_translation_meranaw || "",
        translation: data.english_translation || "",
        theme: data.theme || "general",
      };
    } catch (error) {
      console.error("Error getting proverb:", error);
      throw error;
    }
  },

  // Search for proverbs by text or translation
  searchProverbs: async function (searchTerm) {
    try {
      const db = window.firebase.firestore();
      const searchTermLower = searchTerm.toLowerCase();

      // Get all proverbs (Firestore doesn't support case-insensitive search)
      const proverbsCollection = await db.collection("meranaw_proverb").get();

      if (proverbsCollection.empty) {
        return [];
      }

      // Filter proverbs client-side
      const results = proverbsCollection.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.meranaw_proverb || "",
            literalMeaning: data.literal_translation_meranaw || "",
            translation: data.english_translation || "",
            theme: data.theme || "general",
          };
        })
        .filter((proverb) => {
          // Check if the search term appears in the proverb text or translation
          return (
            proverb.text.toLowerCase().includes(searchTermLower) ||
            proverb.translation.toLowerCase().includes(searchTermLower) ||
            proverb.literalMeaning.toLowerCase().includes(searchTermLower)
          );
        });

      return results;
    } catch (error) {
      console.error("Error searching proverbs:", error);
      throw error;
    }
  },

  // Add a new proverb contribution
  addProverbContribution: async function (contributionData) {
    try {
      const db = window.firebase.firestore();

      // Add timestamp and status
      const contribution = {
        meranaw_proverb: contributionData.text,
        literal_translation_meranaw: contributionData.literalMeaning,
        english_translation: contributionData.translation,
        theme: contributionData.theme,
        source: contributionData.source,
        status: "pending", // Contributions start as pending until approved
        created_at: window.firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Add to contributions collection instead of directly to proverbs
      await db.collection("contributions").add(contribution);

      console.log("Contribution added successfully");
      return true;
    } catch (error) {
      console.error("Error adding contribution:", error);
      throw error;
    }
  },

  // Helper method to format proverb results
  _formatProverbResults: function (querySnapshot) {
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.meranaw_proverb || "",
        literalMeaning: data.literal_translation_meranaw || "",
        translation: data.english_translation || "",
        theme: data.theme || "general",
      };
    });
  },
  getProverbs: async function () {
    return await this.getAllProverbs();
  },
};

// Additional initialization for the Firebase service
document.addEventListener("DOMContentLoaded", function () {
  // Check for Firebase availability and initialize service
  const checkFirebaseInterval = setInterval(() => {
    if (window.firebase && window.firebase.firestore) {
      console.log("Firebase service initialized");
      clearInterval(checkFirebaseInterval);
    }
  }, 200);

  // Give up after 10 seconds
  setTimeout(() => {
    clearInterval(checkFirebaseInterval);
    if (!window.firebase || !window.firebase.firestore) {
      console.error("Firebase failed to initialize after timeout");
    }
  }, 10000);
});
