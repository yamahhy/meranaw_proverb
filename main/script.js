document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initApp, 300);
});

let allProverbs = [];
let filteredProverbs = [];
let activeFilters = new Set();

async function initApp() {
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

function setupEventListeners() {
  const dashboardView = document.getElementById("dashboardView");
  const proverbListView = document.getElementById("proverbListView");
  const proverbListContainer = document.querySelector(
    "#proverbListView .space-y-4"
  );
  const themeTitle = document.getElementById("themeTitle");
  document.getElementById("backToDashboard").addEventListener("click", () => {
    dashboardView.classList.remove("hidden");
    proverbListView.classList.add("hidden");
  });

  const closeProverbModal = document.getElementById("closeProverbModal");

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
closeProverbModal.addEventListener("click", function () {
  proverbModal.classList.add("hidden");
  // Reset interpretation container
  interpretationContainer.classList.add("hidden");
});
