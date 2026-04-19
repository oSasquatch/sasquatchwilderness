const API_BASE = "/api/leaderboard";
const PAGE_SIZE = 500;

const categories = [
  {
    label: "PvP Combat",
    slug: "pvp",
    sortBy: "pvp_player_kills_total",
    columns: [
      { key: "pvp_player_kills_total", label: "Kills" },
      { key: "pvp_player_deaths_total", label: "Deaths" },
      { key: "kdr", label: "KD", type: "ratio" },
      { key: "pvp_player_headshot", label: "Headshots" },
      { key: "pvp_player_longestkill", label: "Longest Kill", type: "meters" },
      { key: "pvp_player_wounds_total", label: "Wounds" },
      { key: "pvp_player_deaths_suicides", label: "Suicides" }
    ]
  },
  {
    label: "Weapons",
    slug: "weapons",
    sortBy: "weapon_bullet_fired_total",
    columns: [
      { key: "weapon_bullet_fired_total", label: "Bullets Fired" },
      { key: "weapon_bullet_hit_player", label: "Hits" },
      { key: "accuracy", label: "Accuracy", type: "percent" },
      { key: "kdr", label: "KD", type: "ratio" }
    ]
  },
  {
    label: "Explosives and Raiding",
    slug: "explosives",
    sortBy: "weapon_rocket_launched_basic",
    columns: [
      { key: "weapon_rocket_launched_basic", label: "Basic Rockets" },
      { key: "weapon_rocket_launched_hv", label: "HV Rockets" },
      { key: "weapon_rocket_hit_online_base", label: "Online Hits" },
      { key: "weapon_rocket_hit_offline_base", label: "Offline Hits" },
      { key: "item_thrown_satchel", label: "Satchels" }
    ]
  },
  {
    label: "PvE and Events",
    slug: "pve",
    sortBy: "pve_scientist_kills",
    columns: [
      { key: "pve_scientist_kills", label: "Scientist Kills" },
      { key: "pve_heavy_scientist_kills", label: "Heavy Kills" },
      { key: "event_attackhelicopter_kills", label: "Heli Kills" },
      { key: "event_bradleyapc_kills", label: "Bradley Kills" }
    ]
  },
  {
    label: "Loot",
    slug: "loot",
    sortBy: "loot_crate_total",
    columns: [
      { key: "loot_crate_total", label: "Crates" },
      { key: "loot_barrels_total", label: "Barrels" },
      { key: "loot_freed_crate", label: "Airdrops" }
    ]
  },
  {
    label: "Farming and Resources",
    slug: "farming",
    sortBy: "farming_resource_wood_harvested",
    columns: [
      { key: "farming_resource_wood_harvested", label: "Wood" },
      { key: "farming_resource_stone_harvested", label: "Stone" },
      { key: "farming_resource_metal_harvested", label: "Metal" },
      { key: "farming_resource_sulfur_harvested", label: "Sulfur" }
    ]
  },
  {
    label: "Fishing",
    slug: "fishing",
    sortBy: "fishing_caught_fish",
    columns: [
      { key: "fishing_caught_fish", label: "Fish Caught" },
      { key: "fishing_gutting_total", label: "Fish Gutted" }
    ]
  },
  {
    label: "Building and Crafting",
    slug: "building",
    sortBy: "building_blocks_placed",
    columns: [
      { key: "building_blocks_placed", label: "Blocks Placed" },
      { key: "building_blocks_upgraded", label: "Blocks Upgraded" },
      { key: "building_deployables_placed", label: "Deployables" },
      { key: "building_doors_placed", label: "Doors" }
    ]
  },
  {
    label: "Vending",
    slug: "vending",
    sortBy: "vending_machine_purchases",
    columns: [
      { key: "vending_machine_purchases", label: "Purchases" },
      { key: "vending_machine_items_spent", label: "Items Spent" },
      { key: "vending_machine_items_bought", label: "Items Bought" }
    ]
  },
  {
    label: "Gambling and Scrap",
    slug: "gambling",
    sortBy: "gambling_wheel_scrap_wagered",
    columns: [
      { key: "gambling_wheel_scrap_wagered", label: "Scrap Wagered" },
      { key: "gambling_wheel_scrap_won", label: "Scrap Won" },
      { key: "scrap_profit", label: "Scrap Profit" }
    ]
  },
  {
    label: "Activity and Missions",
    slug: "activity",
    sortBy: "player_time_played",
    columns: [
      { key: "player_time_played", label: "Time Played", type: "seconds" },
      { key: "player_time_swimming", label: "Time Swimming", type: "seconds" },
      { key: "player_mission_started", label: "Missions Started" },
      { key: "player_mission_completed", label: "Missions Completed" }
    ]
  }
];

const categoryBar = document.querySelector("#categoryBar");
const catPrev = document.querySelector("#catPrev");
const catNext = document.querySelector("#catNext");
const quickStatsNode = document.querySelector("#quickStats");
const tableHead = document.querySelector("#leaderboardHead");
const tableBody = document.querySelector("#leaderboardRows");
const searchInput = document.querySelector("#playerSearch");
const wipePickerButton = document.querySelector("#wipePickerButton");
const wipePickerLabel = document.querySelector("#wipePickerLabel");
const wipeMenu = document.querySelector("#wipeMenu");
const boardMeta = document.querySelector("#boardMeta");
const clockNode = document.querySelector("#clock");
const liveStatus = document.querySelector("#liveStatus");
const prevPageBtn = document.querySelector("#prevPage");
const nextPageBtn = document.querySelector("#nextPage");
const pageLabel = document.querySelector("#pageLabel");
const pagerNode = document.querySelector(".pager");

let selectedCategory = categories[0];
let allPlayers = [];
let filteredPlayers = [];
let totals = null;
let availableWipes = [];
let selectedWipe = null;
let page = 1;
let totalCount = 0;
let isLoadingData = false;
let autoRefreshTimer = null;

function formatLabel(statKey) {
  return statKey
    .replace(/^.*?_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "0";
  }

  return Number(value).toLocaleString();
}

function formatSeconds(seconds) {
  const total = Number(seconds) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatCellValue(column, rawValue) {
  if (column.type === "ratio") {
    return Number(rawValue || 0).toFixed(2);
  }

  if (column.type === "percent") {
    return `${Number(rawValue || 0).toFixed(1)}%`;
  }

  if (column.type === "meters") {
    return `${formatNumber(rawValue)}m`;
  }

  if (column.type === "seconds") {
    return formatSeconds(rawValue);
  }

  return formatNumber(rawValue);
}

function setStatus(message) {
  liveStatus.textContent = message;
}

function updatePager() {
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  pageLabel.textContent = `Page ${page} of ${maxPage}`;
  prevPageBtn.disabled = page <= 1;
  nextPageBtn.disabled = page >= maxPage;
  if (pagerNode) {
    pagerNode.style.display = maxPage > 1 ? "flex" : "none";
  }
}

function renderTableHead() {
  const metricHeadings = selectedCategory.columns.map((column) => `<th>${column.label}</th>`).join("");
  tableHead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Player</th>
      ${metricHeadings}
    </tr>
  `;
}

function renderCategories() {
  categoryBar.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-btn";
    button.textContent = category.label;
    if (category === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", async () => {
      selectedCategory = category;
      page = 1;
      document.querySelectorAll(".category-btn").forEach((n) => n.classList.remove("active"));
      button.classList.add("active");
      button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      await loadData();
    });

    categoryBar.appendChild(button);
  });
}

function scrollCategories(direction) {
  const amount = Math.round(categoryBar.clientWidth * 0.7);
  categoryBar.scrollBy({
    left: direction * amount,
    behavior: "smooth"
  });
}

function updateCategoryNavButtons() {
  const maxScrollLeft = Math.max(0, categoryBar.scrollWidth - categoryBar.clientWidth);
  const atStart = categoryBar.scrollLeft <= 2;
  const atEnd = categoryBar.scrollLeft >= maxScrollLeft - 2;

  catPrev.disabled = atStart;
  catNext.disabled = atEnd;
}

function renderStats() {
  quickStatsNode.innerHTML = "";

  const fields = totals?.fieldTotals ? Object.entries(totals.fieldTotals) : [];
  const cards = fields.slice(0, 5).map(([key, value]) => ({
    label: formatLabel(key),
    value: formatNumber(value)
  }));

  cards.forEach((stat, index) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.style.animationDelay = `${index * 70}ms`;
    card.innerHTML = `<p>${stat.label}</p><strong>${stat.value}</strong>`;
    quickStatsNode.appendChild(card);
  });
}

function renderTable() {
  tableBody.innerHTML = "";
  renderTableHead();

  filteredPlayers.forEach((player) => {
    const rank = player.rank ?? "-";
    const name = player.username || "Unknown";
    const metricCells = selectedCategory.columns
      .map((column) => {
        const value = formatCellValue(column, player.stats?.[column.key]);
        const classes = column.key === "kdr" && Number(player.stats?.[column.key] || 0) >= 1.3 ? "kd-high" : "";
        return `<td class="${classes}">${value}</td>`;
      })
      .join("");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="rank">#${rank}</td>
      <td>${name}</td>
      ${metricCells}
    `;

    tableBody.appendChild(row);
  });

  boardMeta.textContent = `${formatNumber(totalCount)} players`;
}

function filterPlayers() {
  const term = searchInput.value.trim().toLowerCase();
  filteredPlayers = allPlayers.filter((player) => (player.username || "").toLowerCase().includes(term));
  renderTable();
}

function renderWipeOptions() {
  if (!wipeMenu || !wipePickerLabel || !wipePickerButton) {
    return;
  }

  wipeMenu.innerHTML = "";

  const options = [{ value: "current", label: "Current Wipe" }].concat(
    availableWipes.map((wipeDate, index) => ({ value: wipeDate, label: `Wipe ${index + 1}` }))
  );

  options.forEach((item) => {
    const row = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wipe-option";
    button.textContent = item.label;
    if ((item.value === "current" && selectedWipe == null) || item.value === selectedWipe) {
      button.classList.add("active");
    }

    button.addEventListener("click", async () => {
      selectedWipe = item.value === "current" ? null : item.value;
      page = 1;
      wipePickerLabel.textContent = item.label;
      closeWipeMenu();
      await loadData();
    });

    row.appendChild(button);
    wipeMenu.appendChild(row);
  });

  wipePickerLabel.textContent = selectedWipe ? `Wipe ${availableWipes.indexOf(selectedWipe) + 1}` : "Current Wipe";
}

function openWipeMenu() {
  if (!wipeMenu || !wipePickerButton) {
    return;
  }

  wipeMenu.hidden = false;
  wipePickerButton.setAttribute("aria-expanded", "true");
}

function closeWipeMenu() {
  if (!wipeMenu || !wipePickerButton) {
    return;
  }

  wipeMenu.hidden = true;
  wipePickerButton.setAttribute("aria-expanded", "false");
}

function runLiveClock() {
  let tick = 5;
  setInterval(() => {
    tick = tick <= 1 ? 5 : tick - 1;
    clockNode.textContent = `${tick}s`;
  }, 1000);
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function loadWipes() {
  try {
    const wipes = await fetchJson(`${API_BASE}/wipes`);
    if (Array.isArray(wipes) && wipes.length > 0) {
      availableWipes = wipes;
      selectedWipe = null;
    }
  } catch {
    availableWipes = [];
    selectedWipe = null;
  }

  renderWipeOptions();
}

async function loadData(options = {}) {
  const { silent = false } = options;

  if (isLoadingData) {
    return;
  }

  isLoadingData = true;

  try {
    if (!silent) {
      setStatus(`Loading ${selectedCategory.label}...`);
    }

    const leaderboardUrl = new URL(API_BASE, window.location.origin);
    leaderboardUrl.searchParams.set("category", selectedCategory.slug);
    leaderboardUrl.searchParams.set("sortBy", selectedCategory.sortBy);
    leaderboardUrl.searchParams.set("orderBy", "desc");
    leaderboardUrl.searchParams.set("page", String(page));
    leaderboardUrl.searchParams.set("pageSize", String(PAGE_SIZE));

    if (selectedWipe) {
      leaderboardUrl.searchParams.set("wipe", selectedWipe);
    }

    const totalsUrl = new URL(`${API_BASE}/totals/${selectedCategory.slug}`, window.location.origin);
    if (selectedWipe) {
      totalsUrl.searchParams.set("wipe", selectedWipe);
    }

    const [leaderboardResponse, totalsResponse] = await Promise.all([
      fetchJson(leaderboardUrl.toString()),
      fetchJson(totalsUrl.toString())
    ]);

    allPlayers = Array.isArray(leaderboardResponse.players) ? leaderboardResponse.players : [];
    filteredPlayers = [...allPlayers];
    totalCount = Number(leaderboardResponse.totalCount || totalsResponse.totalPlayers || allPlayers.length);
    totals = totalsResponse;

    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      filterPlayers();
    } else {
      renderStats();
      renderTable();
    }

    updatePager();
    const wipeLabel = selectedWipe ? "Wipe 1" : "Current Wipe";
    setStatus(`Live from API | ${selectedCategory.label} | ${wipeLabel}`);
  } catch (error) {
    setStatus("Live API unavailable. Showing current in-memory data.");
    totals = { fieldTotals: {} };
    renderStats();
    renderTable();
    updatePager();
    console.error(error);
  } finally {
    isLoadingData = false;
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }

  autoRefreshTimer = setInterval(async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    await loadData({ silent: true });
  }, 5000);
}

renderCategories();
updateCategoryNavButtons();
runLiveClock();

searchInput.addEventListener("input", filterPlayers);
if (wipePickerButton) {
  wipePickerButton.addEventListener("click", () => {
    const isOpen = wipePickerButton.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeWipeMenu();
    } else {
      openWipeMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!wipeMenu || !wipePickerButton) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (!wipeMenu.contains(target) && !wipePickerButton.contains(target)) {
    closeWipeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeWipeMenu();
  }
});

if (catPrev) {
  catPrev.addEventListener("click", () => scrollCategories(-1));
}
if (catNext) {
  catNext.addEventListener("click", () => scrollCategories(1));
}
categoryBar.addEventListener("scroll", updateCategoryNavButtons);
window.addEventListener("resize", updateCategoryNavButtons);

prevPageBtn.addEventListener("click", async () => {
  if (page > 1) {
    page -= 1;
    await loadData();
  }
});

nextPageBtn.addEventListener("click", async () => {
  const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (page < maxPage) {
    page += 1;
    await loadData();
  }
});

async function bootstrap() {
  await loadWipes();
  await loadData();
  startAutoRefresh();
}

bootstrap();
