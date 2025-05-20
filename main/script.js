const API_BASE_URL = "http://localhost:5000";
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("load", initApp);
});

let allProverbs = [];
let filteredProverbs = [];
let activeFilters = new Set();

async function initApp() {
  setupEventListeners();
  if (!window.firebaseService || !window.firebaseService.getProverbs) {
    console.log("Waiting for Firebase...");
    setTimeout(initApp, 500);
    return;
  }

  try {
    allProverbs = await window.firebaseService.getProverbs();
    activeFilters = new Set(Object.keys(themes));
    setupEventListeners();
    displayDashboard();
  } catch (error) {
    console.error("Failed to load proverbs:", error);
    setTimeout(initApp, 1000);
  }
}

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

async function performSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) {
    console.error("Search input field not found!");
    return;
  }
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/combined_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 500 Internal Server Error)
        console.error(`HTTP error! status: ${response.status}`);
        displaySearchError("Server error. Please try again."); // Provide a user-friendly message
        return;
      }

      try {
        const data = await response.json(); // Attempt to parse the JSON
        console.log("Search results:", data);
        displaySearchResults(data, searchTerm);
      } catch (jsonError) {
        // Handle errors in parsing JSON (e.g., invalid JSON response)
        console.error("Error parsing JSON:", jsonError);
        displaySearchError("Invalid data received from server.");
      }
    } catch (fetchError) {
      // Handle fetch errors (e.g., network issues, but also other fetch problems)
      console.error("Fetch error:", fetchError);
      displaySearchError(
        "Could not perform search. Please check your connection or try again."
      );
    }
  } else {
    console.log("Search term is empty.");
    loadInitialProverbs();
  }
}

function displaySearchError(message) {
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );
  if (searchResultsContainer) {
    searchResultsContainer.innerHTML = `<p class="text-red-500">${message}</p>`;
  }
}

function setupEventListeners() {
  const dashboardView = document.getElementById("dashboardView");
  const proverbListView = document.getElementById("proverbListView");
  const proverbListContainer = document.querySelector(
    "#proverbListView .space-y-4"
  );
  const themeTitle = document.getElementById("themeTitle");
  const filterBtn = document.getElementById("filterBtn");
  const menuToggle = document.getElementById("menuToggle");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const backToDashboard = document.getElementById("backToDashboard"); // Assuming you'll add this button
  const closeSidebar = document.getElementById("closeSidebar");
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    console.log("Search button found:", searchBtn);
    searchBtn.addEventListener("click", performSearch);
    console.log("Click listener added to search button.");
  } else {
    console.error("Search button not found!");
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    console.log("Search input found:", searchInput);
    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        performSearch();
      }
    });
    console.log("Keypress listener added to search input.");
  } else {
    console.error("Search input not found!");
  }

  // Handle modal close
  const closeProverbModal = document.getElementById("closeProverbModal");
  if (closeProverbModal) {
    closeProverbModal.addEventListener("click", function () {
      const proverbModal = document.getElementById("proverbModal");
      const interpretationContainer = document.getElementById(
        "interpretationContainer"
      );
      if (proverbModal) proverbModal.classList.add("hidden");
      if (interpretationContainer)
        interpretationContainer.classList.add("hidden");
    });
  }
  if (filterBtn) {
    filterBtn.addEventListener("click", toggleFilterDropdown);
  } else {
    console.error("Filter button not found!");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
  } else {
    console.error("Menu toggle button not found!");
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  } else {
    console.error("Apply filters button not found!");
  }

  // Add event listener for backToDashboard if it exists
  const backDashboardBtn = document.getElementById("backToDashboard");
  if (backDashboardBtn) {
    backDashboardBtn.addEventListener("click", goBackToDashboard);
  }
  if (closeSidebar) {
    closeSidebar.addEventListener("click", closeSidebar);
  } else {
    console.error("Close sidebar button not found!");
  }
  document.getElementById("backToDashboard").addEventListener("click", () => {
    dashboardView.classList.remove("hidden");
    proverbListView.classList.add("hidden");
  });

  document.getElementById("interpretBtn").addEventListener("click", () => {
    const proverbText = document.getElementById("proverbText").textContent;
    const translation =
      document.getElementById("englishTranslation").textContent;

    const mockInterpretation = `
      This proverb emphasizes the importance of empathy and treating
      others with the same consideration we desire for ourselves. It
      reflects the golden rule found in many cultures and religions,
      encouraging people to extend their good wishes and actions to
      others, especially those close to them. In Meranaw society,
      this proverb reinforces the value of community solidarity and
      familial bonds.
    `;

    const container = document.getElementById("interpretationContainer");
    const output = document.getElementById("interpretationText");

    output.textContent = "Loading interpretation...";
    container.classList.remove("hidden");

    setTimeout(() => {
      output.textContent = mockInterpretation;
    }, 800);
  });
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
      <h3 class="text-lg font-semibold text-primary mb-2">${proverb.text}</h3>
      <p class="text-gray-700 italic">${proverb.literalMeaning}</p>
    `;
    div.addEventListener("click", () => {
      showProverbDetails(proverb.id);
    });
    proverbListContainer.appendChild(div);
  });
}

function showProverbDetails(proverbId) {
  const proverb = allProverbs.find((p) => p.id === proverbId);
  if (!proverb) return;

  document.getElementById("proverbId").textContent = proverb.id;
  document.getElementById("proverbText").textContent = proverb.text;
  document.getElementById("literalMeaning").textContent =
    proverb.literalMeaning;
  document.getElementById("englishTranslation").textContent =
    proverb.translation;

  document.getElementById("interpretationContainer").classList.add("hidden");
  document.getElementById("interpretationText").textContent = "";

  const modal = document.getElementById("proverbModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
}

function toggleFilterDropdown() {
  const filterDropdown = document.getElementById("filterDropdown");
  if (filterDropdown) {
    filterDropdown.classList.toggle("show");
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}

function applyFilters() {
  const checkboxes = document.querySelectorAll('input[name="theme"]:checked');
  const selectedThemes = Array.from(checkboxes).map((cb) => cb.value);
  console.log("Selected themes:", selectedThemes);
  // Implement your filtering logic here, possibly calling a function in firebaseService.js
  // and then updating the displayed proverbs.
}

function goBackToDashboard() {
  console.log("Going back to dashboard (implement logic)");
  // Implement logic to reset filters and load all proverbs or the initial set.
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("open");
}

function loadInitialProverbs() {
  console.log("Loading initial proverbs (implement logic)");
  // Implement logic to fetch and display the initial set of proverbs.
  // This might involve calling firebaseService.getAllProverbs().
}
