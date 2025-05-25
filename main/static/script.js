const API_BASE_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
  initApp(); // Call initApp directly on DOMContentLoaded
});

async function waitForFirebase() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50;
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.firebase && window.firebase.firestore) {
        clearInterval(interval);
        resolve();
      }
      if (++attempts > maxAttempts) {
        clearInterval(interval);
        reject("Firebase failed to load in time");
      }
    }, 200);
  });
}

async function initApp() {
  try {
    await waitForFirebase(); // Wait until Firebase is ready
    if (!window.firebaseService || !window.firebaseService.getProverbs) {
      console.error("Firebase service not available after wait");
      // Retry initApp after a delay if service is not ready
      setTimeout(initApp, 500); // Shorter retry for faster startup
      return;
    }

    window.firebaseService.listenForProverbChanges((updatedProverbs) => {
      allProverbs = updatedProverbs;
      displayDashboard(); // Or redisplay the current active view (dashboard or list)
      console.log("Proverbs updated in real-time!");
    });

    // Initialize activeFilters with all themes if they aren't already set
    if (activeFilters.size === 0) {
      activeFilters = new Set(Object.keys(themes));
    }

    setupEventListeners(); // Set up event listeners after DOM is ready and elements are obtained
    displayDashboard();
  } catch (err) {
    console.error("Failed to initialize Firebase-dependent app logic:", err);
    showNotification("Failed to load Firebase. Please refresh.");
    // Retry initApp after a delay if loading failed
    setTimeout(initApp, 1000);
  }
}

// Declare DOM elements and global variables at a broader scope
const sidebar = document.getElementById("sidebar");
const proverbModal = document.getElementById("proverbModal");
const interpretationContainer = document.getElementById(
  "interpretationContainer"
);
const contributionModal = document.getElementById("contributionModal");
const contributionForm = document.getElementById("contributeForm");
const notification = document.getElementById("notification");
const notificationMessage = document.querySelector("#notification div p");
const menuToggle = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const closeProverbModalBtn = document.getElementById("closeProverbModal");
const closeContributionBtn = document.getElementById("closeContribution");
const filterBtn = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("filterDropdown");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const dashboardView = document.getElementById("dashboardView");
const proverbListView = document.getElementById("proverbListView");
const backToDashboardBtn = document.getElementById("backToDashboard");
const themeTitle = document.getElementById("themeTitle");
const proverbListContainer = proverbListView
  ? proverbListView.querySelector(".space-y-4")
  : null;
const contributeBtn = document.getElementById("contributeBtn");
const interpretBtn = document.getElementById("interpretBtn");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResultsView = document.getElementById("searchResultsView");
const searchResults = document.getElementById("searchResults");
const noResults = document.getElementById("noResults");
const backFromSearch = document.getElementById("backFromSearch");
const clearSearch = document.getElementById("clearSearch");
const proverbId = document.getElementById("proverbId");

let allProverbs = [];
let filteredProverbs = []; // This variable is not actively used in the current display logic but can be useful for future filtering features.
let activeFilters = new Set();

const themes = {
  leadership: {
    title: "Leadership",
    class: "leadership-box",
    color: "rgb(111, 25, 38)",
    bgColor: "rgba(111, 25, 38, 0.05)",
  },
  conflict_resolution: {
    title: "Conflict Resolution",
    class: "conflict-resolution-box",
    color: "#9b7f00",
    bgColor: "rgba(229, 193, 33, 0.05)",
  },
  argumentation: {
    title: "Argumentation",
    class: "argumentation-box",
    color: "rgb(148, 32, 49)",
    bgColor: "rgba(148, 32, 49, 0.05)",
  },
  death_sermon: {
    title: "Death Sermon",
    class: "death-sermon-box",
    color: "#9b7f00",
    bgColor: "rgba(229, 193, 33, 0.05)",
  },
  enthronement_genealogy: {
    title: "Enthronement & Genealogy",
    class: "enthronement-genealogy-box",
    color: "rgb(111, 25, 38)",
    bgColor: "rgba(111, 25, 38, 0.05)",
  },
  courtship_marriage: {
    title: "Courtship & Marriage",
    class: "courtship-marriage-box",
    color: "#9b7f00",
    bgColor: "rgba(229, 193, 33, 0.05)",
  },
  moral_teaching: {
    title: "Moral Teaching & Self-Reflection",
    class: "moral-teaching-box",
    color: "rgb(148, 32, 49)",
    bgColor: "rgba(148, 32, 49, 0.05)",
  },
};

function setupEventListeners() {
  // Ensure elements exist before adding listeners
  if (menuToggle) menuToggle.addEventListener("click", toggleSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
  if (closeProverbModalBtn)
    closeProverbModalBtn.addEventListener("click", closeProverbModal);
  if (closeContributionBtn)
    closeContributionBtn.addEventListener("click", closeContribution);
  if (filterBtn) filterBtn.addEventListener("click", toggleFilterDropdown);
  if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", applyFilters);
  if (backToDashboardBtn)
    backToDashboardBtn.addEventListener("click", goBackToDashboard);
  if (contributeBtn) {
    contributeBtn.addEventListener("click", function () {
      if (contributionModal) {
        contributionModal.classList.remove("hidden");
        // Close sidebar when opening modal
        if (sidebar) {
          sidebar.classList.add("translate-x-full");
          sidebar.classList.remove("translate-x-0");
        }
      }
    });
  }
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") performSearch();
  });
  backFromSearch.addEventListener("click", resetSearchView);
  clearSearch.addEventListener("click", resetSearchView);

  const btn = document.getElementById("interpretBtn");
  btn.addEventListener("click", async () => {
    const proverbData = {
      meranaw: "...",
      english_translation: "...",
      literal_meaning: "...",
    };
    try {
      const result = await generateInterpretation(proverbData);
      console.log(result);
      // update UI with result
    } catch (e) {
      console.error(e);
    }
  });
  if (contributionForm) {
    contributionForm.addEventListener("submit", handleContributionSubmit);
  }
  if (searchInput) {
    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }
  if (interpretBtn)
    interpretBtn.addEventListener("click", generateInterpretation);

  function toggleSidebar() {
    if (sidebar) {
      sidebar.classList.toggle("translate-x-full");
      sidebar.classList.toggle("translate-x-0");
      sidebar.classList.toggle("open"); // Keep consistent with CSS class
    }
  }

  function closeSidebar() {
    if (sidebar) {
      sidebar.classList.add("translate-x-full");
      sidebar.classList.remove("translate-x-0");
      sidebar.classList.remove("open");
    }
  }

  function closeProverbModal() {
    if (proverbModal) {
      proverbModal.classList.add("hidden");
      proverbModal.style.display = "none"; // Ensure it's fully hidden
    }
    if (interpretationContainer) {
      interpretationContainer.classList.add("hidden");
    }
    const interpretationTextElement =
      document.getElementById("interpretationText");
    if (interpretationTextElement) {
      interpretationTextElement.textContent = ""; // Clear interpretation
    }
  }

  function closeContribution() {
    if (contributionModal) {
      contributionModal.classList.add("hidden");
    }
    if (contributionForm) {
      contributionForm.reset();
    }
  }

  function toggleFilterDropdown() {
    if (filterDropdown) {
      filterDropdown.classList.toggle("hidden");
    }
  }

  function applyFilters() {
    const checkboxes = document.querySelectorAll(
      '#filterDropdown input[type="checkbox"]:checked'
    );
    activeFilters.clear(); // Clear existing filters
    checkboxes.forEach((cb) => activeFilters.add(cb.value));

    console.log("Active Filters:", Array.from(activeFilters));
    // Filter the allProverbs array based on activeFilters
    const currentlyFiltered = allProverbs.filter((proverb) =>
      activeFilters.has(proverb.theme)
    );

    displayProverbs(currentlyFiltered, "Filtered Results"); // Display filtered proverbs
    toggleFilterDropdown(); // Close dropdown after applying filters
    // Show proverb list view and hide dashboard
    dashboardView.classList.add("hidden");
    proverbListView.classList.remove("hidden");
  }

  // Theme box click listeners (delegated)
  const dashboard = document.getElementById("dashboardView");
  if (dashboard) {
    dashboard.addEventListener("click", async function (event) {
      const themeBox = event.target.closest(".theme-box");
      if (themeBox) {
        const theme = themeBox.dataset.theme;
        if (theme) {
          try {
            showNotification(`Loading proverbs for ${themes[theme].title}...`);
            const proverbs = await window.firebaseService.getProverbsByTheme(
              theme
            );
            allProverbs = proverbs;
            displayProverbs(proverbs, themes[theme].title);
            dashboardView.classList.add("hidden");
            proverbListView.classList.remove("hidden");
            showNotification(
              `Displaying ${proverbs.length} proverbs for ${themes[theme].title}.`
            );
          } catch (error) {
            console.error("Error fetching themed proverbs:", error);
            showNotification("Failed to load themed proverbs.");
          }
        }
      }
    });
  }
}

function displayDashboard() {
  const dashboardView = document.getElementById("dashboardView");
  const proverbListView = document.getElementById("proverbListView");
  const themeTitle = document.getElementById("themeTitle");

  dashboardView.innerHTML = "";
  proverbListView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  themeTitle.textContent = "Meranaw Proverbs";

  Object.keys(themes).forEach((key) => {
    const theme = themes[key];
    const box = document.createElement("div");
    box.className = `theme-box ${theme.class} rounded p-6 flex items-center justify-center cursor-pointer`;
    box.dataset.theme = key;
    box.innerHTML = `<h2 class="text-xl font-semibold">${theme.title}</h2>`;
    box.addEventListener("click", async () => {
      try {
        const proverbs = await window.firebaseService.getProverbsByTheme(key);
        themeTitle.textContent = theme.title;
        displayProverbs(proverbs, theme.title);
        dashboardView.classList.add("hidden");
        proverbListView.classList.remove("hidden");
      } catch (e) {
        console.error("Error loading proverbs for theme", key, e);
      }
    });
    dashboardView.appendChild(box);
  });
}

// function displayProverbs(proverbs, containerId) {
//   const container = document.getElementById(containerId);
//   if (!container) {
//     console.error(`Container with ID "${containerId}" not found.`);
//     return;
//   }
//   container.innerHTML = ""; // Clear existing proverbs
//   if (proverbs.length === 0) {
//     container.innerHTML = `<p class="text-center text-gray-500">No proverbs found for the selected filters or search query.</p>`;
//   } else {
//     proverbs.forEach((proverb) => {
//       container.appendChild(createProverbCard(proverb));
//     });
//   }
//   proverbs.forEach((proverb) => {
//     const proverbDiv = document.createElement("div");
//     proverbDiv.classList.add(
//       "bg-white",
//       "rounded-lg",
//       "shadow-md",
//       "p-6",
//       "cursor-pointer" // Add cursor-pointer for better UX
//     );
//     proverbDiv.innerHTML = `
//     <h3 class="text-lg font-semibold text-primary mb-2">${proverb.meranaw}</h3>
//     <p class="text-gray-700 italic">${proverb.literal_meaning}</p>
//   `;
//     // Add this line to make the proverb clickable:
//     proverbDiv.addEventListener("click", () => {
//       showProverbDetails(proverb.id);
//     });
//     proverbListContainer.appendChild(proverbDiv);
//   });
// }

function displayProverbs(proverbs, title) {
  const proverbListContainer = document.querySelector(
    "#proverbListView .space-y-4"
  );
  const themeTitle = document.getElementById("themeTitle");

  themeTitle.textContent = title;
  proverbListContainer.innerHTML = "";

  if (proverbs.length === 0) {
    proverbListContainer.innerHTML =
      '<p class="text-gray-500 text-center">No proverbs found.</p>';
    return;
  }

  proverbs.forEach((proverb) => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg shadow-md p-6 cursor-pointer";
    div.innerHTML = `
      <h3 class="text-lg font-semibold text-primary mb-2">${proverb.meranaw}</h3>
      <p class="text-gray-700 italic">${proverb.literal_meaning}</p>
    `;
    div.addEventListener("click", () => {
      showProverbDetails(proverb.id);
    });
    proverbListContainer.appendChild(div);
  });
}

// Rename this one to be more specific
function displayThemeProverbs(proverbs, title) {
  const proverbListContainer = document.querySelector(
    "#proverbListView .space-y-4"
  );
  const themeTitle = document.getElementById("themeTitle");

  themeTitle.textContent = title;
  proverbListContainer.innerHTML = "";

  if (proverbs.length === 0) {
    proverbListContainer.innerHTML =
      '<p class="text-gray-500 text-center">No proverbs found.</p>';
    return;
  }

  proverbs.forEach((proverb) => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg shadow-md p-6 cursor-pointer";
    div.innerHTML = `
      <h3 class="text-lg font-semibold text-primary mb-2">${proverb.meranaw}</h3>
      <p class="text-gray-700 italic">${proverb.literal_meaning}</p>
    `;
    div.addEventListener("click", () => {
      showProverbDetails(proverb.id); // Pass the full object, not just ID
    });
    proverbListContainer.appendChild(div);
  });
}

box.addEventListener("click", async () => {
  try {
    const proverbs = await window.firebaseService.getProverbsByTheme(key);
    themeTitle.textContent = theme.title;
    displayThemeProverbs(proverbs, theme.title);
    dashboardView.classList.add("hidden");
    proverbListView.classList.remove("hidden");
  } catch (e) {
    console.error("Error loading proverbs for theme", key, e);
  }
});

function showProverbDetails(proverbId) {
  console.log("Clicked proverb ID:", proverbId);
  console.log("Current allProverbs array:", allProverbs);

  const proverb = allProverbs.find((p) => p.id === proverbId);
  console.log("Matched proverb:", proverb);

  if (!proverb) {
    console.warn("Proverb not found for ID:", proverbId);
    return;
  }

  document.getElementById("proverbId").textContent = proverb.id;
  document.getElementById("proverbText").textContent = proverb.meranaw;
  document.getElementById("literalMeaning").textContent =
    proverb.literal_meaning;
  document.getElementById("englishTranslation").textContent =
    proverb.english_translation;

  document.getElementById("interpretationContainer").classList.add("hidden");
  document.getElementById("interpretationText").textContent = "";

  const modal = document.getElementById("proverbModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "block"; // optional for visibility
  }
}

function goBackToDashboard() {
  displayDashboard();
  if (searchInput) searchInput.value = ""; // Clear search input
}

function closeContribution() {
  if (contributionModal) {
    contributionModal.classList.add("hidden");
  }
  if (contributionForm) {
    contributionForm.reset();
  }
}

async function handleContributionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(contributionForm);
  const newProverb = {
    meranaw: formData.get("meranaw"),
    literal_translation: formData.get("literal_translation"),
    english_translation: formData.get("english_translation"),
    theme: formData.get("theme"),
  };

  try {
    const success = await window.firebaseService.addContribution(newProverb); // This line sends data to Firebase
    if (success) {
      showNotification("Contribution added successfully!");
      contributionForm.reset();
      closeContribution();
      // Optionally re-fetch all proverbs to update local data after contribution
      allProverbs = await window.firebaseService.getProverbs();
      displayDashboard(); // Refresh dashboard or current view
    } else {
      showNotification("Failed to add contribution.");
    }
  } catch (error) {
    console.error("Error submitting contribution:", error);
    showNotification("Error submitting contribution.");
  }
}

function showNotification(message) {
  if (notification && notificationMessage) {
    notificationMessage.textContent = message;
    notification.classList.remove("hidden");
    notification.classList.remove("slideOut"); // Remove any previous animation classes
    notification.classList.add("notification"); // Add slideIn animation
    setTimeout(() => {
      notification.classList.add("slideOut"); // Add a class for sliding out
      notification.classList.remove("notification");
      setTimeout(() => {
        notification.classList.add("hidden");
      }, 300); // Allow time for slideOut animation to complete
    }, 5000); // Show for 5 seconds
  }
}

// async function generateInterpretation() {
//   const proverbText = document.getElementById("proverbText").textContent.trim();
//   const literalMeaning = document
//     .getElementById("literalMeaning")
//     .textContent.trim();
//   const englishTranslation = document
//     .getElementById("englishTranslation")
//     .textContent.trim();

//   const interpretationOutput = document.getElementById("interpretationText");
//   const container = document.getElementById("interpretationContainer");

//   if (interpretationOutput && container) {
//     interpretationOutput.textContent = "Generating interpretation...";
//     container.classList.remove("hidden");

//     try {
//       const response = await fetch("/api/meranaw-interpreter", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           data: [proverbText, englishTranslation, literalMeaning],
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();
//       const interpretation =
//         result.data?.[0] || "Failed to generate interpretation.";

//       interpretationOutput.textContent = interpretation;
//     } catch (error) {
//       console.error("Error generating interpretation:", error);
//       interpretationOutput.textContent = "An error occurred. Please try again.";
//     }
//   }
// }

// async function generateInterpretation(
//   meranaw,
//   english_translation,
//   interpretation
// ) {
//   try {
//     const response = await fetch(
//       "http://127.0.0.1:8000/api/meranaw-interpreter",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           data: [meranaw, english_translation, interpretation],
//         }),
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error("Error generating interpretation:", error);
//     return null;
//   }
// }

async function generateInterpretation() {
  const proverbTextElement = document.getElementById("proverbText");
  const literalMeaningElement = document.getElementById("literalMeaning"); //
  const englishTranslationElement =
    document.getElementById("englishTranslation");

  const interpretationOutput = document.getElementById("interpretationText"); //
  const container = document.getElementById("interpretationContainer"); //

  // Add null checks for robustness (as advised previously)
  if (
    !proverbTextElement ||
    !literalMeaningElement ||
    !englishTranslationElement ||
    !interpretationOutput ||
    !container
  ) {
    console.error(
      "One or more required elements for interpretation are missing in the DOM."
    );
    showNotification("Error: Necessary proverb details elements not found.");
    return;
  }

  const proverbText = proverbTextElement.textContent.trim();
  const literalMeaning = literalMeaningElement.textContent.trim(); // Use literalMeaning here
  const englishTranslation = englishTranslationElement.textContent.trim();

  if (interpretationOutput && container) {
    interpretationOutput.textContent = "Generating interpretation..."; //
    container.classList.remove("hidden"); //

    try {
      const response = await fetch(
        "http://localhost:3000/api/meranaw-interpreter", // Changed from 3000 to 8000 based on your main.py
        {
          method: "POST", //
          headers: { "Content-Type": "application/json" }, //
          body: JSON.stringify({
            data: [proverbText, englishTranslation, literalMeaning],
          }),
        }
      );

      if (!response.ok) {
        //
        throw new Error(`HTTP error! Status: ${response.status}`); //
      }

      const result = await response.json(); //
      // Rename this to generatedInterpretation to avoid conflict
      const generatedInterpretation =
        result.data?.[0] || "Failed to generate interpretation."; //

      interpretationOutput.textContent = generatedInterpretation; //
    } catch (error) {
      //
      console.error("Error generating interpretation:", error); //
      interpretationOutput.textContent = "An error occurred. Please try again."; //
    }
  }
}

const suggestionsList = document.getElementById("suggestionsList");

function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-accent/20 rounded px-0.5">$1</mark>'
  );
}

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  dashboardView.classList.add("hidden");
  searchResultsView.classList.remove("hidden");

  try {
    const response = await fetch("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Search request failed.");

    const data = await response.json();

    if (data.length > 0) {
      searchResults.innerHTML = data
        .map(
          (proverb) => `
          <div class="proverb-item p-4 border border-gray-200 rounded cursor-pointer" data-id="${
            proverb.meranaw_proverb
          }">
            <div class="flex justify-between">
              <h3 class="text-lg font-medium text-primary">${highlightText(
                proverb.meranaw_proverb,
                query
              )}</h3>
              <span class="text-xs text-gray-500">${proverb.search_type}</span>
            </div>
            <p class="text-gray-600 italic">${highlightText(
              proverb.augmented_interpretation,
              query
            )}</p>
          </div>
        `
        )
        .join("");

      // Clickable result items for modal
      searchResults.querySelectorAll(".proverb-item").forEach((item) => {
        item.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          proverbId.textContent = id;
          proverbModal.classList.remove("hidden");
        });
      });

      searchResults.classList.remove("hidden");
      noResults.classList.add("hidden");
    } else {
      searchResults.classList.add("hidden");
      noResults.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    searchResults.innerHTML =
      '<p class="text-red-500">Something went wrong. Please try again.</p>';
  }
}

function resetSearchView() {
  searchInput.value = "";
  searchResultsView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}
