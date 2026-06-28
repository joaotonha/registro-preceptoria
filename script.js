const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwa_pZ31WMB84JpvWXV9MhaXxALHITVBoWWwB-hD7gq12SQJGyr7rzCD9UkDFse_hVk/exec",
};

const DEFAULT_ACTIVITY_OPTIONS = [
  "Observação direta de Visita Domiciliar",
  "Observação direta de Consulta Individual",
  "Observação direta de Reunião de Equipe",
  "Observação direta de Atividade Coletiva",
  "Observação direta de Consultório Territorializado",
  "Discussão de Abordagem Familiar",
  "Discussão de Abordagem Comunitária",
  "Supervisão de Turnos UERJ (AMI / Saúde da Mulher / PG)",
  "Supervisão de Canal Teórico da Clínica",
  "Supervisão de TCR",
  "Realização de feedback",
  "Supervisão de prontuário",
  "Supervisão de Procedimento Ambulatorial",
  "Outros",
];

const DEFAULT_EPA_OPTIONS = [
  "EPA 1 – Atendendo integralmente as condições em saúde em todas as faixas etárias e ciclos de vida",
  "EPA 2 – Atendendo pessoas de etnia, raça ou cultura semelhante ou distinta da sua própria",
  "EPA 3 – Atendendo pessoas LGBTQIAPN+",
  "EPA 4 – Atendendo pessoas vulnerabilizadas",
  "EPA 5 – Coordenando o cuidado com base nas necessidades da pessoa",
  "EPA 6 – Realizando cuidado domiciliar",
  "EPA 7 – Realizando procedimentos ambulatoriais",
  "EPA 8 – Realizando o atendimento inicial às situações de urgência e emergência",
  "EPA 9 – Facilitando o ensino de Medicina de Família e Comunidade aos seus pares e outros aprendizes",
  "EPA 10 – Atendendo pessoas acometidas por transtornos mentais",
  "EPA 11 – Organizando os processos de trabalho em saúde",
  "EPA 12 – Utilizando a abordagem familiar no cuidado às pessoas e suas famílias",
  "EPA 13 – Utilizando a abordagem comunitária no cuidado das pessoas, famílias e comunidade",
  "EPA 14 – Promovendo acesso e continuidade do cuidado",
  "EPA 15 – Promovendo saúde planetária em seu contexto",
];

const DEFAULT_UNIT_OPTIONS = [
  "CMS Heitor Beltrão",
  "CMS Hélio Pellegrino",
  "CMS Maria Augusta Estrella",
  "CMS Ernani Agrícola",
  "CF Odalea Firmo Dutra",
  "CMS Salles Netto",
  "CF Sérgio Vieira de Mello",
  "CF Ana Maria Conceição dos Santos Correia",
  "Paraty",
  "Piraí",
  "Três Rios",
  "Cabo Frio",
  "Volta Redonda",
  "AMI",
  "Saúde da Mulher",
];

const DEFAULT_PROGRESS_LEVEL_OPTIONS = [
  "Não faz",
  "Faz com supervisão direta",
  "Faz com supervisão indireta",
  "Faz sozinho",
  "Consegue ensinar/supervisionar",
];

const state = {
  preceptorName: localStorage.getItem("preceptoria.preceptorName") || "",
  preceptorEmail: localStorage.getItem("preceptoria.preceptorEmail") || "",
  preceptorUnit: localStorage.getItem("preceptoria.preceptorUnit") || "",
  history: [],
  epaProgress: [],
  epaCatalog: [...DEFAULT_EPA_OPTIONS],
  epaTasks: [],
  residentDirectory: [],
  residentNames: [],
  unitNames: [...DEFAULT_UNIT_OPTIONS],
  editingId: "",
  filter: "",
  historyScope: localStorage.getItem("preceptoria.historyScope") || "mine",
  historyFilters: {
    resident: "",
    activity: "",
    dateStart: "",
    dateEnd: "",
  },
  epaFilter: "",
  epaFilters: {
    resident: "",
    epa: "",
    level: "",
  },
  epaSelectedResident: "",
  activityEpaMap: new Map(),
  epaEditingId: "",
  activeView: "diary",
};

const els = {
  viewTabs: document.querySelector("#view-tabs"),
  diaryView: document.querySelector("#diary-view"),
  historyView: document.querySelector("#history-view"),
  epaView: document.querySelector("#epa-view"),
  tabButtons: document.querySelectorAll(".tab-button"),
  loginPanel: document.querySelector("#login-panel"),
  recordPanel: document.querySelector("#record-panel"),
  historyPanel: document.querySelector("#history-panel"),
  epaAppPanel: document.querySelector("#epa-panel"),
  loginForm: document.querySelector("#login-form"),
  recordForm: document.querySelector("#record-form"),
  epaProgressForm: document.querySelector("#epa-progress-form"),
  recordFormTitle: document.querySelector("#record-form-title"),
  recordId: document.querySelector("#record-id"),
  activityDate: document.querySelector("#activity-date"),
  residentYear: document.querySelector("#resident-year"),
  residentYearButtons: document.querySelectorAll("[data-resident-year]"),
  residentSelect: document.querySelector("#resident-select"),
  residentName: document.querySelector("#resident-name"),
  residentOtherName: document.querySelector("#resident-other-name"),
  residentListHint: document.querySelector("#resident-list-hint"),
  epaProgressId: document.querySelector("#epa-progress-id"),
  epaProgressDate: document.querySelector("#epa-progress-date"),
  epaResidentYear: document.querySelector("#epa-resident-year"),
  epaResidentYearButtons: document.querySelectorAll("[data-epa-resident-year]"),
  epaResidentSelect: document.querySelector("#epa-resident-select"),
  epaResidentName: document.querySelector("#epa-resident-name"),
  epaResidentOtherName: document.querySelector("#epa-resident-other-name"),
  epaResidentListHint: document.querySelector("#epa-resident-list-hint"),
  epaProgressSelect: document.querySelector("#epa-progress-select"),
  epaTaskSelect: document.querySelector("#epa-task-select"),
  epaProgressLevel: document.querySelector("#epa-progress-level"),
  epaLevelButtons: document.querySelectorAll("[data-epa-level]"),
  epaProgressNotes: document.querySelector("#epa-progress-notes"),
  epaProgressNextSteps: document.querySelector("#epa-progress-next-steps"),
  description: document.querySelector("#description"),
  preceptorName: document.querySelector("#preceptor-name"),
  preceptorEmail: document.querySelector("#preceptor-email"),
  preceptorUnit: document.querySelector("#preceptor-unit"),
  activePreceptor: document.querySelector("#active-preceptor"),
  changePreceptor: document.querySelector("#change-preceptor"),
  refreshHistory: document.querySelector("#refresh-history"),
  refreshEpa: document.querySelector("#refresh-epa"),
  submitRecord: document.querySelector("#submit-record"),
  submitEpaProgress: document.querySelector("#submit-epa-progress"),
  cancelEdit: document.querySelector("#cancel-edit"),
  cancelEpaEdit: document.querySelector("#cancel-epa-edit"),
  formMessage: document.querySelector("#form-message"),
  epaFormMessage: document.querySelector("#epa-form-message"),
  historyCards: document.querySelector("#history-card-list"),
  historyBody: document.querySelector("#history-body"),
  historyTitle: document.querySelector("#history-title"),
  historyScope: document.querySelector("#history-scope"),
  historyFilter: document.querySelector("#history-filter"),
  historyResidentFilter: document.querySelector("#history-resident-filter"),
  historyActivityFilter: document.querySelector("#history-activity-filter"),
  historyDateStart: document.querySelector("#history-date-start"),
  historyDateEnd: document.querySelector("#history-date-end"),
  clearHistoryFilters: document.querySelector("#clear-history-filters"),
  copyQuarterFeedback: document.querySelector("#copy-quarter-feedback"),
  historyResultsCount: document.querySelector("#history-results-count"),
  epaCards: document.querySelector("#epa-card-list"),
  epaSummaryList: document.querySelector("#epa-summary-list"),
  epaFilterInput: document.querySelector("#epa-filter"),
  epaResidentFilter: document.querySelector("#epa-resident-filter"),
  epaCatalogFilter: document.querySelector("#epa-catalog-filter"),
  epaLevelFilter: document.querySelector("#epa-level-filter"),
  clearEpaFilters: document.querySelector("#clear-epa-filters"),
  epaResultsCount: document.querySelector("#epa-results-count"),
  totalCount: document.querySelector("#total-count"),
  monthCount: document.querySelector("#month-count"),
  lastDate: document.querySelector("#last-date"),
  epaTotalCount: document.querySelector("#epa-total-count"),
  epaResidentCount: document.querySelector("#epa-resident-count"),
  epaLastDate: document.querySelector("#epa-last-date"),
  activity: document.querySelector("#activity"),
  epa: document.querySelector("#epa"),
  epaToggle: document.querySelector("#epa-toggle"),
  epaOptionsPanel: document.querySelector("#epa-options-panel"),
  epaSelectedSummary: document.querySelector("#epa-selected-summary"),
  rowTemplate: document.querySelector("#history-row-template"),
};

const diaryEpaControl = {
  hidden: els.epa,
  toggle: els.epaToggle,
  panel: els.epaOptionsPanel,
  summary: els.epaSelectedSummary,
  containerSelector: "#epa-multi-select",
  prefix: "epa-option",
};

function assertConfigured() {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("COLE_AQUI")) {
    throw new Error("Configure a URL do Apps Script no arquivo script.js.");
  }
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeUnit(unit) {
  return normalizeName(unit)
    .replace(/^Centro Municipal de Saúde\s+/i, "CMS ")
    .replace(/^Clinica da Familia\s+/i, "CF ")
    .replace(/^Clínica da Família\s+/i, "CF ");
}

function normalizeResidentYear(year) {
  const text = normalizeName(year).toUpperCase();
  const match = text.match(/\bR[123]\b/);
  return match ? match[0] : text;
}

function residentStorageKey() {
  return `preceptoria.residentNames.${state.preceptorEmail || "geral"}`;
}

function loadStoredResidentNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(residentStorageKey()) || "[]");
    return Array.isArray(stored) ? stored.map(normalizeName).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveStoredResidentNames() {
  localStorage.setItem(residentStorageKey(), JSON.stringify(state.residentNames.slice(0, 200)));
}

function normalizeResidentItem(item) {
  return {
    name: normalizeName(item.name || item.residentName),
    year: normalizeResidentYear(item.year || item.residentYear),
    unit: normalizeUnit(item.unit),
  };
}

function getVisibleResidentItems(selectedYear = els.residentYear.value) {
  const directoryItems = state.residentDirectory
    .map(normalizeResidentItem)
    .filter((item) => item.name)
    .filter((item) => !state.preceptorUnit || !item.unit || item.unit === state.preceptorUnit)
    .filter((item) => !selectedYear || item.year === selectedYear);

  const fallbackItems = state.residentDirectory.length
    ? []
    : state.residentNames.map((name) => ({ name, year: "", unit: state.preceptorUnit }));

  const byKey = new Map();
  [...directoryItems, ...fallbackItems].forEach((item) => {
    byKey.set(`${item.name}|${item.year}|${item.unit}`, item);
  });

  return [...byKey.values()].sort((a, b) => {
    const yearCompare = a.year.localeCompare(b.year, "pt-BR", { numeric: true });
    return yearCompare || a.name.localeCompare(b.name, "pt-BR");
  });
}

function renderResidentSelect(options) {
  const {
    select,
    hiddenInput,
    otherInput,
    hint,
    selectedYear,
    selectedValue,
  } = options;
  if (!select) return;

  const selectedName = normalizeName(selectedValue);
  const residents = getVisibleResidentItems(selectedYear);
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = residents.length ? "Selecione o residente" : "Nenhum residente encontrado";
  select.appendChild(placeholder);

  residents.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.year ? `${item.name} (${item.year})` : item.name;
    select.appendChild(option);
  });

  const otherOption = document.createElement("option");
  otherOption.value = "__other__";
  otherOption.textContent = "Outro / não listado";
  select.appendChild(otherOption);

  const hasSelectedName = selectedName && residents.some((item) => item.name === selectedName);
  if (hasSelectedName) {
    select.value = selectedName;
    otherInput.value = "";
  } else if (selectedName) {
    select.value = "__other__";
    otherInput.value = selectedName;
  } else {
    select.value = "";
    otherInput.value = "";
  }

  if (select.value === "__other__") {
    otherInput.classList.remove("is-hidden");
    hiddenInput.value = normalizeName(otherInput.value);
  } else {
    otherInput.classList.add("is-hidden");
    otherInput.value = "";
    hiddenInput.value = normalizeName(select.value);
  }

  const unitText = state.preceptorUnit ? `da unidade ${state.preceptorUnit}` : "da sua unidade";
  const yearText = selectedYear ? ` ${selectedYear}` : "";
  if (residents.length) {
    hint.textContent = `${residents.length} residentes${yearText} disponíveis ${unitText}.`;
  } else {
    hint.textContent = `Nenhum residente${yearText} encontrado ${unitText}. Use "Outro / não listado" se precisar.`;
  }
}

function syncResidentSelect(select, hiddenInput, otherInput) {
  if (select.value === "__other__") {
    otherInput.classList.remove("is-hidden");
    hiddenInput.value = normalizeName(otherInput.value);
    return;
  }

  otherInput.classList.add("is-hidden");
  otherInput.value = "";
  hiddenInput.value = normalizeName(select.value);
}

function syncResidentNameFromControls() {
  if (!els.residentSelect) return;
  syncResidentSelect(els.residentSelect, els.residentName, els.residentOtherName);
}

function renderResidentOptions(selectedValue = els.residentName.value) {
  renderResidentSelect({
    select: els.residentSelect,
    hiddenInput: els.residentName,
    otherInput: els.residentOtherName,
    hint: els.residentListHint,
    selectedYear: els.residentYear.value,
    selectedValue,
  });
}

function syncEpaResidentNameFromControls() {
  if (!els.epaResidentSelect) return;
  syncResidentSelect(els.epaResidentSelect, els.epaResidentName, els.epaResidentOtherName);
}

function renderEpaResidentOptions(selectedValue = els.epaResidentName.value) {
  renderResidentSelect({
    select: els.epaResidentSelect,
    hiddenInput: els.epaResidentName,
    otherInput: els.epaResidentOtherName,
    hint: els.epaResidentListHint,
    selectedYear: els.epaResidentYear.value,
    selectedValue,
  });
}

function rememberResidentNames(names) {
  const merged = new Set(state.residentNames);
  names.map(normalizeName).filter(Boolean).forEach((name) => merged.add(name));
  state.residentNames = [...merged].sort((a, b) => a.localeCompare(b, "pt-BR"));
  saveStoredResidentNames();
  renderResidentOptions();
}

function renderUnitOptions(selectedValue = state.preceptorUnit) {
  const normalizedSelected = normalizeUnit(selectedValue);
  els.preceptorUnit.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = state.unitNames.length
    ? "Selecione sua unidade"
    : "Cadastre unidades na planilha";
  els.preceptorUnit.appendChild(placeholder);

  state.unitNames.forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    els.preceptorUnit.appendChild(option);
  });

  els.preceptorUnit.value = state.unitNames.includes(normalizedSelected) ? normalizedSelected : "";
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `form-message ${type}`.trim();
}

async function apiGet(params) {
  assertConfigured();
  const url = new URL(CONFIG.APPS_SCRIPT_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
  });

  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Não foi possível concluir a consulta.");
  return data;
}

async function apiPost(payload) {
  assertConfigured();

  const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Não foi possível salvar.");
  return data;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayInputValue() {
  return dateKey(new Date());
}

function sameMonth(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setHours(0, 0, 0, 0);
  return date;
}

function splitValues(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function setSelectValue(select, value) {
  const normalizedValue = String(value || "");
  if (normalizedValue && ![...select.options].some((option) => option.value === normalizedValue)) {
    const option = document.createElement("option");
    option.value = normalizedValue;
    option.textContent = normalizedValue;
    select.appendChild(option);
  }
  select.value = normalizedValue;
}

function getRecordDateKey(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return dateKey(date);
}

function setActivityDate(value) {
  els.activityDate.value = value || todayInputValue();
}

function updateMultiSelectSummary(control) {
  const selected = [...control.panel.querySelectorAll("input[type='checkbox']:checked")]
    .map((checkbox) => checkbox.value);

  control.hidden.value = selected.join("; ");

  if (selected.length === 0) {
    control.summary.textContent = "Selecione uma ou mais EPAs";
  } else if (selected.length === 1) {
    control.summary.textContent = selected[0];
  } else {
    control.summary.textContent = `${selected.length} EPAs selecionadas`;
  }
}

function setMultiSelectValues(control, values) {
  const selected = new Set(values.map(String));
  control.panel.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = selected.has(checkbox.value);
  });
  updateMultiSelectSummary(control);
}

function fillMultiSelect(control, values) {
  control.panel.innerHTML = "";

  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .forEach((value, index) => {
      const optionId = `${control.prefix}-${index}`;
      const label = document.createElement("label");
      label.className = "multi-select-option";
      label.htmlFor = optionId;

      const checkbox = document.createElement("input");
      checkbox.id = optionId;
      checkbox.type = "checkbox";
      checkbox.value = value;

      const text = document.createElement("span");
      text.textContent = value;

      label.append(checkbox, text);
      control.panel.appendChild(label);
    });

  updateMultiSelectSummary(control);
}

function closeMultiSelect(control) {
  control.panel.classList.add("is-hidden");
  control.toggle.setAttribute("aria-expanded", "false");
}

function toggleMultiSelect(control) {
  const isOpen = !control.panel.classList.contains("is-hidden");
  closeMultiSelect(diaryEpaControl);
  control.panel.classList.toggle("is-hidden", isOpen);
  control.toggle.setAttribute("aria-expanded", String(!isOpen));
}

function fillSelect(element, values, placeholder) {
  element.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = placeholder;
  element.appendChild(emptyOption);

  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      element.appendChild(option);
    });
}

function fillEpaSelect() {
  fillSelect(els.epaProgressSelect, state.epaCatalog, "Selecione a EPA");
  fillSelect(els.epaCatalogFilter, state.epaCatalog, "Todas");
}

function getTasksForEpa(epa) {
  const selectedEpa = String(epa || "");
  return state.epaTasks
    .filter((item) => item.epa === selectedEpa)
    .map((item) => item.task)
    .filter(Boolean);
}

function fillEpaTaskSelect(selectedTask = "") {
  const tasks = getTasksForEpa(els.epaProgressSelect.value);
  fillSelect(els.epaTaskSelect, tasks, tasks.length ? "Selecione a subtarefa" : "Selecione primeiro uma EPA");
  setSelectValue(els.epaTaskSelect, selectedTask);
}

function showView(viewName) {
  state.activeView = viewName;
  els.diaryView.classList.toggle("is-hidden", viewName !== "diary");
  els.historyView.classList.toggle("is-hidden", viewName !== "history");
  els.epaView.classList.toggle("is-hidden", viewName !== "epa");
  els.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
}

function updateActivePreceptorLabel() {
  const parts = [state.preceptorName, state.preceptorEmail, state.preceptorUnit].filter(Boolean);
  els.activePreceptor.textContent = parts.join(" · ");
}

function setLoggedIn(preceptorName, preceptorEmail, preceptorUnit = "") {
  state.preceptorName = normalizeName(preceptorName);
  state.preceptorEmail = normalizeEmail(preceptorEmail);
  state.preceptorUnit = normalizeUnit(preceptorUnit);
  localStorage.setItem("preceptoria.preceptorName", state.preceptorName);
  localStorage.setItem("preceptoria.preceptorEmail", state.preceptorEmail);
  localStorage.setItem("preceptoria.preceptorUnit", state.preceptorUnit);
  state.residentNames = loadStoredResidentNames();
  renderResidentOptions();
  renderUnitOptions(state.preceptorUnit);
  updateActivePreceptorLabel();
  els.preceptorName.value = state.preceptorName;
  els.preceptorEmail.value = state.preceptorEmail;
  els.historyScope.value = state.historyScope;
  els.loginPanel.classList.add("is-hidden");
  els.recordPanel.classList.remove("is-hidden");
  els.historyPanel.classList.remove("is-hidden");
  els.epaAppPanel.classList.remove("is-hidden");
  els.viewTabs.classList.remove("is-hidden");
  showView(state.activeView || "diary");
}

function setLoggedOut() {
  state.preceptorName = "";
  state.preceptorEmail = "";
  state.preceptorUnit = "";
  state.history = [];
  state.epaProgress = [];
  state.residentDirectory = [];
  state.residentNames = [];
  renderResidentOptions();
  renderEpaResidentOptions();
  clearEditMode();
  clearEpaEditMode();
  localStorage.removeItem("preceptoria.preceptorName");
  localStorage.removeItem("preceptoria.preceptorEmail");
  localStorage.removeItem("preceptoria.preceptorUnit");
  els.viewTabs.classList.add("is-hidden");
  showView("diary");
  els.loginPanel.classList.remove("is-hidden");
  els.recordPanel.classList.add("is-hidden");
  els.historyPanel.classList.add("is-hidden");
  els.epaAppPanel.classList.add("is-hidden");
  els.preceptorUnit.value = "";
  els.preceptorName.focus();
}

function filteredHistory() {
  const term = state.filter.trim().toLowerCase();
  const filters = state.historyFilters;

  return state.history.filter((item) => {
    const matchesTerm = !term || [item.preceptorName, item.unit, item.residentYear, item.residentName, item.activity, item.description, item.epa]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(term));

    const recordDate = getRecordDateKey(item.timestamp);
    const matchesResident = !filters.resident || item.residentName === filters.resident;
    const matchesActivity = !filters.activity || item.activity === filters.activity;
    const matchesStart = !filters.dateStart || (recordDate && recordDate >= filters.dateStart);
    const matchesEnd = !filters.dateEnd || (recordDate && recordDate <= filters.dateEnd);

    return matchesTerm && matchesResident && matchesActivity && matchesStart && matchesEnd;
  });
}

function renderHistoryFilterOptions() {
  const currentResident = els.historyResidentFilter.value;
  const currentActivity = els.historyActivityFilter.value;
  const residents = state.history.map((item) => item.residentName).filter(Boolean);
  const activities = state.history.map((item) => item.activity).filter(Boolean);

  fillSelect(els.historyResidentFilter, residents, "Todos");
  fillSelect(els.historyActivityFilter, activities, "Todas");

  els.historyResidentFilter.value = residents.includes(currentResident) ? currentResident : "";
  els.historyActivityFilter.value = activities.includes(currentActivity) ? currentActivity : "";
  state.historyFilters.resident = els.historyResidentFilter.value;
  state.historyFilters.activity = els.historyActivityFilter.value;
}

function setResidentYear(value) {
  const selectedYear = String(value || "");
  els.residentYear.value = selectedYear;
  els.residentYearButtons.forEach((button) => {
    const isSelected = button.dataset.residentYear === selectedYear;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  renderResidentOptions();
}

function setEpaResidentYear(value) {
  const selectedYear = String(value || "");
  els.epaResidentYear.value = selectedYear;
  els.epaResidentYearButtons.forEach((button) => {
    const isSelected = button.dataset.epaResidentYear === selectedYear;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  renderEpaResidentOptions();
}

function setEpaProgressLevel(value) {
  const selectedLevel = String(value || "");
  els.epaProgressLevel.value = selectedLevel;
  els.epaLevelButtons.forEach((button) => {
    const isSelected = button.dataset.epaLevel === selectedLevel;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function clearEditMode() {
  state.editingId = "";
  els.recordId.value = "";
  setActivityDate();
  setResidentYear("");
  renderResidentOptions("");
  els.recordFormTitle.textContent = "Atividade realizada";
  els.submitRecord.textContent = "Registrar atividade";
  els.cancelEdit.classList.add("is-hidden");
}

function clearEpaEditMode() {
  state.epaEditingId = "";
  els.epaProgressForm.reset();
  els.epaProgressId.value = "";
  els.epaProgressDate.value = todayInputValue();
  setEpaResidentYear("");
  renderEpaResidentOptions("");
  fillEpaTaskSelect("");
  setEpaProgressLevel("");
  els.submitEpaProgress.textContent = "Registrar avaliação EPA";
  els.cancelEpaEdit.classList.add("is-hidden");
}

function startEdit(recordId) {
  const record = state.history.find((item) => item.id === recordId);
  if (!record) return;

  state.editingId = record.id;
  els.recordId.value = record.id;
  setActivityDate(getRecordDateKey(record.timestamp));
  setResidentYear(record.residentYear || "");
  renderResidentOptions(record.residentName || "");
  setSelectValue(els.activity, record.activity);
  els.description.value = record.description || "";
  setMultiSelectValues(diaryEpaControl, splitValues(record.epa));
  els.recordFormTitle.textContent = "Editar registro";
  els.submitRecord.textContent = "Salvar alterações";
  els.cancelEdit.classList.remove("is-hidden");
  setMessage(els.formMessage, "");
  showView("diary");
  els.recordPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startEpaEdit(progressId) {
  const item = state.epaProgress.find((record) => record.id === progressId);
  if (!item) return;

  state.epaEditingId = item.id;
  els.epaProgressId.value = item.id;
  els.epaProgressDate.value = getRecordDateKey(item.progressDate) || todayInputValue();
  setEpaResidentYear(item.residentYear || "");
  renderEpaResidentOptions(item.residentName || "");
  setSelectValue(els.epaProgressSelect, item.epa);
  fillEpaTaskSelect(item.epaTask || "");
  setEpaProgressLevel(item.progressLevel || "");
  els.epaProgressNotes.value = item.notes || "";
  els.epaProgressNextSteps.value = "";
  els.submitEpaProgress.textContent = "Salvar avaliação EPA";
  els.cancelEpaEdit.classList.remove("is-hidden");
  setMessage(els.epaFormMessage, "");
  showView("epa");
  els.epaAppPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStats() {
  const total = state.history.length;
  const monthTotal = state.history.filter((item) => sameMonth(item.timestamp)).length;
  const last = state.history[0]?.timestamp;

  els.historyTitle.textContent = state.historyScope === "unit" ? "Minha unidade" : "Meus registros";
  els.totalCount.textContent = total;
  els.monthCount.textContent = monthTotal;
  els.lastDate.textContent = last ? formatDateOnly(last) : "-";
}

function buildFeedbackText(item) {
  return [
    `Residente: ${item.residentName || "-"}`,
    `Ano: ${item.residentYear || "-"}`,
    `Data: ${formatDate(item.timestamp)}`,
    `Preceptor: ${item.preceptorName || "-"}`,
    `Unidade: ${item.unit || "-"}`,
    `Atividade: ${item.activity || "-"}`,
    `EPA(s): ${item.epa || "-"}`,
    "",
    "Registro descritivo:",
    item.description || "-",
  ].join("\n");
}

function getQuarterFeedbackRecords(residentName) {
  const resident = normalizeName(residentName);
  const startDate = monthsAgo(4);
  const endDate = new Date();

  return state.history
    .filter((item) => normalizeName(item.residentName) === resident)
    .filter((item) => {
      const date = new Date(item.timestamp);
      return !Number.isNaN(date.getTime()) && date >= startDate && date <= endDate;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function buildQuarterFeedbackText(residentName) {
  const records = getQuarterFeedbackRecords(residentName);
  const startDate = monthsAgo(4);
  const endDate = new Date();
  const residentYear = records.find((item) => item.residentYear)?.residentYear || "-";

  const lines = [
    "Síntese de registros do último quadrimestre",
    "",
    `Residente: ${residentName || "-"}`,
    `Ano: ${residentYear}`,
    `Período: ${formatDateOnly(startDate)} a ${formatDateOnly(endDate)}`,
    `Total de registros: ${records.length}`,
    "",
  ];

  if (!records.length) {
    lines.push("Não há registros para este residente no último quadrimestre.");
  } else {
    records.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${formatDateOnly(item.timestamp)}`,
        `Preceptor: ${item.preceptorName || "-"}`,
        `Unidade: ${item.unit || "-"}`,
        `Atividade: ${item.activity || "-"}`,
        `EPA(s): ${item.epa || "-"}`,
        "Registro:",
        item.description || "-",
        "",
      );
    });
  }

  lines.push(
    "Síntese para feedback:",
    "- Pontos fortes observados:",
    "- Pontos a desenvolver:",
    "- Combinados para o próximo período:",
  );

  return lines.join("\n");
}

function updateQuarterFeedbackButton() {
  const residentName = els.historyResidentFilter.value;
  const records = residentName ? getQuarterFeedbackRecords(residentName) : [];
  els.copyQuarterFeedback.disabled = !residentName || records.length === 0;
  els.copyQuarterFeedback.textContent = residentName && records.length
    ? `Copiar quadrimestre (${records.length})`
    : "Copiar feedback do quadrimestre";
}

async function copyQuarterFeedback() {
  const residentName = els.historyResidentFilter.value;
  if (!residentName) {
    setMessage(els.formMessage, "Selecione um residente no filtro do histórico.", "error");
    return;
  }

  const records = getQuarterFeedbackRecords(residentName);
  if (!records.length) {
    setMessage(els.formMessage, "Não há registros desse residente no último quadrimestre.", "error");
    return;
  }

  await copyTextToClipboard(buildQuarterFeedbackText(residentName));
  const originalText = els.copyQuarterFeedback.textContent;
  els.copyQuarterFeedback.textContent = "Quadrimestre copiado";
  els.copyQuarterFeedback.disabled = true;
  window.setTimeout(() => {
    updateQuarterFeedbackButton();
    if (!els.copyQuarterFeedback.disabled) els.copyQuarterFeedback.textContent = originalText;
  }, 1200);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copyRecordFeedback(recordId, button) {
  const record = state.history.find((item) => item.id === recordId);
  if (!record) return;

  await copyTextToClipboard(buildFeedbackText(record));
  const originalText = button.textContent;
  button.textContent = "Copiado";
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1200);
}

function renderHistoryCard(item) {
  const card = document.createElement("article");
  card.className = "history-card";

  const header = document.createElement("div");
  header.className = "history-card-header";

  const titleWrap = document.createElement("div");
  const date = document.createElement("span");
  date.className = "history-card-date";
  date.textContent = formatDate(item.timestamp);
  const title = document.createElement("h3");
  title.textContent = item.residentName || "Residente não informado";
  titleWrap.append(date, title);

  const year = document.createElement("span");
  year.className = "history-card-year";
  year.textContent = item.residentYear || "-";

  header.append(titleWrap, year);
  card.appendChild(header);

  const meta = document.createElement("div");
  meta.className = "history-card-meta";
  [
    ["Preceptor", item.preceptorName || "-"],
    ["Unidade", item.unit || "-"],
    ["Atividade", item.activity || "-"],
    ["EPA", item.epa || "-"],
  ].forEach(([label, value]) => {
    const line = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    line.append(strong, document.createTextNode(value));
    meta.appendChild(line);
  });
  card.appendChild(meta);

  const description = document.createElement("p");
  description.className = "history-card-description";
  description.textContent = item.description || "Sem registro descritivo.";
  card.appendChild(description);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  actions.append(createActionButton("Copiar feedback", "copy-feedback", item.id));
  if (item.preceptorEmail === state.preceptorEmail) {
    actions.append(
      createActionButton("Editar", "edit", item.id),
      createActionButton("Excluir", "delete", item.id, true),
    );
  }
  card.appendChild(actions);

  return card;
}

function renderHistory() {
  const rows = filteredHistory();
  els.historyCards.innerHTML = "";
  els.historyBody.innerHTML = "";
  const scopeLabel = state.historyScope === "unit" && state.preceptorUnit
    ? ` da unidade ${state.preceptorUnit}`
    : "";
  els.historyResultsCount.textContent = `Mostrando ${rows.length} de ${state.history.length} registros${scopeLabel}`;

  rows.forEach((item) => {
    els.historyCards.appendChild(renderHistoryCard(item));

    const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
    const cells = row.querySelectorAll("td");
    cells[0].textContent = formatDate(item.timestamp);
    cells[1].textContent = item.preceptorName || "-";
    cells[2].textContent = item.unit || "-";
    cells[3].textContent = item.residentYear || "-";
    cells[4].textContent = item.residentName || "-";
    cells[5].textContent = item.activity || "-";
    cells[6].textContent = item.description || "-";
    cells[7].textContent = item.epa || "-";

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(createActionButton("Copiar feedback", "copy-feedback", item.id));
    if (item.preceptorEmail === state.preceptorEmail) {
      actions.append(
        createActionButton("Editar", "edit", item.id),
        createActionButton("Excluir", "delete", item.id, true),
      );
    }
    cells[8].appendChild(actions);
    els.historyBody.appendChild(row);
  });

  els.historyPanel.classList.toggle("is-empty", rows.length === 0);
  renderStats();
  updateQuarterFeedbackButton();
}

function filteredEpaProgress(options = {}) {
  const includeSelectedResident = options.includeSelectedResident !== false;
  const term = state.epaFilter.trim().toLowerCase();
  const filters = state.epaFilters;

  return state.epaProgress.filter((item) => {
    const matchesTerm = !term || [item.preceptorName, item.unit, item.residentYear, item.residentName, item.epa, item.epaTask, item.progressLevel, item.notes]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(term));

    const matchesResident = !filters.resident || item.residentName === filters.resident;
    const matchesEpa = !filters.epa || item.epa === filters.epa;
    const matchesLevel = !filters.level || item.progressLevel === filters.level;
    const matchesSelectedResident = !includeSelectedResident || !state.epaSelectedResident || item.residentName === state.epaSelectedResident;

    return matchesTerm && matchesResident && matchesEpa && matchesLevel && matchesSelectedResident;
  });
}

function renderEpaFilterOptions() {
  const currentResident = els.epaResidentFilter.value;
  const currentEpa = els.epaCatalogFilter.value;
  const residents = state.epaProgress.map((item) => item.residentName).filter(Boolean);
  const epas = [...state.epaCatalog, ...state.epaProgress.map((item) => item.epa).filter(Boolean)];

  fillSelect(els.epaResidentFilter, residents, "Todos");
  fillSelect(els.epaCatalogFilter, epas, "Todas");

  els.epaResidentFilter.value = residents.includes(currentResident) ? currentResident : "";
  els.epaCatalogFilter.value = epas.includes(currentEpa) ? currentEpa : "";
  state.epaFilters.resident = els.epaResidentFilter.value;
  state.epaFilters.epa = els.epaCatalogFilter.value;
}

function renderEpaStats() {
  const residents = new Set(state.epaProgress.map((item) => item.residentName).filter(Boolean));
  const last = state.epaProgress[0]?.progressDate;

  els.epaTotalCount.textContent = state.epaProgress.length;
  els.epaResidentCount.textContent = residents.size;
  els.epaLastDate.textContent = last ? formatDateOnly(last) : "-";
}

function renderEpaSummary(rows) {
  els.epaSummaryList.innerHTML = "";
  const byResident = new Map();

  rows.forEach((item) => {
    const resident = item.residentName || "Residente não informado";
    if (!byResident.has(resident)) byResident.set(resident, []);
    byResident.get(resident).push(item);
  });

  [...byResident.entries()]
    .forEach(([resident, items]) => {
      const latest = items[0];
      const card = document.createElement("article");
      card.className = "epa-summary-card";
      card.classList.toggle("is-active", resident === state.epaSelectedResident);
      card.dataset.resident = resident;
      card.role = "button";
      card.tabIndex = 0;

      const title = document.createElement("strong");
      title.textContent = resident;

      const details = document.createElement("span");
      details.textContent = `${items.length} avaliação(ões). Último nível: ${latest.progressLevel || "-"} em ${formatDateOnly(latest.progressDate)}.`;

      const hint = document.createElement("span");
      hint.className = "epa-summary-hint";
      hint.textContent = resident === state.epaSelectedResident ? "Registros exibidos abaixo." : "Clique para ver os registros.";

      card.append(title, details, hint);
      els.epaSummaryList.appendChild(card);
    });
}

function buildEpaProgressText(item) {
  return [
    `Residente: ${item.residentName || "-"}`,
    `Ano: ${item.residentYear || "-"}`,
    `Data: ${formatDate(item.progressDate)}`,
    `Preceptor: ${item.preceptorName || "-"}`,
    `Unidade: ${item.unit || "-"}`,
    `EPA: ${item.epa || "-"}`,
    `Subtarefa: ${item.epaTask || "-"}`,
    `Nível de progressão: ${item.progressLevel || "-"}`,
    "",
    "Registro da avaliação:",
    item.notes || "-",
  ].join("\n");
}

async function copyEpaProgress(progressId, button) {
  const item = state.epaProgress.find((record) => record.id === progressId);
  if (!item) return;

  await copyTextToClipboard(buildEpaProgressText(item));
  const originalText = button.textContent;
  button.textContent = "Copiado";
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1200);
}

function renderEpaCard(item) {
  const card = document.createElement("article");
  card.className = "history-card";

  const header = document.createElement("div");
  header.className = "history-card-header";

  const titleWrap = document.createElement("div");
  const date = document.createElement("span");
  date.className = "history-card-date";
  date.textContent = formatDate(item.progressDate);
  const title = document.createElement("h3");
  title.textContent = item.residentName || "Residente não informado";
  titleWrap.append(date, title);

  const level = document.createElement("span");
  level.className = "history-card-year level";
  level.textContent = item.progressLevel || "-";

  header.append(titleWrap, level);
  card.appendChild(header);

  const meta = document.createElement("div");
  meta.className = "history-card-meta";
  [
    ["Ano", item.residentYear || "-"],
    ["Preceptor", item.preceptorName || "-"],
    ["Unidade", item.unit || "-"],
    ["EPA", item.epa || "-"],
    ["Subtarefa", item.epaTask || "-"],
  ].forEach(([label, value]) => {
    const line = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    line.append(strong, document.createTextNode(value));
    meta.appendChild(line);
  });
  card.appendChild(meta);

  const notes = document.createElement("p");
  notes.className = "history-card-description";
  notes.textContent = item.notes || "Sem registro da avaliação.";
  card.appendChild(notes);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  actions.append(createActionButton("Copiar", "copy-epa", item.id));
  if (item.preceptorEmail === state.preceptorEmail) {
    actions.append(
      createActionButton("Editar", "edit-epa", item.id),
      createActionButton("Excluir", "delete-epa", item.id, true),
    );
  }
  card.appendChild(actions);

  return card;
}

function renderEpaProgress() {
  const summaryRows = filteredEpaProgress({ includeSelectedResident: false });
  if (state.epaSelectedResident && !summaryRows.some((item) => item.residentName === state.epaSelectedResident)) {
    state.epaSelectedResident = "";
  }

  const rows = state.epaSelectedResident ? filteredEpaProgress() : [];
  els.epaCards.innerHTML = "";
  els.epaResultsCount.textContent = state.epaSelectedResident
    ? `Mostrando ${rows.length} avaliação(ões) de ${state.epaSelectedResident}`
    : "Selecione um card de residente para ver os registros.";

  rows.forEach((item) => {
    els.epaCards.appendChild(renderEpaCard(item));
  });

  renderEpaSummary(summaryRows);
  els.epaAppPanel.classList.toggle("is-empty", Boolean(state.epaSelectedResident) && rows.length === 0);
  renderEpaStats();
}

function createActionButton(label, action, id, danger = false) {
  const button = document.createElement("button");
  button.className = danger ? "text-button danger" : "text-button";
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = label;
  return button;
}

async function loadOptions() {
  fillSelect(els.activity, DEFAULT_ACTIVITY_OPTIONS, "Selecione a atividade");
  fillMultiSelect(diaryEpaControl, DEFAULT_EPA_OPTIONS);
  state.epaCatalog = [...DEFAULT_EPA_OPTIONS];
  state.epaTasks = [];
  fillEpaSelect();
  fillEpaTaskSelect();
  state.unitNames = [...DEFAULT_UNIT_OPTIONS];
  renderUnitOptions();
  renderResidentOptions();
  renderEpaResidentOptions();

  try {
    const optionParams = {
      action: "options",
      preceptorUnit: state.preceptorUnit,
    };
    const data = await apiGet(optionParams);
    const activities = data.activities?.length ? data.activities : DEFAULT_ACTIVITY_OPTIONS;
    const epas = [...DEFAULT_EPA_OPTIONS, ...(data.epas || [])];
    state.epaCatalog = data.epaCatalog?.length ? data.epaCatalog : epas;
    state.epaTasks = Array.isArray(data.epaTasks)
      ? data.epaTasks
        .map((item) => ({ epa: String(item.epa || ""), task: String(item.task || item.epaTask || "") }))
        .filter((item) => item.epa && item.task)
      : [];
    fillSelect(els.activity, activities, "Selecione a atividade");
    fillMultiSelect(diaryEpaControl, epas);
    fillEpaSelect();
    fillEpaTaskSelect();
    state.residentDirectory = Array.isArray(data.residents)
      ? data.residents.map(normalizeResidentItem).filter((item) => item.name)
      : [];
    state.activityEpaMap = new Map((data.activityEpaLinks || []).map((item) => [item.activity, item.epa]));
    state.unitNames = [...new Set([...DEFAULT_UNIT_OPTIONS, ...(data.units || [])].map(normalizeUnit).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    renderUnitOptions();
    renderResidentOptions();
    renderEpaResidentOptions();
  } catch (error) {
    console.warn(error);
  }
}

async function loadHistory() {
  if (!state.preceptorEmail) return;
  els.refreshHistory.disabled = true;

  try {
    const data = await apiGet({
      action: "history",
      preceptorName: state.preceptorName,
      preceptorEmail: state.preceptorEmail,
      preceptorUnit: state.preceptorUnit,
      scope: state.historyScope,
    });
    if (data.unit) {
      state.preceptorUnit = normalizeUnit(data.unit);
      localStorage.setItem("preceptoria.preceptorUnit", state.preceptorUnit);
      if (!state.unitNames.includes(state.preceptorUnit)) {
        state.unitNames.push(state.preceptorUnit);
        state.unitNames.sort((a, b) => a.localeCompare(b, "pt-BR"));
      }
      renderUnitOptions(state.preceptorUnit);
      updateActivePreceptorLabel();
      renderResidentOptions();
    }
    if (data.scope && data.scope !== state.historyScope) {
      state.historyScope = data.scope;
      els.historyScope.value = state.historyScope;
      localStorage.setItem("preceptoria.historyScope", state.historyScope);
    }
    state.history = Array.isArray(data.records) ? data.records : [];
    rememberResidentNames(state.history.map((item) => item.residentName));
    renderHistoryFilterOptions();
    renderHistory();
  } catch (error) {
    setMessage(els.formMessage, error.message, "error");
  } finally {
    els.refreshHistory.disabled = false;
  }
}

async function loadEpaProgress() {
  if (!state.preceptorEmail) return;
  els.refreshEpa.disabled = true;

  try {
    const data = await apiGet({
      action: "epaprogress",
      preceptorName: state.preceptorName,
      preceptorEmail: state.preceptorEmail,
      preceptorUnit: state.preceptorUnit,
    });
    if (data.unit) {
      state.preceptorUnit = normalizeUnit(data.unit);
      localStorage.setItem("preceptoria.preceptorUnit", state.preceptorUnit);
      renderUnitOptions(state.preceptorUnit);
      updateActivePreceptorLabel();
      renderResidentOptions();
      renderEpaResidentOptions();
    }
    state.epaProgress = Array.isArray(data.records) ? data.records : [];
    renderEpaFilterOptions();
    renderEpaProgress();
  } catch (error) {
    setMessage(els.epaFormMessage, error.message, "error");
  } finally {
    els.refreshEpa.disabled = false;
  }
}

async function saveRecord(formData) {
  els.submitRecord.disabled = true;
  const isEditing = Boolean(formData.get("recordId"));
  setMessage(els.formMessage, isEditing ? "Salvando alterações..." : "Salvando registro...");

  try {
    await apiPost({
      action: isEditing ? "update" : "create",
      recordId: formData.get("recordId"),
      preceptorName: state.preceptorName,
      preceptorEmail: state.preceptorEmail,
      preceptorUnit: state.preceptorUnit,
      activityDate: formData.get("activityDate"),
      residentYear: formData.get("residentYear"),
      residentName: formData.get("residentName"),
      activity: formData.get("activity"),
      description: formData.get("description"),
      epa: formData.get("epa"),
    });

    rememberResidentNames([formData.get("residentName")]);
    els.recordForm.reset();
    setActivityDate();
    setResidentYear("");
    renderResidentOptions("");
    setMultiSelectValues(diaryEpaControl, []);
    clearEditMode();
    setMessage(els.formMessage, isEditing ? "Registro atualizado com sucesso." : "Registro salvo com sucesso.", "success");
    await loadHistory();
  } catch (error) {
    setMessage(els.formMessage, error.message, "error");
  } finally {
    els.submitRecord.disabled = false;
  }
}

async function deleteRecord(recordId) {
  if (!recordId) return;
  const confirmed = window.confirm("Excluir este registro do histórico?");
  if (!confirmed) return;

  setMessage(els.formMessage, "Excluindo registro...");

  try {
    await apiPost({
      action: "delete",
      recordId,
      preceptorEmail: state.preceptorEmail,
    });

    if (state.editingId === recordId) {
      els.recordForm.reset();
      setActivityDate();
      setResidentYear("");
      renderResidentOptions("");
      clearEditMode();
    }

    setMessage(els.formMessage, "Registro excluído com sucesso.", "success");
    await loadHistory();
  } catch (error) {
    setMessage(els.formMessage, error.message, "error");
  }
}

async function saveEpaProgress(formData) {
  els.submitEpaProgress.disabled = true;
  const isEditing = Boolean(formData.get("progressId"));
  setMessage(els.epaFormMessage, isEditing ? "Salvando avaliação..." : "Registrando avaliação...");

  try {
    await apiPost({
      action: isEditing ? "updateepaprogress" : "createepaprogress",
      progressId: formData.get("progressId"),
      preceptorName: state.preceptorName,
      preceptorEmail: state.preceptorEmail,
      preceptorUnit: state.preceptorUnit,
      progressDate: formData.get("progressDate"),
      residentYear: formData.get("residentYear"),
      residentName: formData.get("residentName"),
      epa: formData.get("epa"),
      epaTask: formData.get("epaTask"),
      progressLevel: formData.get("progressLevel"),
      notes: formData.get("notes"),
      nextSteps: "",
    });

    rememberResidentNames([formData.get("residentName")]);
    clearEpaEditMode();
    setMessage(els.epaFormMessage, isEditing ? "Avaliação EPA atualizada com sucesso." : "Avaliação EPA registrada com sucesso.", "success");
    await loadEpaProgress();
  } catch (error) {
    setMessage(els.epaFormMessage, error.message, "error");
  } finally {
    els.submitEpaProgress.disabled = false;
  }
}

async function deleteEpaProgress(progressId) {
  if (!progressId) return;
  const confirmed = window.confirm("Excluir esta avaliação EPA?");
  if (!confirmed) return;

  setMessage(els.epaFormMessage, "Excluindo avaliação...");

  try {
    await apiPost({
      action: "deleteepaprogress",
      progressId,
      preceptorEmail: state.preceptorEmail,
    });

    if (state.epaEditingId === progressId) clearEpaEditMode();

    setMessage(els.epaFormMessage, "Avaliação EPA excluída com sucesso.", "success");
    await loadEpaProgress();
  } catch (error) {
    setMessage(els.epaFormMessage, error.message, "error");
  }
}

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const preceptorName = normalizeName(new FormData(els.loginForm).get("preceptorName"));
  const preceptorEmail = normalizeEmail(new FormData(els.loginForm).get("preceptorEmail"));
  const preceptorUnit = normalizeUnit(new FormData(els.loginForm).get("preceptorUnit"));
  if (!preceptorName || !preceptorEmail) return;
  setLoggedIn(preceptorName, preceptorEmail, preceptorUnit);
  setMessage(els.formMessage, "");
  await loadOptions();
  await Promise.all([loadHistory(), loadEpaProgress()]);
});

els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

els.recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncResidentNameFromControls();
  saveRecord(new FormData(els.recordForm));
});

els.epaProgressForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncEpaResidentNameFromControls();
  saveEpaProgress(new FormData(els.epaProgressForm));
});

els.residentSelect.addEventListener("change", () => {
  syncResidentNameFromControls();
  if (els.residentSelect.value === "__other__") els.residentOtherName.focus();
});

els.residentOtherName.addEventListener("input", syncResidentNameFromControls);

els.epaResidentSelect.addEventListener("change", () => {
  syncEpaResidentNameFromControls();
  if (els.epaResidentSelect.value === "__other__") els.epaResidentOtherName.focus();
});

els.epaResidentOtherName.addEventListener("input", syncEpaResidentNameFromControls);

els.residentYearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextValue = els.residentYear.value === button.dataset.residentYear ? "" : button.dataset.residentYear;
    setResidentYear(nextValue);
  });
});

els.epaResidentYearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextValue = els.epaResidentYear.value === button.dataset.epaResidentYear ? "" : button.dataset.epaResidentYear;
    setEpaResidentYear(nextValue);
  });
});

els.epaLevelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextValue = els.epaProgressLevel.value === button.dataset.epaLevel ? "" : button.dataset.epaLevel;
    setEpaProgressLevel(nextValue);
  });
});

els.changePreceptor.addEventListener("click", setLoggedOut);
els.refreshHistory.addEventListener("click", loadHistory);
els.refreshEpa.addEventListener("click", loadEpaProgress);
els.copyQuarterFeedback.addEventListener("click", copyQuarterFeedback);

els.cancelEdit.addEventListener("click", () => {
  els.recordForm.reset();
  setActivityDate();
  setResidentYear("");
  renderResidentOptions("");
  setMultiSelectValues(diaryEpaControl, []);
  clearEditMode();
  setMessage(els.formMessage, "");
});

els.cancelEpaEdit.addEventListener("click", () => {
  clearEpaEditMode();
  setMessage(els.epaFormMessage, "");
});

function handleHistoryAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") startEdit(button.dataset.id);
  if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
  if (button.dataset.action === "copy-feedback") copyRecordFeedback(button.dataset.id, button);
}

els.historyBody.addEventListener("click", handleHistoryAction);
els.historyCards.addEventListener("click", handleHistoryAction);

function handleEpaAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit-epa") startEpaEdit(button.dataset.id);
  if (button.dataset.action === "delete-epa") deleteEpaProgress(button.dataset.id);
  if (button.dataset.action === "copy-epa") copyEpaProgress(button.dataset.id, button);
}

function selectEpaSummaryResident(resident) {
  state.epaSelectedResident = state.epaSelectedResident === resident ? "" : resident;
  renderEpaProgress();
}

function handleEpaSummarySelection(event) {
  const card = event.target.closest(".epa-summary-card[data-resident]");
  if (!card) return;
  selectEpaSummaryResident(card.dataset.resident);
}

function handleEpaSummaryKeyboard(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".epa-summary-card[data-resident]");
  if (!card) return;
  event.preventDefault();
  selectEpaSummaryResident(card.dataset.resident);
}

els.epaCards.addEventListener("click", handleEpaAction);
els.epaSummaryList.addEventListener("click", handleEpaSummarySelection);
els.epaSummaryList.addEventListener("keydown", handleEpaSummaryKeyboard);

els.activity.addEventListener("change", () => {
  const linkedEpa = state.activityEpaMap.get(els.activity.value);
  if (linkedEpa) setMultiSelectValues(diaryEpaControl, splitValues(linkedEpa));
});

els.epaProgressSelect.addEventListener("change", () => fillEpaTaskSelect());

els.epaToggle.addEventListener("click", () => toggleMultiSelect(diaryEpaControl));
els.epaOptionsPanel.addEventListener("change", () => updateMultiSelectSummary(diaryEpaControl));

document.addEventListener("click", (event) => {
  if (!event.target.closest(diaryEpaControl.containerSelector)) closeMultiSelect(diaryEpaControl);
});

els.historyFilter.addEventListener("input", (event) => {
  state.filter = event.target.value;
  renderHistory();
});

els.historyResidentFilter.addEventListener("change", (event) => {
  state.historyFilters.resident = event.target.value;
  renderHistory();
});

els.historyActivityFilter.addEventListener("change", (event) => {
  state.historyFilters.activity = event.target.value;
  renderHistory();
});

els.historyScope.addEventListener("change", async (event) => {
  state.historyScope = event.target.value;
  localStorage.setItem("preceptoria.historyScope", state.historyScope);
  await loadHistory();
});

els.historyDateStart.addEventListener("change", (event) => {
  state.historyFilters.dateStart = event.target.value;
  renderHistory();
});

els.historyDateEnd.addEventListener("change", (event) => {
  state.historyFilters.dateEnd = event.target.value;
  renderHistory();
});

els.clearHistoryFilters.addEventListener("click", () => {
  state.filter = "";
  state.historyFilters = {
    resident: "",
    activity: "",
    dateStart: "",
    dateEnd: "",
  };
  els.historyFilter.value = "";
  els.historyResidentFilter.value = "";
  els.historyActivityFilter.value = "";
  els.historyDateStart.value = "";
  els.historyDateEnd.value = "";
  renderHistory();
});

els.epaFilterInput.addEventListener("input", (event) => {
  state.epaFilter = event.target.value;
  state.epaSelectedResident = "";
  renderEpaProgress();
});

els.epaResidentFilter.addEventListener("change", (event) => {
  state.epaFilters.resident = event.target.value;
  state.epaSelectedResident = "";
  renderEpaProgress();
});

els.epaCatalogFilter.addEventListener("change", (event) => {
  state.epaFilters.epa = event.target.value;
  state.epaSelectedResident = "";
  renderEpaProgress();
});

els.epaLevelFilter.addEventListener("change", (event) => {
  state.epaFilters.level = event.target.value;
  state.epaSelectedResident = "";
  renderEpaProgress();
});

els.clearEpaFilters.addEventListener("click", () => {
  state.epaFilter = "";
  state.epaFilters = {
    resident: "",
    epa: "",
    level: "",
  };
  state.epaSelectedResident = "";
  els.epaFilterInput.value = "";
  els.epaResidentFilter.value = "";
  els.epaCatalogFilter.value = "";
  els.epaLevelFilter.value = "";
  renderEpaProgress();
});

async function initializeApp() {
  localStorage.removeItem("preceptoria.unitNames");
  await loadOptions();
  setActivityDate();
  els.epaProgressDate.value = todayInputValue();

  if (state.preceptorUnit && !state.unitNames.includes(state.preceptorUnit)) {
    state.preceptorUnit = "";
    localStorage.removeItem("preceptoria.preceptorUnit");
  }

  if (state.preceptorName && state.preceptorEmail && state.preceptorUnit) {
    setLoggedIn(state.preceptorName, state.preceptorEmail, state.preceptorUnit);
    await Promise.all([loadHistory(), loadEpaProgress()]);
  } else {
    els.preceptorName.value = state.preceptorName;
    els.preceptorEmail.value = state.preceptorEmail;
    renderUnitOptions();
    showView("diary");
  }
}

initializeApp();
