import { STREAM_CHANNELS } from "./streams.config.js";
import { ONE_PIECE_ARCS, ONE_PIECE_EPISODE_COUNT, ONE_PIECE_PROVIDERS, ONE_PIECE_SOURCES } from "./onepiece.config.js";

const API_BASE = "/api/leaderboard";
const PAGE_SIZE = 500;
const AUTO_REFRESH_SECONDS = 5;

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
const boardWrap = document.querySelector(".board-wrap");
const streamsSection = document.querySelector("#streamsSection");
const streamsGrid = document.querySelector("#streamsGrid");
const streamsMeta = document.querySelector("#streamsMeta");
const streamsToggle = document.querySelector("#streamsToggle");
const filtersSection = document.querySelector(".filters");
const onePieceArcSelect = document.querySelector("#onePieceArcSelect");
const onePieceEpisodeSelect = document.querySelector("#onePieceEpisodeSelect");
const onePieceSourceSelect = document.querySelector("#onePieceSourceSelect");
const onePieceWatchBtn = document.querySelector("#onePieceWatchBtn");
const onePieceLinks = document.querySelector("#onePieceLinks");

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
let refreshCountdown = AUTO_REFRESH_SECONDS;
let streamsMode = false;

function isStreamsCategory() {
  return streamsMode;
}

function getYouTubeEmbedUrl(channelId) {
  const url = new URL("https://www.youtube.com/embed/live_stream");
  url.searchParams.set("channel", channelId);
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("mute", "1");
  url.searchParams.set("modestbranding", "1");
  url.searchParams.set("rel", "0");
  url.searchParams.set("origin", window.location.origin);
  return url.toString();
}

function getTwitchEmbedUrl(channel) {
  const url = new URL("https://player.twitch.tv/");
  url.searchParams.set("channel", channel);
  url.searchParams.set("parent", window.location.hostname);
  url.searchParams.set("muted", "true");
  return url.toString();
}

function renderStreams() {
  if (!streamsSection || !streamsGrid || !streamsMeta) {
    return;
  }

  streamsGrid.innerHTML = "";

  if (STREAM_CHANNELS.length === 0) {
    streamsMeta.textContent = "No channels configured yet";
    streamsGrid.innerHTML =
      '<p class="streams-empty">Add channel IDs in streams.config.js to show your server creators here.</p>';
    return;
  }

  streamsMeta.textContent = `${STREAM_CHANNELS.length} channels configured`;

  STREAM_CHANNELS.forEach((stream) => {
    const card = document.createElement("article");
    card.className = "stream-card";

    const safeName = stream.name || "Creator";
    const platform = stream.platform || "youtube";

    let channelUrl = "#";
    let frameUrl = "";

    if (platform === "twitch" && stream.channel) {
      channelUrl = `https://www.twitch.tv/${stream.channel}`;
      frameUrl = getTwitchEmbedUrl(stream.channel);
    } else if (stream.channelId) {
      channelUrl = `https://www.youtube.com/channel/${stream.channelId}`;
      frameUrl = getYouTubeEmbedUrl(stream.channelId);
    }

    if (!frameUrl) {
      return;
    }

    card.innerHTML = `
      <div class="stream-card-head">
        <strong>${safeName}</strong>
        <a href="${channelUrl}" target="_blank" rel="noreferrer">Channel</a>
      </div>
      <iframe
        class="stream-frame"
        src="${frameUrl}"
        title="${safeName} Live Stream"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    `;

    streamsGrid.appendChild(card);
  });
}

function renderOnePieceOptions() {
  if (!onePieceArcSelect || !onePieceEpisodeSelect || !onePieceSourceSelect) {
    return;
  }

  onePieceArcSelect.innerHTML = "";
  ONE_PIECE_ARCS.forEach((arc) => {
    const option = document.createElement("option");
    option.value = arc.key;
    option.textContent = `${arc.label} (${arc.start}-${arc.end})`;
    onePieceArcSelect.appendChild(option);
  });

  onePieceArcSelect.value = ONE_PIECE_ARCS[ONE_PIECE_ARCS.length - 1].key;
  renderOnePieceEpisodesForArc();

  onePieceSourceSelect.innerHTML = "";
  ONE_PIECE_SOURCES.forEach((source) => {
    const option = document.createElement("option");
    option.value = source.key;
    option.textContent = source.label;
    onePieceSourceSelect.appendChild(option);
  });

  renderOnePieceLinks();
}

function getSelectedArc() {
  if (!onePieceArcSelect) {
    return ONE_PIECE_ARCS[ONE_PIECE_ARCS.length - 1];
  }

  return ONE_PIECE_ARCS.find((arc) => arc.key === onePieceArcSelect.value) || ONE_PIECE_ARCS[ONE_PIECE_ARCS.length - 1];
}

function renderOnePieceEpisodesForArc() {
  if (!onePieceEpisodeSelect) {
    return;
  }

  const selectedArc = getSelectedArc();
  onePieceEpisodeSelect.innerHTML = "";

  for (let episode = selectedArc.start; episode <= selectedArc.end; episode += 1) {
    const option = document.createElement("option");
    option.value = String(episode);
    option.textContent = `Episode ${episode}`;
    onePieceEpisodeSelect.appendChild(option);
  }

  // Default to the first episode in the selected arc for better initial hit rate.
  onePieceEpisodeSelect.value = String(selectedArc.start);
}

function buildOnePieceQuery(episode, sourceKey) {
  const source = ONE_PIECE_SOURCES.find((item) => item.key === sourceKey) || ONE_PIECE_SOURCES[0];
  const arc = getSelectedArc();
  const suffix = source?.querySuffix ? ` ${source.querySuffix}` : "";
  return `One Piece ${arc.label} Episode ${episode}${suffix}`;
}

function renderOnePieceLinks() {
  if (!onePieceEpisodeSelect || !onePieceSourceSelect || !onePieceLinks) {
    return;
  }

  const episode = Number(onePieceEpisodeSelect.value || 1);
  const sourceKey = onePieceSourceSelect.value;
  const query = buildOnePieceQuery(episode, sourceKey);
  const arc = getSelectedArc();

  onePieceLinks.innerHTML = ONE_PIECE_PROVIDERS.map((provider) => {
    const href = provider.buildUrl(query);
    return `
      <a class="onepiece-link-card" href="${href}" target="_blank" rel="noreferrer">
        <strong>${provider.label}</strong>
        <span>${arc.label} • Episode ${episode}</span>
      </a>
    `;
  }).join("");
}

function syncViewMode() {
  const streamsMode = isStreamsCategory();
  const customMode = streamsMode;

  if (quickStatsNode) {
    quickStatsNode.hidden = customMode;
  }
  if (boardWrap) {
    boardWrap.hidden = customMode;
  }
  if (streamsSection) {
    streamsSection.hidden = !streamsMode;
  }
  if (filtersSection) {
    filtersSection.hidden = customMode;
  }
  if (streamsToggle) {
    streamsToggle.classList.toggle("active", streamsMode);
    streamsToggle.setAttribute("aria-pressed", streamsMode ? "true" : "false");
  }
  if (searchInput) {
    searchInput.disabled = customMode;
    if (customMode) {
      searchInput.value = "";
    }
  }
  if (wipePickerButton) {
    wipePickerButton.disabled = customMode;
    if (customMode) {
      closeWipeMenu();
    }
  }

  if (streamsMode) {
    renderStreams();
    setStatus("Watching creator streams");
  }
}

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
      streamsMode = false;
      document.querySelectorAll(".category-btn").forEach((n) => n.classList.remove("active"));
      button.classList.add("active");
      button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

      syncViewMode();

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

function updateClock() {
  clockNode.textContent = `${Math.max(0, refreshCountdown)}s`;
}

function resetRefreshCountdown() {
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateClock();
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
  if (isStreamsCategory()) {
    return;
  }

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
    resetRefreshCountdown();
    isLoadingData = false;
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }

  resetRefreshCountdown();

  autoRefreshTimer = setInterval(async () => {
    if (document.visibilityState !== "visible") {
      return;
    }

    if (isStreamsCategory()) {
      return;
    }

    if (isLoadingData) {
      return;
    }

    refreshCountdown -= 1;
    updateClock();

    if (refreshCountdown <= 0) {
      await loadData({ silent: true });
    }
  }, 1000);
}

renderCategories();
renderOnePieceOptions();
updateCategoryNavButtons();
updateClock();
syncViewMode();

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

if (streamsToggle) {
  streamsToggle.addEventListener("click", async () => {
    streamsMode = !streamsMode;
    syncViewMode();

    if (streamsMode) {
      resetRefreshCountdown();
      return;
    }

    await loadData();
  });
}

if (onePieceWatchBtn) {
  onePieceWatchBtn.addEventListener("click", renderOnePieceLinks);
}

if (onePieceEpisodeSelect) {
  onePieceEpisodeSelect.addEventListener("change", renderOnePieceLinks);
}

if (onePieceArcSelect) {
  onePieceArcSelect.addEventListener("change", () => {
    renderOnePieceEpisodesForArc();
    renderOnePieceLinks();
  });
}

if (onePieceSourceSelect) {
  onePieceSourceSelect.addEventListener("change", renderOnePieceLinks);
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
