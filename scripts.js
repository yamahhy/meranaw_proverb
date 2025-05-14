// DOM elements
const mainDashboard = document.getElementById("main-dashboard");
const themeView = document.getElementById("theme-view");
const themesGrid = document.getElementById("themes-grid");
const searchInput = document.getElementById("search-input");
const themeHeader = document.getElementById("theme-header");
const proverbsList = document.getElementById("proverbs-list");
const backButton = document.getElementById("back-button");
const proverbModal = document.getElementById("proverb-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalTranslation = document.getElementById("modal-translation");
const modalExplanation = document.getElementById("modal-explanation");
const closeModal = document.getElementById("close-modal");

// Current state
let selectedTheme = null;
let filteredThemes = [...themes];

// Initialize the page
function init() {
  renderThemes();
  setupEventListeners();
}

// Render theme cards
function renderThemes() {
  themesGrid.innerHTML = "";

  filteredThemes.forEach((theme) => {
    const themeCard = document.createElement("div");
    themeCard.className = "theme-card";
    themeCard.style.borderColor = theme.borderColor;
    themeCard.dataset.themeId = theme.id;

    themeCard.innerHTML = `
            <h2 class="theme-title" style="color: ${theme.borderColor}">${theme.name}</h2>
        `;

    themesGrid.appendChild(themeCard);
  });
}

// Render proverbs for a selected theme
function renderProverbs(theme) {
  themeHeader.textContent = theme.name;
  themeHeader.style.color = theme.borderColor;

  proverbsList.innerHTML = "";

  theme.proverbs.forEach((proverb) => {
    const proverbCard = document.createElement("div");
    proverbCard.className = "proverb-card";
    proverbCard.style.borderColor = theme.borderColor;
    proverbCard.dataset.proverbId = proverb.id;

    proverbCard.innerHTML = `
            <h3 class="proverb-title">${proverb.title}</h3>
            <p class="proverb-content">${proverb.content}</p>
        `;

    proverbsList.appendChild(proverbCard);
  });
}

// Show proverb details in modal
function showProverbDetails(proverb) {
  modalTitle.textContent = proverb.title;
  modalContent.textContent = proverb.content;
  modalTranslation.textContent = proverb.translation;
  modalExplanation.textContent = proverb.explanation;

  proverbModal.style.display = "flex";
}

// Filter themes based on search query
function filterThemes(query) {
  if (!query) {
    filteredThemes = [...themes];
  } else {
    query = query.toLowerCase();
    filteredThemes = themes.filter(
      (theme) =>
        theme.name.toLowerCase().includes(query) ||
        theme.proverbs.some(
          (proverb) =>
            proverb.title.toLowerCase().includes(query) ||
            proverb.content.toLowerCase().includes(query) ||
            proverb.translation.toLowerCase().includes(query)
        )
    );
  }

  renderThemes();
}

// Set up event listeners
function setupEventListeners() {
  // Search input
  searchInput.addEventListener("input", (e) => {
    filterThemes(e.target.value);
  });

  // Theme card click
  themesGrid.addEventListener("click", (e) => {
    const themeCard = e.target.closest(".theme-card");
    if (themeCard) {
      const themeId = parseInt(themeCard.dataset.themeId);
      selectedTheme = themes.find((theme) => theme.id === themeId);

      mainDashboard.style.display = "none";
      themeView.style.display = "block";

      renderProverbs(selectedTheme);
    }
  });

  // Back button click
  backButton.addEventListener("click", () => {
    themeView.style.display = "none";
    mainDashboard.style.display = "flex";
    mainDashboard.style.flexDirection = "column";
    mainDashboard.style.alignItems = "center";
    selectedTheme = null;
  });

  // Proverb card click
  proverbsList.addEventListener("click", (e) => {
    const proverbCard = e.target.closest(".proverb-card");
    if (proverbCard) {
      const proverbId = parseInt(proverbCard.dataset.proverbId);
      const proverb = selectedTheme.proverbs.find((p) => p.id === proverbId);

      showProverbDetails(proverb);
    }
  });

  // Close modal button
  closeModal.addEventListener("click", () => {
    proverbModal.style.display = "none";
  });

  // Click outside modal to close
  proverbModal.addEventListener("click", (e) => {
    if (e.target === proverbModal) {
      proverbModal.style.display = "none";
    }
  });
}

// Admin state
let isAdmin = false;

// Sidebar toggle
const sidebar = document.getElementById("sidebar");
document.querySelector(".menu-button").addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// Admin functionality
const adminLogin = document.getElementById("admin-login");
const adminForm = document.getElementById("admin-form");
const adminAccess = document.getElementById("admin-access");

adminLogin.addEventListener("click", () => {
  adminForm.style.display = "block";
});

adminAccess.addEventListener("click", () => {
  const password = document.getElementById("admin-password").value;
  // In real implementation, use proper authentication
  if (password === "admin123") {
    isAdmin = true;
    enableAdminFeatures();
  }
});

function enableAdminFeatures() {
  // Add admin controls to UI
  const adminControls = document.createElement("div");
  adminControls.innerHTML = `
        <button onclick="showAddProverbForm()">Add Proverb</button>
        <button onclick="toggleEditMode()">Edit Mode</button>
    `;
  document.querySelector(".admin-panel").appendChild(adminControls);
}

// Color alternation in renderThemes function
function renderThemes() {
  themesGrid.innerHTML = "";

  filteredThemes.forEach((theme, index) => {
    const themeCard = document.createElement("div");
    themeCard.className = `theme-card ${index % 2 === 0 ? "" : "alternate"}`;
    themeCard.style.borderColor =
      index % 2 === 0 ? themeColors.primary : themeColors.accent;
    themeCard.dataset.themeId = theme.id;

    themeCard.innerHTML = `
            <h2 class="theme-title" style="color: ${
              index % 2 === 0 ? themeColors.primary : themeColors.accent
            }">
                ${theme.name}
            </h2>
            ${
              isAdmin
                ? '<div class="admin-actions"><button onclick="editTheme(${theme.id})">Edit</button></div>'
                : ""
            }
        `;

    themesGrid.appendChild(themeCard);
  });
}

// Admin CRUD operations
function showAddProverbForm() {
  // Show modal with form fields
}

function toggleEditMode() {
  document.querySelectorAll(".proverb-card").forEach((card) => {
    card.contentEditable = !card.contentEditable;
  });
}

function editTheme(themeId) {
  const theme = themes.find((t) => t.id === themeId);
  // Show edit form with theme details
}

function deleteProverb(proverbId) {
  if (confirm("Are you sure?")) {
    const theme = selectedTheme;
    theme.proverbs = theme.proverbs.filter((p) => p.id !== proverbId);
    renderProverbs(theme);
  }
}

// Update proverb click handler to include admin features
proverbsList.addEventListener("click", (e) => {
  const proverbCard = e.target.closest(".proverb-card");
  if (proverbCard) {
    if (isAdmin && e.target.classList.contains("delete-btn")) {
      deleteProverb(proverbCard.dataset.proverbId);
      return;
    }

    const proverbId = parseInt(proverbCard.dataset.proverbId);
    const proverb = selectedTheme.proverbs.find((p) => p.id === proverbId);

    if (isAdmin) {
      showEditProverbForm(proverb);
    } else {
      showProverbDetails(proverb);
    }
  }
});

// Initialize the application
document.addEventListener("DOMContentLoaded", init);
