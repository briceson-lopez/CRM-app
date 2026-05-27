const STATUSES = ["Knocked", "Quoted", "Booked", "Completed"];
const ZONES = ["North Route", "South Route", "East Route", "West Route", "Downtown", "Lake Route"];
const TEAMS = ["Team Member A", "Team Member B"];
const DAILY_GOAL = 1000;
const STORAGE_KEY = "clearpath-crm-state-v1";

const sizeMinutes = {
  Small: 75,
  Medium: 120,
  Large: 180,
  Estate: 270,
};

const zoneCoordinates = {
  "North Route": { x: 52, y: 20 },
  "South Route": { x: 50, y: 78 },
  "East Route": { x: 80, y: 50 },
  "West Route": { x: 21, y: 51 },
  Downtown: { x: 51, y: 50 },
  "Lake Route": { x: 72, y: 25 },
};

const seedLeads = [
  {
    id: "lead_1",
    name: "Maya Ortiz",
    phone: "(555) 210-0441",
    address: "118 Cedar Lane",
    notes: "Wants exterior only first. Good candidate for quarterly plan.",
    size: "Medium",
    price: 275,
    status: "Booked",
    zone: "North Route",
    team: "Team Member A",
    scheduledDate: todayISO(),
    scheduledTime: "09:00",
    routeOrder: 0,
    archived: false,
    createdAt: daysAgoISO(6),
    completedAt: null,
    timerSeconds: 0,
    timerStartedAt: null,
  },
  {
    id: "lead_2",
    name: "Jordan Lee",
    phone: "(555) 818-6610",
    address: "44 Maple Court",
    notes: "Two-story house, skylights, asked for Saturday follow-up.",
    size: "Large",
    price: 425,
    status: "Quoted",
    zone: "East Route",
    team: "Team Member B",
    scheduledDate: "",
    scheduledTime: "",
    routeOrder: 1,
    archived: false,
    createdAt: daysAgoISO(2),
    completedAt: null,
    timerSeconds: 0,
    timerStartedAt: null,
  },
  {
    id: "lead_3",
    name: "Priya Shah",
    phone: "(555) 442-3109",
    address: "701 Pine Street",
    notes: "Booked after door knock. Add screen cleaning.",
    size: "Small",
    price: 190,
    status: "Completed",
    zone: "Downtown",
    team: "Team Member A",
    scheduledDate: todayISO(),
    scheduledTime: "13:00",
    routeOrder: 2,
    archived: false,
    createdAt: daysAgoISO(5),
    completedAt: new Date().toISOString(),
    timerSeconds: 5400,
    timerStartedAt: null,
  },
  {
    id: "lead_4",
    name: "Elliot Brooks",
    phone: "(555) 673-2298",
    address: "28 Harbor View",
    notes: "Estate windows. Needs early arrival.",
    size: "Estate",
    price: 780,
    status: "Booked",
    zone: "Lake Route",
    team: "Team Member B",
    scheduledDate: todayISO(),
    scheduledTime: "15:30",
    routeOrder: 3,
    archived: false,
    createdAt: daysAgoISO(4),
    completedAt: null,
    timerSeconds: 2200,
    timerStartedAt: Date.now() - 1200000,
  },
  {
    id: "lead_5",
    name: "Sam Rivera",
    phone: "(555) 507-9001",
    address: "89 Birch Avenue",
    notes: "Not home. Try again after 5 PM.",
    size: "Medium",
    price: 250,
    status: "Knocked",
    zone: "South Route",
    team: "Team Member A",
    scheduledDate: "",
    scheduledTime: "",
    routeOrder: 4,
    archived: false,
    createdAt: todayISO(),
    completedAt: null,
    timerSeconds: 0,
    timerStartedAt: null,
  },
];

const state = loadState();
let currentView = "dashboard";
let calendarView = "week";
let calendarCursor = new Date();
let routeDragId = null;
let toastTimeout = null;

const els = {};
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  registerServiceWorker();
  bindEvents();
  hydrateFormOptions();
  applyTheme();
  saveState();
  renderAll();
  startTicker();
});

function cacheElements() {
  for (const id of [
    "viewTitle",
    "primaryNav",
    "addLeadButton",
    "exportButton",
    "themeToggle",
    "syncState",
    "todayRevenue",
    "weekRevenue",
    "monthRevenue",
    "avgRevenue",
    "completedCount",
    "dailyGoalText",
    "dailyGoalBar",
    "pipelineSummary",
    "todayJobs",
    "leadSearch",
    "statusFilter",
    "zoneFilter",
    "pipelineBoard",
    "sessionTimer",
    "sessionStatus",
    "sessionToggle",
    "doorsCount",
    "quotesCount",
    "closedCount",
    "closeRate",
    "quotesPerHour",
    "knockRevenuePerHour",
    "routeZoneSelect",
    "routeMap",
    "routeStops",
    "googleRouteLink",
    "appleRouteLink",
    "optimizeRouteButton",
    "routeFromBookedButton",
    "calendarTitle",
    "calendarShell",
    "prevPeriod",
    "nextPeriod",
    "unscheduledJobs",
    "jobTimers",
    "leadDialog",
    "leadForm",
    "leadId",
    "leadName",
    "leadPhone",
    "leadAddress",
    "leadSize",
    "leadPrice",
    "leadStatus",
    "leadZone",
    "leadTeam",
    "leadDate",
    "leadTime",
    "leadNotes",
    "leadIntegrationActions",
    "leadAppleMaps",
    "leadGoogleCalendar",
    "leadCalendarDownload",
    "dialogMode",
    "dialogTitle",
    "archiveLeadButton",
    "cancelLeadButton",
    "closeDialog",
    "toast",
  ]) {
    els[id] = document.getElementById(id);
  }
}

function bindEvents() {
  els.primaryNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) setView(button.dataset.view);
  });

  document.body.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-view-jump]");
    if (jump) setView(jump.dataset.viewJump);
  });

  els.addLeadButton.addEventListener("click", () => openLeadDialog());
  els.exportButton.addEventListener("click", exportData);
  els.themeToggle.addEventListener("click", toggleTheme);
  els.leadSearch.addEventListener("input", renderPipeline);
  els.statusFilter.addEventListener("change", renderPipeline);
  els.zoneFilter.addEventListener("change", renderPipeline);
  els.sessionToggle.addEventListener("click", toggleSession);
  els.optimizeRouteButton.addEventListener("click", optimizeRoute);
  els.routeFromBookedButton.addEventListener("click", routeFromBooked);
  els.routeZoneSelect.addEventListener("change", renderRoutes);
  els.prevPeriod.addEventListener("click", () => moveCalendar(-1));
  els.nextPeriod.addEventListener("click", () => moveCalendar(1));
  els.cancelLeadButton.addEventListener("click", closeLeadDialog);
  els.closeDialog.addEventListener("click", closeLeadDialog);
  els.archiveLeadButton.addEventListener("click", archiveCurrentLead);
  els.leadForm.addEventListener("submit", saveLeadFromForm);
  els.leadForm.addEventListener("input", updateDialogIntegrationLinks);
  els.leadForm.addEventListener("change", updateDialogIntegrationLinks);
  els.leadCalendarDownload.addEventListener("click", () => downloadLeadCalendar(currentLeadFromForm()));
  [els.leadAppleMaps, els.leadGoogleCalendar].forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("aria-disabled") === "true") event.preventDefault();
    });
  });

  document.querySelectorAll("[data-calendar-view]").forEach((button) => {
    button.addEventListener("click", () => {
      calendarView = button.dataset.calendarView;
      document
        .querySelectorAll("[data-calendar-view]")
        .forEach((item) => item.classList.toggle("active", item === button));
      renderCalendar();
    });
  });

  document.querySelectorAll("[data-counter]").forEach((button) => {
    button.addEventListener("click", () => {
      adjustCounter(button.dataset.counter, Number(button.dataset.step));
    });
  });

  window.addEventListener("online", renderSyncState);
  window.addEventListener("offline", renderSyncState);
}

function hydrateFormOptions() {
  fillSelect(els.leadStatus, STATUSES);
  fillSelect(els.leadZone, ZONES);
  fillSelect(els.statusFilter, ["All statuses", ...STATUSES]);
  fillSelect(els.zoneFilter, ["All zones", ...ZONES]);
  fillSelect(els.routeZoneSelect, ["All zones", ...ZONES]);
}

function fillSelect(select, options) {
  if (!select) return;
  select.innerHTML = options.map((option) => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("");
}

function loadState() {
  const saved = storageGet(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeState(JSON.parse(saved));
    } catch {
      storageRemove(STORAGE_KEY);
    }
  }

  return defaultState();
}

function defaultState() {
  return {
    leads: seedLeads.map(normalizeLead),
    session: {
      active: false,
      startedAt: null,
      elapsedSeconds: 0,
      doors: 18,
      quotes: 6,
      closed: 2,
    },
    routeOrder: seedLeads.map((lead) => lead.id),
    theme: "light",
  };
}

function saveState() {
  const saved = storageSet(STORAGE_KEY, JSON.stringify(state));
  renderSyncState();
  if (!saved) showToast("Storage is full or blocked. Export your CRM data.");
}

function normalizeState(value) {
  const fallback = defaultState();
  if (!value || typeof value !== "object") return fallback;

  const rawLeads = Array.isArray(value.leads) ? value.leads : fallback.leads;
  const seen = new Set();
  const leads = rawLeads.map(normalizeLead).filter((lead) => {
    if (seen.has(lead.id)) return false;
    seen.add(lead.id);
    return true;
  });
  const leadIds = leads.map((lead) => lead.id);
  const routeOrder = Array.isArray(value.routeOrder)
    ? value.routeOrder.filter((id) => leadIds.includes(id))
    : [];

  return {
    leads,
    session: normalizeSession(value.session),
    routeOrder: [...routeOrder, ...leadIds.filter((id) => !routeOrder.includes(id))],
    theme: value.theme === "dark" ? "dark" : "light",
  };
}

function normalizeLead(value) {
  const lead = value && typeof value === "object" ? value : {};
  const status = normalizeStatus(lead.status);
  const zone = ZONES.includes(lead.zone) ? lead.zone : ZONES[0];
  const team = TEAMS.includes(lead.team) ? lead.team : TEAMS[0];
  const createdAt = validISODateTime(lead.createdAt) ? lead.createdAt : new Date().toISOString();
  const completedAt =
    status === "Completed"
      ? completionDateForLead(lead, createdAt)
      : null;

  return {
    id: String(lead.id || `lead_${uniqueId()}`),
    name: String(lead.name || "Unnamed lead").trim(),
    phone: String(lead.phone || "").trim(),
    address: String(lead.address || "").trim(),
    notes: String(lead.notes || "").trim(),
    size: sizeMinutes[lead.size] ? lead.size : "Medium",
    price: Math.max(0, number(lead.price)),
    status,
    zone,
    team,
    scheduledDate: validISODate(lead.scheduledDate) ? lead.scheduledDate : "",
    scheduledTime: validTime(lead.scheduledTime) ? lead.scheduledTime : "",
    routeOrder: safeInteger(lead.routeOrder, 0),
    archived: Boolean(lead.archived),
    createdAt,
    completedAt,
    timerSeconds: Math.max(0, safeInteger(lead.timerSeconds, 0)),
    timerStartedAt: validTimestamp(lead.timerStartedAt) ? lead.timerStartedAt : null,
  };
}

function normalizeSession(value) {
  const session = value && typeof value === "object" ? value : {};
  const startedAt = validTimestamp(session.startedAt) ? session.startedAt : null;
  return {
    active: Boolean(session.active && startedAt),
    startedAt,
    elapsedSeconds: Math.max(0, safeInteger(session.elapsedSeconds, 0)),
    doors: Math.max(0, safeInteger(session.doors, 0)),
    quotes: Math.max(0, safeInteger(session.quotes, 0)),
    closed: Math.max(0, safeInteger(session.closed, 0)),
  };
}

function completionDateForLead(lead, fallback) {
  if (validISODateTime(lead.completedAt)) return lead.completedAt;
  if (validISODate(lead.scheduledDate)) return new Date(`${lead.scheduledDate}T12:00:00`).toISOString();
  return fallback;
}

function normalizeStatus(status) {
  if (STATUSES.includes(status)) return status;
  if (status === "Lead") return "Knocked";
  if (status === "In Progress") return "Booked";
  if (status === "Lost") return "Knocked";
  return "Knocked";
}

function storageGet(key) {
  try {
    return globalThis.localStorage?.getItem(key) || null;
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key) {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Ignore blocked localStorage cleanup.
  }
}

function renderAll() {
  renderSyncState();
  renderDashboard();
  renderPipeline();
  renderSession();
  renderRoutes();
  renderCalendar();
  renderJobTimers();
}

function setView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  const active = document.querySelector(`#${view}View`);
  els.viewTitle.textContent = active?.dataset.title || "Dashboard";
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

function renderDashboard() {
  const activeLeads = getActiveLeads();
  const completed = activeLeads.filter((lead) => lead.status === "Completed");
  const totalRevenue = completed.reduce((sum, lead) => sum + number(lead.price), 0);
  const todayRevenue = revenueForPeriod("day");
  const conversionRate = calculateConversionRate(activeLeads);
  const sessionYesRate = calculateSessionYesRate();
  const progress = Math.min(100, Math.round((todayRevenue / DAILY_GOAL) * 100));

  els.todayRevenue.textContent = currency(totalRevenue);
  els.weekRevenue.textContent = `${conversionRate}%`;
  els.monthRevenue.textContent = `${sessionYesRate}%`;
  els.avgRevenue.textContent = String(completed.length);
  els.completedCount.textContent = `${completed.length} completed ${completed.length === 1 ? "job" : "jobs"}`;
  els.dailyGoalText.textContent = `${currency(todayRevenue)} toward ${currency(DAILY_GOAL)} goal`;
  els.dailyGoalBar.style.width = `${progress}%`;

  const maxCount = Math.max(1, ...STATUSES.map((status) => activeLeads.filter((lead) => lead.status === status).length));
  els.pipelineSummary.innerHTML = STATUSES.map((status) => {
    const count = activeLeads.filter((lead) => lead.status === status).length;
    return `
      <div class="pipeline-row">
        <strong>${status}</strong>
        <div class="pipeline-bar"><span style="width:${(count / maxCount) * 100}%"></span></div>
        <span>${count}</span>
      </div>
    `;
  }).join("");

  const todayJobs = activeLeads
    .filter((lead) => lead.scheduledDate === todayISO() && ["Booked", "Completed"].includes(lead.status))
    .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));

  els.todayJobs.innerHTML = todayJobs.length
    ? todayJobs.map(jobRow).join("")
    : `<div class="empty-state">No jobs scheduled today. Book the nearest quoted lead and keep the route tight.</div>`;
  els.todayJobs.querySelectorAll(".job-row[data-id]").forEach((button) => {
    button.addEventListener("click", () => openLeadDialog(button.dataset.id));
  });
}

function renderPipeline() {
  const search = els.leadSearch.value.trim().toLowerCase();
  const statusFilter = els.statusFilter.value;
  const zoneFilter = els.zoneFilter.value;
  const leads = getActiveLeads().filter((lead) => {
    const haystack = `${lead.name} ${lead.phone} ${lead.address} ${lead.notes}`.toLowerCase();
    return (
      (!search || haystack.includes(search)) &&
      (statusFilter === "All statuses" || lead.status === statusFilter) &&
      (zoneFilter === "All zones" || lead.zone === zoneFilter)
    );
  });

  els.pipelineBoard.innerHTML = STATUSES.map((status) => {
    const statusLeads = leads.filter((lead) => lead.status === status);
    return `
      <section class="status-column" data-status="${status}">
        <div class="status-header">
          <strong>${status}</strong>
          <span>${statusLeads.length}</span>
        </div>
        <div class="lead-list">
          ${
            statusLeads.length
              ? statusLeads.map(leadCard).join("")
              : `<div class="empty-state">No ${status.toLowerCase()} jobs</div>`
          }
        </div>
      </section>
    `;
  }).join("");

  els.pipelineBoard.querySelectorAll("[data-edit-lead]").forEach((button) => {
    button.addEventListener("click", () => openLeadDialog(button.dataset.editLead));
  });
  els.pipelineBoard.querySelectorAll("[data-archive-lead]").forEach((button) => {
    button.addEventListener("click", () => archiveLeadById(button.dataset.archiveLead));
  });
  els.pipelineBoard.querySelectorAll("[data-status-change]").forEach((button) => {
    button.addEventListener("click", () => updateLeadStatus(button.dataset.leadId, button.dataset.statusChange));
  });
}

function renderSession() {
  const elapsed = getSessionElapsed();
  const hours = Math.max(elapsed / 3600, 0.001);
  const todayRevenue = revenueForPeriod("day");
  els.sessionTimer.textContent = formatDuration(elapsed);
  els.sessionStatus.textContent = state.session.active
    ? `Session running since ${new Date(state.session.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : "No active knock session";
  els.sessionToggle.textContent = state.session.active ? "Stop session" : "Start session";
  els.doorsCount.textContent = state.session.doors;
  els.quotesCount.textContent = state.session.quotes;
  els.closedCount.textContent = state.session.closed;
  els.closeRate.textContent = `${Math.round((state.session.closed / Math.max(state.session.doors, 1)) * 100)}%`;
  els.quotesPerHour.textContent = formatNumber(state.session.quotes / hours);
  els.knockRevenuePerHour.textContent = currency(todayRevenue / hours);
}

function renderRoutes() {
  const selectedZone = els.routeZoneSelect.value || "All zones";
  const stops = getRouteStops(selectedZone);
  renderRouteMap(stops, selectedZone);
  renderRouteStops(stops);
  renderRouteLinks(stops);
}

function renderRouteMap(stops, selectedZone) {
  if (!stops.length) {
    els.routeMap.innerHTML = `<div class="empty-state">No route stops in this zone yet.</div>`;
    return;
  }

  const pins = stops.map((lead, index) => {
    const point = pointForLead(lead, index);
    return `<div class="map-pin" style="left:${point.x}%; top:${point.y}%">${index + 1}</div>`;
  });

  const polyline = stops
    .map((lead, index) => {
      const point = pointForLead(lead, index);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const zoneText =
    selectedZone === "All zones"
      ? "All active booked and in-progress stops grouped by route zone"
      : `${selectedZone}: ${stops.length} stop${stops.length === 1 ? "" : "s"}`;

  els.routeMap.innerHTML = `
    <svg class="map-route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${polyline}" fill="none" stroke="var(--primary)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>
    </svg>
    ${pins.join("")}
    <div class="map-zone-label">${escapeHTML(zoneText)}</div>
  `;
}

function renderRouteStops(stops) {
  els.routeStops.innerHTML = stops.length
    ? stops
        .map(
          (lead, index) => `
          <article class="route-card" draggable="true" data-id="${lead.id}">
            <div class="route-number">${index + 1}</div>
            <div>
              <strong>${escapeHTML(lead.name)}</strong>
              <small>${escapeHTML(lead.address)} - ${escapeHTML(lead.zone)} - ${lead.scheduledTime || "Any time"}</small>
              <div class="route-links">
                <a href="${appleMapsUrl(lead.address)}" target="_blank" rel="noreferrer">Apple Maps</a>
                ${hasScheduledTime(lead) ? `<a href="${googleCalendarUrl(lead)}" target="_blank" rel="noreferrer">Google Calendar</a>` : ""}
              </div>
            </div>
            <div class="drag-handle" aria-hidden="true">=</div>
          </article>
        `
        )
        .join("")
    : `<div class="empty-state">Book or start jobs to build today's route.</div>`;

  els.routeStops.querySelectorAll(".route-card").forEach((card) => {
    card.addEventListener("dragstart", () => {
      routeDragId = card.dataset.id;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      routeDragId = null;
      card.classList.remove("dragging");
    });
    card.addEventListener("dragover", (event) => event.preventDefault());
    card.addEventListener("drop", () => reorderRoute(routeDragId, card.dataset.id));
  });
}

function renderRouteLinks(stops) {
  if (!stops.length) {
    setIntegrationLink(els.googleRouteLink, "#", false);
    setIntegrationLink(els.appleRouteLink, "#", false);
    return;
  }
  const addresses = stops.map((lead) => encodeURIComponent(lead.address));
  const origin = addresses[0];
  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(1, -1).join("|");
  setIntegrationLink(
    els.googleRouteLink,
    `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }`,
    true
  );
  setIntegrationLink(els.appleRouteLink, appleMapsUrl(stops[0].address), true);
}

function renderCalendar() {
  if (calendarView === "week") renderWeekCalendar();
  else renderMonthCalendar();
  renderUnscheduledJobs();
}

function renderWeekCalendar() {
  const start = startOfWeek(calendarCursor);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  els.calendarTitle.textContent = `${monthShort(days[0])} ${days[0].getDate()} - ${monthShort(days[6])} ${days[6].getDate()}`;
  els.calendarShell.innerHTML = `
    <div class="week-calendar">
      <div class="calendar-head"></div>
      ${days
        .map(
          (day) => `
        <div class="calendar-head">
          <strong>${weekdayShort(day)}</strong><br />
          <span>${monthShort(day)} ${day.getDate()}</span>
        </div>
      `
        )
        .join("")}
      ${hours
        .map(
          (hour) => `
          <div class="time-cell">${formatHour(hour)}</div>
          ${days
            .map((day) => {
              const date = toISODate(day);
              const jobs = scheduledJobsForSlot(date, hour);
              return `
                <div class="day-cell" data-date="${date}" data-hour="${hour}">
                  ${jobs.map(calendarJob).join("")}
                </div>
              `;
            })
            .join("")}
        `
        )
        .join("")}
    </div>
  `;
  bindCalendarDrag(els.calendarShell);
}

function renderMonthCalendar() {
  const first = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const start = startOfWeek(first);
  const days = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  els.calendarTitle.textContent = `${first.toLocaleDateString([], { month: "long", year: "numeric" })}`;
  els.calendarShell.innerHTML = `
    <div class="month-calendar">
      ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => `<div class="month-weekday">${day}</div>`).join("")}
      ${days
        .map((day) => {
          const date = toISODate(day);
          const jobs = getActiveLeads().filter((lead) => lead.scheduledDate === date);
          const outside = day.getMonth() !== first.getMonth();
          return `
            <div class="month-day ${outside ? "outside" : ""}" data-date="${date}" data-hour="9">
              <span class="month-date">${day.getDate()}</span>
              ${jobs.slice(0, 3).map(calendarJob).join("")}
              ${jobs.length > 3 ? `<span class="chip">+${jobs.length - 3} more</span>` : ""}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
  bindCalendarDrag(els.calendarShell);
}

function renderUnscheduledJobs() {
  const jobs = getActiveLeads().filter((lead) => lead.status === "Booked" && !lead.scheduledDate);
  els.unscheduledJobs.innerHTML = jobs.length
    ? jobs
        .map(
          (lead) => `
          <button class="job-row calendar-job" draggable="true" data-id="${lead.id}" type="button">
            <span>
              <strong>${escapeHTML(lead.name)}</strong>
              <small>${escapeHTML(lead.address)} - ${currency(lead.price)} - ${durationForLead(lead)} min</small>
            </span>
          </button>
        `
        )
        .join("")
    : `<div class="empty-state">Booked jobs have a time slot.</div>`;
  bindCalendarDrag(els.unscheduledJobs);
}

function renderJobTimers() {
  const jobs = getActiveLeads().filter((lead) => ["Booked", "Completed"].includes(lead.status));
  els.jobTimers.innerHTML = jobs.length
    ? jobs
        .map((lead) => {
          const elapsed = getLeadElapsed(lead);
          const hours = Math.max(elapsed / 3600, 0.001);
          const isCompleted = lead.status === "Completed";
          return `
            <article class="timer-card">
              <div class="timer-card-header">
                <div>
                  <strong>${escapeHTML(lead.name)}</strong>
                  <small>${escapeHTML(lead.address)} - ${escapeHTML(lead.size)} - ${currency(lead.price)}</small>
                </div>
                <span class="chip">${escapeHTML(lead.status)}</span>
              </div>
              <div class="timer-readout">${formatDuration(elapsed)}</div>
              <small>Efficiency: ${currency(number(lead.price) / hours)} / hour</small>
              <div class="timer-actions">
                ${
                  isCompleted
                    ? `<button class="secondary-button" type="button" disabled>Completed</button>`
                    : `<button class="primary-button" type="button" data-timer-toggle="${lead.id}">${
                        lead.timerStartedAt ? "Stop" : "Start"
                      }</button>
                      <button class="secondary-button" type="button" data-complete-job="${lead.id}">Complete</button>`
                }
                <a class="secondary-button" href="${appleMapsUrl(lead.address)}" target="_blank" rel="noreferrer">Apple Maps</a>
                ${
                  hasScheduledTime(lead)
                    ? `<a class="secondary-button" href="${googleCalendarUrl(lead)}" target="_blank" rel="noreferrer">Google Calendar</a>
                       <button class="secondary-button" type="button" data-download-ics="${lead.id}">Calendar file</button>`
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">Booked jobs will appear here with timers.</div>`;

  els.jobTimers.querySelectorAll("[data-timer-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleJobTimer(button.dataset.timerToggle));
  });
  els.jobTimers.querySelectorAll("[data-complete-job]").forEach((button) => {
    button.addEventListener("click", () => completeJob(button.dataset.completeJob));
  });
  els.jobTimers.querySelectorAll("[data-download-ics]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = state.leads.find((item) => item.id === button.dataset.downloadIcs);
      if (lead) downloadLeadCalendar(lead);
    });
  });
}

function bindCalendarDrag(root = document) {
  if (!root) return;
  root.querySelectorAll(".calendar-job").forEach((job) => {
    job.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", job.dataset.id);
    });
    job.addEventListener("click", () => openLeadDialog(job.dataset.id));
  });

  root.querySelectorAll(".day-cell, .month-day").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("drop-target");
    });
    cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      cell.classList.remove("drop-target");
      const id = event.dataTransfer.getData("text/plain");
      scheduleLead(id, cell.dataset.date, Number(cell.dataset.hour || 9));
    });
  });
}

function openLeadDialog(id = "") {
  const lead = id ? state.leads.find((item) => item.id === id) : null;
  els.dialogMode.textContent = lead ? "Edit lead" : "New lead";
  els.dialogTitle.textContent = lead ? lead.name : "Add customer";
  els.leadId.value = lead?.id || "";
  els.leadName.value = lead?.name || "";
  els.leadPhone.value = lead?.phone || "";
  els.leadAddress.value = lead?.address || "";
  els.leadSize.value = lead?.size || "Medium";
  els.leadPrice.value = lead?.price || "";
  els.leadStatus.value = lead?.status || "Knocked";
  els.leadZone.value = lead?.zone || "North Route";
  els.leadTeam.value = lead?.team || "Team Member A";
  els.leadDate.value = lead?.scheduledDate || "";
  els.leadTime.value = lead?.scheduledTime || "";
  els.leadNotes.value = lead?.notes || "";
  els.archiveLeadButton.hidden = !lead;
  updateDialogIntegrationLinks();
  els.leadDialog.showModal();
  setTimeout(() => els.leadName.focus(), 60);
}

function closeLeadDialog() {
  els.leadDialog.close();
}

function saveLeadFromForm(event) {
  event.preventDefault();
  const id = els.leadId.value || `lead_${uniqueId()}`;
  const previous = state.leads.find((lead) => lead.id === id);
  const status = normalizeStatus(els.leadStatus.value);
  const name = els.leadName.value.trim();
  const address = els.leadAddress.value.trim();

  if (!name || !address) {
    showToast("Name and address are required");
    return;
  }

  const candidate = {
    id,
    team: els.leadTeam.value,
    scheduledDate: els.leadDate.value,
    scheduledTime: els.leadTime.value,
    size: els.leadSize.value,
  };

  if (hasScheduleConflict(candidate)) {
    showToast(`${candidate.team} already has a job in that slot`);
    return;
  }

  const timerSeconds = previous?.timerStartedAt ? getLeadElapsed(previous) : previous?.timerSeconds || 0;
  const lead = {
    id,
    name,
    phone: els.leadPhone.value.trim(),
    address,
    notes: els.leadNotes.value.trim(),
    size: els.leadSize.value,
    price: number(els.leadPrice.value),
    status,
    zone: els.leadZone.value,
    team: els.leadTeam.value,
    scheduledDate: els.leadDate.value,
    scheduledTime: els.leadTime.value,
    routeOrder: previous?.routeOrder ?? state.routeOrder.length,
    archived: false,
    createdAt: previous?.createdAt || new Date().toISOString(),
    completedAt: status === "Completed" ? previous?.completedAt || new Date().toISOString() : null,
    timerSeconds,
    timerStartedAt: status === "Completed" ? null : previous?.timerStartedAt || null,
  };
  const cleanLead = normalizeLead(lead);

  if (previous) {
    state.leads = state.leads.map((item) => (item.id === id ? cleanLead : item));
  } else {
    state.leads.push(cleanLead);
  }

  if (!state.routeOrder.includes(id)) {
    state.routeOrder.push(id);
  }

  if (status === "Completed") {
    state.session.closed = Math.max(state.session.closed, completedTodayCount());
  }

  closeLeadDialog();
  saveState();
  renderAll();
  showToast(previous ? "Lead updated" : "Lead added");
}

function archiveCurrentLead() {
  const id = els.leadId.value;
  if (!id) return;
  if (archiveLeadById(id)) closeLeadDialog();
}

function archiveLeadById(id, confirmArchive = true) {
  if (!id) return false;
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return false;
  if (confirmArchive && !window.confirm(`Archive ${lead.name}?`)) return false;
  state.leads = state.leads.map((item) =>
    item.id === id ? { ...item, archived: true, timerSeconds: getLeadElapsed(item), timerStartedAt: null } : item
  );
  saveState();
  renderAll();
  showToast("Lead archived");
  return true;
}

function updateLeadStatus(id, status) {
  const nextStatus = normalizeStatus(status);
  const lead = state.leads.find((item) => item.id === id);
  if (!lead || lead.archived) return;
  lead.status = nextStatus;
  if (nextStatus === "Completed") {
    lead.timerSeconds = getLeadElapsed(lead);
    lead.timerStartedAt = null;
    lead.completedAt = lead.completedAt || new Date().toISOString();
  } else {
    lead.completedAt = null;
  }
  saveState();
  renderAll();
  showToast(`${lead.name} moved to ${nextStatus}`);
}

function toggleSession() {
  if (state.session.active) {
    state.session.elapsedSeconds = getSessionElapsed();
    state.session.active = false;
    state.session.startedAt = null;
    showToast("Knock session stopped");
  } else {
    state.session.active = true;
    state.session.startedAt = Date.now();
    showToast("Knock session started");
  }
  saveState();
  renderSession();
}

function adjustCounter(counter, step) {
  if (!["doors", "quotes", "closed"].includes(counter)) return;
  state.session[counter] = Math.max(0, safeInteger(state.session[counter], 0) + safeInteger(step, 0));
  saveState();
  renderSession();
}

function optimizeRoute() {
  const selectedZone = els.routeZoneSelect.value || "All zones";
  const stops = getRouteStops(selectedZone)
    .slice()
    .sort((a, b) => {
      const pointA = pointForLead(a, 0);
      const pointB = pointForLead(b, 0);
      return pointA.x + pointA.y - (pointB.x + pointB.y);
    });
  const ids = stops.map((lead) => lead.id);
  state.routeOrder = [...ids, ...state.routeOrder.filter((id) => !ids.includes(id))];
  saveState();
  renderRoutes();
  showToast("Route optimized by neighborhood cluster");
}

function routeFromBooked() {
  const booked = getActiveLeads()
    .filter((lead) => lead.status === "Booked")
    .sort((a, b) => (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99"))
    .map((lead) => lead.id);
  state.routeOrder = [...booked, ...state.routeOrder.filter((id) => !booked.includes(id))];
  saveState();
  renderRoutes();
  showToast("Route rebuilt from booked jobs");
}

function reorderRoute(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const order = state.routeOrder.filter((id) => id !== sourceId);
  const targetIndex = order.indexOf(targetId);
  if (targetIndex < 0) return;
  order.splice(targetIndex, 0, sourceId);
  state.routeOrder = order;
  saveState();
  renderRoutes();
}

function scheduleLead(id, date, hour) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  if (!validISODate(date) || !Number.isFinite(hour)) return;
  const cleanHour = clamp(Math.floor(hour), 0, 23);
  const scheduledTime = `${String(cleanHour).padStart(2, "0")}:00`;
  const conflict = hasScheduleConflict({ ...lead, scheduledDate: date, scheduledTime });

  if (conflict) {
    showToast(`${lead.team} already has a job in that slot`);
    return;
  }

  lead.scheduledDate = date;
  lead.scheduledTime = scheduledTime;
  lead.status = lead.status === "Knocked" || lead.status === "Quoted" ? "Booked" : lead.status;
  saveState();
  renderAll();
  showToast("Job scheduled");
}

function toggleJobTimer(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  if (lead.status === "Completed" || lead.archived) return;
  if (lead.timerStartedAt) {
    lead.timerSeconds = getLeadElapsed(lead);
    lead.timerStartedAt = null;
    showToast("Job timer stopped");
  } else {
    lead.timerStartedAt = Date.now();
    showToast("Job timer started");
  }
  saveState();
  renderAll();
}

function completeJob(id) {
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return;
  if (lead.status === "Completed") return;
  lead.timerSeconds = getLeadElapsed(lead);
  lead.timerStartedAt = null;
  lead.status = "Completed";
  lead.completedAt = new Date().toISOString();
  state.session.closed = Math.max(state.session.closed, completedTodayCount());
  saveState();
  renderAll();
  showToast("Job completed and revenue tracked");
}

function moveCalendar(direction) {
  calendarCursor =
    calendarView === "week"
      ? addDays(calendarCursor, direction * 7)
      : new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + direction, 1);
  renderCalendar();
}

function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    leads: state.leads,
    session: state.session,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clearpath-crm-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("CRM data exported");
}

function currentLeadFromForm() {
  return {
    id: els.leadId.value || "new-job",
    name: els.leadName.value.trim() || "Window Cleaning Job",
    phone: els.leadPhone.value.trim(),
    address: els.leadAddress.value.trim(),
    notes: els.leadNotes.value.trim(),
    size: els.leadSize.value,
    price: number(els.leadPrice.value),
    status: normalizeStatus(els.leadStatus.value),
    zone: els.leadZone.value,
    team: els.leadTeam.value,
    scheduledDate: els.leadDate.value,
    scheduledTime: els.leadTime.value,
  };
}

function updateDialogIntegrationLinks() {
  const lead = currentLeadFromForm();
  const hasAddress = Boolean(lead.address);
  const hasCalendarTime = hasScheduledTime(lead);
  setIntegrationLink(els.leadAppleMaps, hasAddress ? appleMapsUrl(lead.address) : "#", hasAddress);
  setIntegrationLink(els.leadGoogleCalendar, hasCalendarTime ? googleCalendarUrl(lead) : "#", hasCalendarTime);
  els.leadCalendarDownload.disabled = !hasCalendarTime;
}

function setIntegrationLink(link, href, enabled) {
  if (!link) return;
  link.href = href;
  link.classList.toggle("is-disabled", !enabled);
  link.setAttribute("aria-disabled", String(!enabled));
  link.tabIndex = enabled ? 0 : -1;
}

function hasScheduledTime(lead) {
  return Boolean(lead.scheduledDate && lead.scheduledTime);
}

function appleMapsUrl(address) {
  return `https://maps.apple.com/?daddr=${encodeURIComponent(address)}&dirflg=d`;
}

function googleCalendarUrl(lead) {
  const range = eventDateRange(lead);
  if (!range) return "#";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const details = [
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.price ? `Quoted price: ${currency(lead.price)}` : "",
    lead.size ? `House size: ${lead.size}` : "",
    lead.team ? `Assigned to: ${lead.team}` : "",
    lead.notes ? `Notes: ${lead.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Window Cleaning - ${lead.name}`,
    dates: `${formatGoogleDate(range.start)}/${formatGoogleDate(range.end)}`,
    details,
    location: lead.address || "",
    ctz: timeZone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function eventDateRange(lead) {
  if (!hasScheduledTime(lead)) return null;
  if (!validISODate(lead.scheduledDate) || !validTime(lead.scheduledTime)) return null;
  const [year, month, day] = lead.scheduledDate.split("-").map(Number);
  const [hour, minute] = lead.scheduledTime.split(":").map(Number);
  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) return null;
  const start = new Date(year, month - 1, day, hour, minute, 0);
  const end = new Date(start.getTime() + durationForLead(lead) * 60000);
  return { start, end };
}

function formatGoogleDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "T",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    "00",
  ].join("");
}

function downloadLeadCalendar(lead) {
  const calendarText = icsForLead(lead);
  if (!calendarText) {
    showToast("Add a scheduled date and time first");
    return;
  }
  const blob = new Blob([calendarText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFilePart(lead.name)}-${lead.scheduledDate}.ics`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Calendar file downloaded");
}

function icsForLead(lead) {
  const range = eventDateRange(lead);
  if (!range) return "";
  const description = [
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.price ? `Quoted price: ${currency(lead.price)}` : "",
    lead.size ? `House size: ${lead.size}` : "",
    lead.team ? `Assigned to: ${lead.team}` : "",
    lead.notes ? `Notes: ${lead.notes}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClearPath CRM//Window Cleaning CRM//EN",
    "BEGIN:VEVENT",
    `UID:${escapeICS(lead.id)}@clearpath-crm`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(range.start)}`,
    `DTEND:${formatICSDate(range.end)}`,
    `SUMMARY:${escapeICS(`Window Cleaning - ${lead.name}`)}`,
    `LOCATION:${escapeICS(lead.address || "")}`,
    `DESCRIPTION:${escapeICS(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function formatICSDate(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    "T",
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
    "Z",
  ].join("");
}

function escapeICS(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function safeFilePart(value) {
  const cleaned = String(value || "job")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return cleaned || "job";
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  els.themeToggle.textContent = state.theme === "dark" ? "Light mode" : "Dark mode";
}

function renderSyncState() {
  const saved = storageGet(STORAGE_KEY) ? "Saved locally" : "Offline-ready";
  if (!els.syncState) return;
  els.syncState.textContent = navigator.onLine ? saved : "Working offline";
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => registration.update())
      .catch(() => {});
  }
}

function startTicker() {
  setInterval(() => {
    renderSession();
    if (currentView === "jobs") renderJobTimers();
  }, 1000);
}

function getActiveLeads() {
  return (Array.isArray(state.leads) ? state.leads : []).filter((lead) => lead && !lead.archived);
}

function getRouteStops(selectedZone) {
  const routeOrder = Array.isArray(state.routeOrder) ? state.routeOrder : [];
  const ids = new Set(routeOrder);
  const routeLeads = getActiveLeads()
    .filter((lead) => ["Booked", "Completed"].includes(lead.status))
    .filter((lead) => selectedZone === "All zones" || lead.zone === selectedZone)
    .sort((a, b) => {
      const indexA = routeOrder.indexOf(a.id);
      const indexB = routeOrder.indexOf(b.id);
      return (ids.has(a.id) ? indexA : 999) - (ids.has(b.id) ? indexB : 999);
    });
  return routeLeads;
}

function revenueForPeriod(period) {
  const now = new Date();
  return getActiveLeads()
    .filter((lead) => lead.status === "Completed" && lead.completedAt)
    .filter((lead) => {
      const date = new Date(lead.completedAt);
      if (!validDateObject(date) || date > now) return false;
      if (period === "day") return toISODate(date) === todayISO();
      if (period === "week") return date >= startOfWeek(now);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    })
    .reduce((sum, lead) => sum + number(lead.price), 0);
}

function completedTodayCount() {
  return getActiveLeads().filter((lead) => {
    const date = new Date(lead.completedAt);
    return lead.status === "Completed" && validDateObject(date) && toISODate(date) === todayISO();
  }).length;
}

function calculateConversionRate(leads = getActiveLeads()) {
  const knocked = leads.filter((lead) => STATUSES.includes(lead.status)).length;
  const booked = leads.filter((lead) => lead.status === "Booked" || lead.status === "Completed").length;
  return Math.round((booked / Math.max(knocked, 1)) * 100);
}

function calculateSessionYesRate() {
  return Math.round((safeInteger(state.session.closed, 0) / Math.max(safeInteger(state.session.quotes, 0), 1)) * 100);
}

function getSessionElapsed() {
  if (!state.session.active || !state.session.startedAt) return safeInteger(state.session.elapsedSeconds, 0);
  return Math.max(0, safeInteger(state.session.elapsedSeconds, 0) + Math.floor((Date.now() - state.session.startedAt) / 1000));
}

function getLeadElapsed(lead) {
  if (!lead || !lead.timerStartedAt) return Math.max(0, safeInteger(lead?.timerSeconds, 0));
  return Math.max(0, safeInteger(lead.timerSeconds, 0) + Math.floor((Date.now() - lead.timerStartedAt) / 1000));
}

function pointForLead(lead, index) {
  const base = zoneCoordinates[lead?.zone] || zoneCoordinates.Downtown;
  const hash = hashString(lead?.address);
  const offsetX = ((hash % 17) - 8) * 0.8 + index * 0.4;
  const offsetY = (((hash >> 4) % 17) - 8) * 0.8 - index * 0.35;
  return {
    x: clamp(base.x + offsetX, 7, 93),
    y: clamp(base.y + offsetY, 8, 92),
  };
}

function jobRow(lead) {
  return `
    <button class="job-row" type="button" data-id="${escapeHTML(lead.id)}">
      <span>
        <strong>${escapeHTML(lead.name)}</strong>
        <small>${lead.scheduledTime || "Any time"} - ${escapeHTML(lead.team)} - ${durationForLead(lead)} min</small>
      </span>
      <span class="chip">${currency(lead.price)}</span>
    </button>
  `;
}

function leadCard(lead) {
  const statusButtons = STATUSES.map(
    (status) => `
      <button class="status-action ${lead.status === status ? "active" : ""}" type="button" data-lead-id="${escapeHTML(
        lead.id
      )}" data-status-change="${escapeHTML(status)}">${escapeHTML(status)}</button>
    `
  ).join("");
  return `
    <article class="lead-card" data-id="${escapeHTML(lead.id)}" data-status="${escapeHTML(lead.status)}">
      <div class="lead-card-top">
        <div>
          <strong>${escapeHTML(lead.name)}</strong>
          <small>${escapeHTML(lead.address || "No address")}</small>
        </div>
        <button class="small-button" type="button" data-edit-lead="${escapeHTML(lead.id)}">Edit</button>
      </div>
      <div class="lead-meta">
        <span class="chip">${currency(lead.price)}</span>
        <span class="chip">${escapeHTML(lead.size)}</span>
        <span class="chip">${escapeHTML(lead.zone)}</span>
        ${lead.scheduledDate ? `<span class="chip">${escapeHTML(lead.scheduledDate)} ${escapeHTML(lead.scheduledTime || "")}</span>` : ""}
      </div>
      <div class="status-actions">${statusButtons}</div>
      <button class="archive-inline" type="button" data-archive-lead="${escapeHTML(lead.id)}">Archive</button>
    </article>
  `;
}

function calendarJob(lead) {
  const conflict = hasConflict(lead);
  return `
    <button class="calendar-job ${conflict ? "conflict" : ""}" draggable="true" data-id="${lead.id}" type="button">
      <strong>${escapeHTML(lead.name)}</strong>
      <small>${lead.scheduledTime || "Any"} - ${escapeHTML(lead.team)}</small>
    </button>
  `;
}

function scheduledJobsForSlot(date, hour) {
  return getActiveLeads()
    .filter((lead) => {
      const minutes = timeToMinutes(lead.scheduledTime);
      return lead.scheduledDate === date && minutes !== null && Math.floor(minutes / 60) === hour;
    })
    .sort((a, b) => a.team.localeCompare(b.team));
}

function hasConflict(lead) {
  if (!lead.scheduledDate || !lead.scheduledTime) return false;
  return hasScheduleConflict(lead);
}

function hasScheduleConflict(lead) {
  if (!lead.scheduledDate || !lead.scheduledTime) return false;
  const start = timeToMinutes(lead.scheduledTime);
  if (start === null) return false;
  const end = start + durationForLead(lead);
  return getActiveLeads().some((item) => {
    if (item.id === lead.id || item.team !== lead.team || item.scheduledDate !== lead.scheduledDate || !item.scheduledTime) return false;
    const itemStart = timeToMinutes(item.scheduledTime);
    if (itemStart === null) return false;
    const itemEnd = itemStart + durationForLead(item);
    return start < itemEnd && end > itemStart;
  });
}

function uniqueId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function validISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return validDateObject(date) && toISODate(date) === value;
}

function validISODateTime(value) {
  return typeof value === "string" && validDateObject(new Date(value));
}

function validTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function validTimestamp(value) {
  return Number.isFinite(value) && value > 0 && value <= Date.now() + 86400000;
}

function validDateObject(date) {
  return date instanceof Date && Number.isFinite(date.getTime());
}

function safeInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}

function durationForLead(lead) {
  return sizeMinutes[lead?.size] || 120;
}

function timeToMinutes(time) {
  if (!validTime(time)) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value || 0);
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, safeInteger(seconds, 0));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour;
  return `${display} ${suffix}`;
}

function todayISO() {
  return toISODate(new Date());
}

function daysAgoISO(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function toISODate(date) {
  if (!validDateObject(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(date, days) {
  const copy = validDateObject(date) ? new Date(date) : new Date();
  copy.setDate(copy.getDate() + safeInteger(days, 0));
  return copy;
}

function monthShort(date) {
  return date.toLocaleDateString([], { month: "short" });
}

function weekdayShort(date) {
  return date.toLocaleDateString([], { weekday: "short" });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashString(input) {
  input = String(input || "");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => els.toast.classList.remove("show"), 2200);
}
