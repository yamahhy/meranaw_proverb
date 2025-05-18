document.addEventListener("DOMContentLoaded", function () {
  // Initialize after a short delay to ensure Firebase is ready
  setTimeout(initApp, 300);
});

async function initApp() {
  console.log("Initializing app...");

  // Check if Firebase is available
  if (typeof firebase === "undefined" || !window.firebaseService) {
    console.error("Firebase not loaded yet");
    // Retry after delay
    setTimeout(initApp, 500);
    return;
  }

  try {
    const proverbs = await firebaseService.getAllProverbs();
    console.log("Proverbs loaded:", proverbs);
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}
// Theme configuration
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
  community: {
    title: "Community & Society",
    class: "community-box",
    color: "#9b7f00",
    bgColor: "rgba(229, 193, 33, 0.05)",
  },
};

// Function to create a proverb item element
function createProverbItem(proverb) {
  const div = document.createElement("div");
  div.className =
    "proverb-item p-4 border border-gray-200 rounded cursor-pointer";
  div.dataset.id = proverb.id;

  div.innerHTML = `
    <div class="flex justify-between">
      <h3 class="text-lg font-medium text-primary">${proverb.text}</h3>
      <span class="text-xs text-gray-500">${proverb.id}</span>
    </div>
    <p class="text-gray-600 italic">${proverb.translation}</p>
  `;

  return div;
}

// Fetch and display proverbs dynamically
async function showProverbs(themeKey) {
  try {
    // Get the proverb list container
    const proverbListContainer = document.querySelector(
      "#proverbListView .space-y-4"
    );
    if (!proverbListContainer) return;

    // Show loading state
    proverbListContainer.innerHTML =
      '<p class="text-center py-8">Loading proverbs...</p>';

    // Fetch proverbs from Firebase
    const proverbs = await firebaseService.getProverbsByTheme(themeKey);

    if (proverbs.length === 0) {
      proverbListContainer.innerHTML =
        '<p class="text-center py-8">No proverbs found for this theme.</p>';
      return;
    }

    // Clear the container
    proverbListContainer.innerHTML = "";

    // Render proverbs
    proverbs.forEach((proverb) => {
      const proverbItem = createProverbItem(proverb);
      proverbListContainer.appendChild(proverbItem);

      // Add click event listener to show the proverb modal
      proverbItem.addEventListener("click", () =>
        showProverbDetails(proverb.id)
      );
    });
  } catch (error) {
    console.error("Error loading proverbs:", error);
    const proverbListContainer = document.querySelector(
      "#proverbListView .space-y-4"
    );
    if (proverbListContainer) {
      proverbListContainer.innerHTML =
        '<p class="text-center py-8 text-red-500">Failed to load proverbs. Please try again later.</p>';
    }
  }
}
// Fetch and display proverb details
async function showProverbDetails(proverbId) {
  try {
    const modal = document.getElementById("proverbModal");
    const idElement = document.getElementById("proverbId");
    const textElement = document.getElementById("proverbText");
    const literalMeaningElement = document.getElementById("literalMeaning");
    const englishTranslationElement =
      document.getElementById("englishTranslation");
    const interpretationContainer = document.getElementById(
      "interpretationContainer"
    );

    if (
      !modal ||
      !idElement ||
      !textElement ||
      !literalMeaningElement ||
      !englishTranslationElement
    )
      return;

    // Show loading state
    textElement.textContent = "Loading...";
    literalMeaningElement.textContent = "Loading...";
    englishTranslationElement.textContent = "Loading...";
    interpretationContainer.classList.add("hidden");

    // Fetch proverb details
    const proverb = await firebaseService.getProverbById(proverbId);

    if (!proverb) {
      textElement.textContent = "Proverb not found";
      literalMeaningElement.textContent = "";
      englishTranslationElement.textContent = "";
      return;
    }

    // Update modal with proverb details
    idElement.textContent = proverb.id;
    textElement.textContent = proverb.text;
    literalMeaningElement.textContent =
      proverb.literalMeaning || proverb.translation;
    englishTranslationElement.textContent = proverb.translation;

    // Show the modal
    modal.classList.remove("hidden");
  } catch (error) {
    console.error("Error showing proverb details:", error);
  }
}
// Handle search functionality
async function handleSearch(searchTerm) {
  try {
    if (!searchTerm.trim()) return;

    const dashboardView = document.getElementById("dashboardView");
    const proverbListView = document.getElementById("proverbListView");
    const proverbListContainer = document.querySelector(
      "#proverbListView .space-y-4"
    );
    const themeTitle = document.getElementById("themeTitle");

    if (
      !dashboardView ||
      !proverbListView ||
      !proverbListContainer ||
      !themeTitle
    )
      return;

    // Show proverb list view
    dashboardView.classList.add("hidden");
    proverbListView.classList.remove("hidden");

    // Update title
    themeTitle.textContent = `Search Results for "${searchTerm}"`;

    // Show loading state
    proverbListContainer.innerHTML =
      '<p class="text-center py-8">Searching...</p>';

    // Search for proverbs
    const results = await firebaseService.searchProverbs(searchTerm);

    if (results.length === 0) {
      proverbListContainer.innerHTML =
        '<p class="text-center py-8">No proverbs found matching your search.</p>';
      return;
    }

    // Clear the container
    proverbListContainer.innerHTML = "";

    // Render search results
    results.forEach((proverb) => {
      const proverbItem = createProverbItem(proverb);
      proverbListContainer.appendChild(proverbItem);

      // Add click event listener to show the proverb modal
      proverbItem.addEventListener("click", () =>
        showProverbDetails(proverb.id)
      );
    });
  } catch (error) {
    console.error("Error searching proverbs:", error);
  }
}
// Load featured proverbs on the dashboard
async function loadFeaturedProverbs() {
  try {
    const featuredContainer = document.querySelector(
      ".featured-proverbs .grid"
    );
    if (!featuredContainer) return;

    // Show loading state
    featuredContainer.innerHTML =
      '<p class="col-span-3 text-center py-8">Loading featured proverbs...</p>';

    // Get all proverbs
    const allProverbs = await firebaseService.getAllProverbs();

    if (allProverbs.length === 0) {
      featuredContainer.innerHTML =
        '<p class="col-span-3 text-center py-8">No proverbs available.</p>';
      return;
    }

    // Select up to 3 random proverbs as featured
    const featuredProverbs = [];
    const max = Math.min(3, allProverbs.length);

    // If few proverbs, just use all of them
    if (allProverbs.length <= 3) {
      featuredProverbs.push(...allProverbs);
    } else {
      // Otherwise select random ones
      const used = new Set();
      while (featuredProverbs.length < max) {
        const index = Math.floor(Math.random() * allProverbs.length);
        if (!used.has(index)) {
          used.add(index);
          featuredProverbs.push(allProverbs[index]);
        }
      }
    }

    // Clear container
    featuredContainer.innerHTML = "";

    // Create featured proverb cards
    featuredProverbs.forEach((proverb) => {
      const themeInfo = themes[proverb.theme] || {
        color: "#9b7f00",
        title: "General",
      };

      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4";
      card.dataset.id = proverb.id;
      card.innerHTML = `
        <h3 class="text-lg font-medium" style="color: ${themeInfo.color}">${proverb.text}</h3>
        <p class="text-gray-600 mt-2">${proverb.translation}</p>
        <div class="mt-3 flex justify-between items-center">
          <span class="text-xs text-gray-500">${proverb.id}</span>
          <span class="text-xs font-medium px-2 py-1 rounded" 
                style="background: ${themeInfo.color}20; color: ${themeInfo.color}">
            ${themeInfo.title}
          </span>
        </div>
      `;

      // Add click event
      card.addEventListener("click", () => showProverbDetails(proverb.id));

      featuredContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading featured proverbs:", error);
    const featuredContainer = document.querySelector(
      ".featured-proverbs .grid"
    );
    if (featuredContainer) {
      featuredContainer.innerHTML =
        '<p class="col-span-3 text-center py-8 text-red-500">Failed to load featured proverbs.</p>';
    }
  }
}

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements - Add null checks to prevent errors
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");
  const filterBtn = document.getElementById("filterBtn");
  const filterDropdown = document.getElementById("filterDropdown");
  const dashboardView = document.getElementById("dashboardView");
  const proverbListView = document.getElementById("proverbListView");
  const backToDashboard = document.getElementById("backToDashboard");
  const themeBoxes = document.querySelectorAll(".theme-box");
  const themeTitle = document.getElementById("themeTitle");
  const proverbModal = document.getElementById("proverbModal");
  const closeProverbModal = document.getElementById("closeProverbModal");
  const interpretBtn = document.getElementById("interpretBtn");
  const interpretationContainer = document.getElementById(
    "interpretationContainer"
  );
  const interpretationText = document.getElementById("interpretationText");
  const contributeBtn = document.getElementById("contributeBtn");
  const contributeModal = document.getElementById("contributeModal");
  const closeContributeModal = document.getElementById("closeContributeModal");
  const contributeForm = document.getElementById("contributeForm");
  const notification = document.getElementById("notification");
  const searchInput = document.querySelector(
    'input[type="text"][placeholder*="Search"]'
  );
  const searchButton = document.querySelector("button.absolute.right-2");

  // Apply theme styles to the theme boxes
  themeBoxes.forEach((box) => {
    const theme = box.dataset.theme;
    if (themes[theme]) {
      box.style.borderColor = themes[theme].color;
      box.style.borderWidth = "1px";
      box.style.borderStyle = "solid";
      box.style.color = themes[theme].color;
      box.style.backgroundColor = themes[theme].bgColor;
    }
  });

  // Toggle sidebar
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("translate-x-full");
      sidebar.classList.toggle("translate-x-0");
    });
  }

  if (closeSidebar && sidebar) {
    closeSidebar.addEventListener("click", function () {
      sidebar.classList.add("translate-x-full");
      sidebar.classList.remove("translate-x-0");
    });
  }

  // Toggle filter dropdown
  if (filterBtn && filterDropdown) {
    filterBtn.addEventListener("click", function () {
      filterDropdown.classList.toggle("hidden");
    });
  }

  // Close filter dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      filterBtn &&
      filterDropdown &&
      !filterBtn.contains(e.target) &&
      !filterDropdown.contains(e.target)
    ) {
      filterDropdown.classList.add("hidden");
    }
  });

  // Theme box click - show proverb list
  themeBoxes.forEach((box) => {
    box.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");

      if (themes[theme] && themeTitle) {
        themeTitle.textContent = themes[theme].title;
      }

      if (dashboardView && proverbListView) {
        dashboardView.classList.add("hidden");
        proverbListView.classList.remove("hidden");
      }

      // Call showProverbs to load proverbs for this theme
      showProverbs(theme);
    });
  });

  // Back to dashboard
  if (backToDashboard && proverbListView && dashboardView) {
    backToDashboard.addEventListener("click", function () {
      proverbListView.classList.add("hidden");
      dashboardView.classList.remove("hidden");
    });
  }

  // Close proverb modal
  if (closeProverbModal && proverbModal && interpretationContainer) {
    closeProverbModal.addEventListener("click", function () {
      proverbModal.classList.add("hidden");
      // Reset interpretation container
      interpretationContainer.classList.add("hidden");
    });
  }

  // Interpret button click
  interpretBtn.addEventListener("click", async function () {
    const proverbText = document.getElementById("proverbText").textContent;
    const proverbTranslation =
      document.getElementById("englishTranslation").textContent;

    if (!proverbText || !proverbTranslation) return;

    interpretationText.textContent = "Generating interpretation...";
    interpretationContainer.classList.remove("hidden");

    try {
      const response = await fetch("http://localhost:5000/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proverb: proverbText,
          translation: proverbTranslation,
        }),
      });

      const data = await response.json();
      interpretationText.textContent =
        data.interpretation || "No interpretation returned.";
    } catch (error) {
      console.error("Interpretation fetch error:", error);
      interpretationText.textContent =
        "Failed to generate interpretation. Please try again.";
    }
  });

  // Contribute button click
  if (contributeBtn && contributeModal && sidebar) {
    contributeBtn.addEventListener("click", function () {
      contributeModal.classList.remove("hidden");
      // Ensure it's displayed
      contributeModal.style.display = "flex";

      // Close sidebar if open
      if (sidebar.classList.contains("translate-x-0")) {
        sidebar.classList.add("translate-x-full");
        sidebar.classList.remove("translate-x-0");
      }
    });
  }

  // Close contribute modal
  if (closeContributeModal && contributeModal) {
    closeContributeModal.addEventListener("click", function () {
      contributeModal.classList.add("hidden");
    });
  }

  // Contribute form submission
  if (contributeForm && notification && contributeModal) {
    contributeForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contributeForm);
      const contributionData = {
        text: formData.get("proverb"),
        literalMeaning: formData.get("literalMeaning"),
        translation: formData.get("englishTranslation"),
        theme: formData.get("theme"),
        source: formData.get("source"),
      };

      try {
        // Submit contribution to Firebase
        await firebaseService.addProverbContribution(contributionData);

        // Hide modal
        contributeModal.classList.add("hidden");

        // Show notification
        notification.classList.remove("hidden");

        // Reset form
        contributeForm.reset();

        // Hide notification after 5 seconds
        setTimeout(() => {
          notification.classList.add("hidden");
        }, 5000);
      } catch (error) {
        console.error("Error submitting contribution:", error);
        alert("Failed to submit your contribution. Please try again later.");
      }
    });
  }

  // Search functionality
  if (searchInput && searchButton) {
    // Search on button click
    searchButton.addEventListener("click", function () {
      handleSearch(searchInput.value);
    });

    // Search on Enter key
    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        handleSearch(searchInput.value);
      }
    });
  }

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (proverbModal && e.target === proverbModal) {
      proverbModal.classList.add("hidden");
      if (interpretationContainer) {
        interpretationContainer.classList.add("hidden");
      }
    }
    if (contributeModal && e.target === contributeModal) {
      contributeModal.classList.add("hidden");
    }
  });

  // Setup custom checkboxes
  document.querySelectorAll(".custom-checkbox").forEach((checkbox) => {
    const input = checkbox.querySelector("input");
    let checkmark = checkbox.querySelector(".checkmark");

    if (!checkmark) {
      checkmark = document.createElement("span");
      checkmark.className = "checkmark";
      checkbox.appendChild(checkmark);
    }
  });

  // Apply filter button event listener
  const applyFilterBtn = document.querySelector(".mt-3.w-full.bg-primary");
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", function () {
      // Get selected themes
      const selectedThemes = [];
      document
        .querySelectorAll(".custom-checkbox input:checked")
        .forEach((checkbox) => {
          const themeValue =
            checkbox.value ||
            checkbox.closest(".custom-checkbox").dataset.theme;
          if (themeValue) {
            selectedThemes.push(themeValue);
          }
        });

      // Close dropdown
      if (filterDropdown) {
        filterDropdown.classList.add("hidden");
      }

      // Apply filters - In a real implementation, you would filter displayed proverbs
      console.log("Selected themes:", selectedThemes);

      // If we have themes selected and we're on the dashboard, show filtered results
      if (
        selectedThemes.length > 0 &&
        dashboardView &&
        !dashboardView.classList.contains("hidden")
      ) {
        // Show the proverb list view with filtered results
        dashboardView.classList.add("hidden");
        proverbListView.classList.remove("hidden");

        if (themeTitle) {
          themeTitle.textContent = "Filtered Proverbs";
        }

        // This would need a new function to fetch proverbs by multiple themes
        // For now, just use the first theme
        if (selectedThemes.length > 0) {
          showProverbs(selectedThemes[0]);
        }
      }
    });
  }

  // Load featured proverbs on page load
  loadFeaturedProverbs();
});
