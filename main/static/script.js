const API_BASE_URL = "http://localhost:5000"; // Can be removed if no longer used for anything else.

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
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResultsDiv = document.getElementById("searchResults");
const dashboardView = document.getElementById("dashboardView");
const proverbListView = document.getElementById("proverbListView");
const backToDashboardBtn = document.getElementById("backToDashboard");
const themeTitle = document.getElementById("themeTitle");
const proverbListContainer = proverbListView
  ? proverbListView.querySelector(".space-y-4")
  : null;
const contributeBtn = document.getElementById("contributeBtn");
const interpretBtn = document.getElementById("interpretBtn");

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
  if (contributionForm) {
    contributionForm.addEventListener("submit", handleContributionSubmit);
  }
  if (searchBtn) searchBtn.addEventListener("click", performSearch);
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

async function performSearch() {
  const query = searchInput.value.trim();
  const searchTerm = query.toLowerCase();
  if (!query) return;

  try {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
    const results = await response.json();

    if (!Array.isArray(results)) {
      console.error("Invalid search response:", results);
      return;
    }

    // Display results in the list view
    dashboardView.classList.add("hidden");
    proverbListView.classList.remove("hidden");
    themeTitle.textContent = `Search Results for "${query}"`;

    // Highlight matches in Meranaw, literal, and English fields
    const highlightedResults = results.map((p) => {
      return {
        ...p,
        meranaw: highlightMatch(p.meranaw, searchTerm),
        literal_meaning: highlightMatch(p.literal_meaning, searchTerm),
        english_translation: highlightMatch(p.english_translation, searchTerm),
      };
    });

    renderSearchResults(highlightedResults);
  } catch (error) {
    console.error("Search failed:", error);
    showNotification("Search error. Please try again.");
  }
}

function highlightMatch(text, term) {
  if (!text || !term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function renderSearchResults(results) {
  const container = document.querySelector("#proverbListView .space-y-4");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-center">No proverbs found.</p>';
    return;
  }

  results.forEach((proverb) => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-lg shadow-md p-6 cursor-pointer";
    div.innerHTML = `
      <h3 class="text-lg font-semibold text-primary mb-2">${
        proverb.meranaw
      }</h3>
      <p class="text-gray-700 mb-1"><strong>Literal:</strong> ${
        proverb.literal_meaning
      }</p>
      <p class="text-gray-700 mb-1"><strong>English:</strong> ${
        proverb.english_translation
      }</p>
      <p class="text-sm text-gray-500">Theme: ${
        themes[proverb.theme]?.title || proverb.theme
      }</p>
    `;
    div.addEventListener("click", () => {
      jumpToTheme(proverb.theme);
    });
    container.appendChild(div);
  });
}

function jumpToTheme(themeKey) {
  // Simulate click on the theme box
  const themeBox = dashboardView.querySelector(`[data-theme="${themeKey}"]`);
  if (themeBox) {
    themeBox.click();
  } else {
    console.warn("Theme box not found:", themeKey);
  }
}

function displaySearchResults(results, searchTerm) {
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );
  if (!searchResultsContainer) return;

  searchResultsContainer.innerHTML = ""; // Clear previous results
  if (searchResultsDiv) searchResultsDiv.classList.remove("hidden");
  if (dashboardView) dashboardView.classList.add("hidden");
  if (proverbListView) proverbListView.classList.add("hidden");

  if (results && results.length > 0) {
    results.forEach((result) => {
      const proverbElement = document.createElement("div");
      proverbElement.classList.add(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "p-4",
        "cursor-pointer"
      );
      proverbElement.innerHTML = `
        <h3 class="text-lg font-semibold text-primary mb-2">${
          result.meranaw
        }</h3>
        <p class="text-gray-700 mb-1"><strong>Literal:</strong> ${
          result.literal_meaning
        }</p>
        <p class="text-gray-700 mb-1"><strong>English:</strong> ${
          result.english_translation
        }</p>
        <p class="text-sm text-gray-500">Theme: ${
          themes[result.theme]?.title || result.theme
        }</p>
      `;
      proverbElement.addEventListener("click", () =>
        showProverbDetails(result)
      );
      searchResultsContainer.appendChild(proverbElement);
    });
  } else {
    searchResultsContainer.innerHTML = `<p class="text-gray-500 text-center">No proverbs found for "${searchTerm}".</p>`;
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

function displayProverbs(proverbs, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }
  container.innerHTML = ""; // Clear existing proverbs
  if (proverbs.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500">No proverbs found for the selected filters or search query.</p>`;
  } else {
    proverbs.forEach((proverb) => {
      container.appendChild(createProverbCard(proverb));
    });
  }
}

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
      showProverbDetails(proverb.id);
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
  const proverb = allProverbs.find((p) => p.id === proverbId);
  if (!proverb) return;

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
    meranaw: formData.get("meranaw_proverb"),
    literal_translation: formData.get("literal_translation_meranaw"),
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

function generateInterpretation() {
  const proverbText = document.getElementById("proverbText").textContent;
  const literalMeaning = document.getElementById("literalMeaning").textContent;
  const englishTranslation =
    document.getElementById("englishTranslation").textContent;

  // Simulate API call or complex logic
  const mockInterpretation = `
      This proverb emphasizes the importance of empathy and treating
      others with the same consideration we desire for ourselves. It
      reflects the golden rule found in many cultures and religions,
      encouraging people to extend their good wishes and actions to
      others, especially those close to them. In Meranaw society,
      this proverb reinforces the value of community solidarity and
      familial bonds.
    `;

  const interpretationOutput = document.getElementById("interpretationText");
  const container = document.getElementById("interpretationContainer");

  if (interpretationOutput && container) {
    interpretationOutput.textContent = "Generating interpretation...";
    container.classList.remove("hidden");

    setTimeout(() => {
      interpretationOutput.textContent = mockInterpretation;
    }, 800); // Simulate a delay for interpretation generation
  }
}

const suggestionsList = document.getElementById("suggestionsList");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    suggestionsList.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`/suggest?q=${encodeURIComponent(query)}`);
    const suggestions = await res.json();

    suggestionsList.innerHTML = "";
    if (suggestions.length === 0) {
      suggestionsList.classList.add("hidden");
      return;
    }

    suggestions.forEach((sugg) => {
      const li = document.createElement("li");
      li.textContent = sugg;
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
      li.addEventListener("click", () => {
        searchInput.value = sugg;
        performSearch(); // Use selected suggestion
        suggestionsList.classList.add("hidden");
      });
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove("hidden");
  } catch (err) {
    console.error("Suggestion error:", err);
    suggestionsList.classList.add("hidden");
  }
});
