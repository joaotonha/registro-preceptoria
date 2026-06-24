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

const state = {
  preceptorName: localStorage.getItem("preceptoria.preceptorName") || "",
  preceptorEmail: localStorage.getItem("preceptoria.preceptorEmail") || "",
  preceptorUnit: localStorage.getItem("preceptoria.preceptorUnit") || "",
  history: [],
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
  activityEpaMap: new Map(),
  activeView: "diary",
};

const els = {
  viewTabs: document.querySelector("#view-tabs"),
  diaryView: document.querySelector("#diary-view"),
  historyView: document.querySelector("#history-view"),
  tabButtons: document.querySelectorAll(".tab-button"),
  loginPanel: document.querySelector("#login-panel"),
  recordPanel: document.querySelector("#record-panel"),
  historyPanel: document.querySelector("#history-panel"),
  loginForm: document.querySelector("#login-form"),
  recordForm: document.querySelector("#record-form"),
  recordFormTitle: document.querySelector("#record-form-title"),
  recordId: document.querySelector("#record-id"),
  activityDate: document.querySelector("#activity-date"),
  residentYear: document.querySelector("#resident-year"),
  residentYearButtons: document.querySelectorAll("[data-resident-year]"),
  residentSelect: document.querySelector("#resident-select"),
  residentName: document.querySelector("#resident-name"),
  residentOtherName: document.querySelector("#resident-other-name"),
  residentListHint: document.querySelector("#resident-list-hint"),
  description: document.querySelector("#description"),
  preceptorName: document.querySelector("#preceptor-name"),
  preceptorEmail: document.querySelector("#preceptor-email"),
  preceptorUnit: document.querySelector("#preceptor-unit"),
  activePreceptor: document.querySelector("#active-preceptor"),
  changePreceptor: document.querySelector("#change-preceptor"),
  refreshHistory: document.querySelector("#refresh-history"),
  submitRecord: document.querySelector("#submit-record"),
  cancelEdit: document.querySelector("#cancel-edit"),
  formMessage: document.querySelector("#form-message"),
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
  historyResultsCount: document.querySelector("#history-results-count"),
  totalCount: document.querySelector("#total-count"),
  monthCount: document.querySelector("#month-count"),
  lastDate: document.querySelector("#last-date"),
  activity: document.querySelector("#activity"),
  epa: document.querySelector("#epa"),
  epaToggle: document.querySelector("#epa-toggle"),
  epaPanel: document.querySelector("#epa-options-panel"),
  epaSelectedSummary: document.querySelector("#epa-selected-summary"),
  rowTemplate: document.querySelector("#history-row-template"),
};

const diaryEpaControl = {
  hidden: els.epa,
  toggle: els.epaToggle,
  panel: els.epaPanel,
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

function getVisibleResidentItems() {
  const selectedYear = els.residentYear.value;
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

function syncResidentNameFromControls() {
  if (!els.residentSelect) return;

  if (els.residentSelect.value === "__other__") {
    els.residentOtherName.classList.remove("is-hidden");
    els.residentName.value = normalizeName(els.residentOtherName.value);
    return;
  }

  els.residentOtherName.classList.add("is-hidden");
  els.residentOtherName.value = "";
  els.residentName.value = normalizeName(els.residentSelect.value);
}

function renderResidentOptions(selectedValue = els.residentName.value) {
  if (!els.residentSelect) return;

  const selectedName = normalizeName(selectedValue);
  const residents = getVisibleResidentItems();
  const selectedYear = els.residentYear.value;
  els.residentSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = residents.length ? "Selecione o residente" : "Nenhum residente encontrado";
  els.residentSelect.appendChild(placeholder);

  residents.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.year ? `${item.name} (${item.year})` : item.name;
    els.residentSelect.appendChild(option);
  });

  const otherOption = document.createElement("option");
  otherOption.value = "__other__";
  otherOption.textContent = "Outro / não listado";
  els.residentSelect.appendChild(otherOption);

  const hasSelectedName = selectedName && residents.some((item) => item.name === selectedName);
  if (hasSelectedName) {
    els.residentSelect.value = selectedName;
    els.residentOtherName.value = "";
  } else if (selectedName) {
    els.residentSelect.value = "__other__";
    els.residentOtherName.value = selectedName;
  } else {
    els.residentSelect.value = "";
    els.residentOtherName.value = "";
  }

  syncResidentNameFromControls();

  const unitText = state.preceptorUnit ? `da unidade ${state.preceptorUnit}` : "da sua unidade";
  const yearText = selectedYear ? ` ${selectedYear}` : "";
  if (residents.length) {
    els.residentListHint.textContent = `${residents.length} residentes${yearText} disponíveis ${unitText}.`;
  } else {
    els.residentListHint.textContent = `Nenhum residente${yearText} encontrado ${unitText}. Use "Outro / não listado" se precisar.`;
  }
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

function showView(viewName) {
  state.activeView = viewName;
  els.diaryView.classList.toggle("is-hidden", viewName !== "diary");
  els.historyView.classList.toggle("is-hidden", viewName !== "history");
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
  els.viewTabs.classList.remove("is-hidden");
  showView(state.activeView || "diary");
}

function setLoggedOut() {
  state.preceptorName = "";
  state.preceptorEmail = "";
  state.preceptorUnit = "";
  state.history = [];
  state.residentDirectory = [];
  state.residentNames = [];
  renderResidentOptions();
  clearEditMode();
  localStorage.removeItem("preceptoria.preceptorName");
  localStorage.removeItem("preceptoria.preceptorEmail");
  localStorage.removeItem("preceptoria.preceptorUnit");
  els.viewTabs.classList.add("is-hidden");
  showView("diary");
  els.loginPanel.classList.remove("is-hidden");
  els.recordPanel.classList.add("is-hidden");
  els.historyPanel.classList.add("is-hidden");
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
  state.unitNames = [...DEFAULT_UNIT_OPTIONS];
  renderUnitOptions();
  renderResidentOptions();

  try {
    const optionParams = {
      action: "options",
      preceptorUnit: state.preceptorUnit,
    };
    const data = await apiGet(optionParams);
    const activities = data.activities?.length ? data.activities : DEFAULT_ACTIVITY_OPTIONS;
    const epas = [...DEFAULT_EPA_OPTIONS, ...(data.epas || [])];
    fillSelect(els.activity, activities, "Selecione a atividade");
    fillMultiSelect(diaryEpaControl, epas);
    state.residentDirectory = Array.isArray(data.residents)
      ? data.residents.map(normalizeResidentItem).filter((item) => item.name)
      : [];
    state.activityEpaMap = new Map((data.activityEpaLinks || []).map((item) => [item.activity, item.epa]));
    state.unitNames = [...new Set([...DEFAULT_UNIT_OPTIONS, ...(data.units || [])].map(normalizeUnit).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    renderUnitOptions();
    renderResidentOptions();
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

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const preceptorName = normalizeName(new FormData(els.loginForm).get("preceptorName"));
  const preceptorEmail = normalizeEmail(new FormData(els.loginForm).get("preceptorEmail"));
  const preceptorUnit = normalizeUnit(new FormData(els.loginForm).get("preceptorUnit"));
  if (!preceptorName || !preceptorEmail) return;
  setLoggedIn(preceptorName, preceptorEmail, preceptorUnit);
  setMessage(els.formMessage, "");
  await Promise.all([loadOptions(), loadHistory()]);
});

els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

els.recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncResidentNameFromControls();
  saveRecord(new FormData(els.recordForm));
});

els.residentSelect.addEventListener("change", () => {
  syncResidentNameFromControls();
  if (els.residentSelect.value === "__other__") els.residentOtherName.focus();
});

els.residentOtherName.addEventListener("input", syncResidentNameFromControls);

els.residentYearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextValue = els.residentYear.value === button.dataset.residentYear ? "" : button.dataset.residentYear;
    setResidentYear(nextValue);
  });
});

els.changePreceptor.addEventListener("click", setLoggedOut);
els.refreshHistory.addEventListener("click", loadHistory);

els.cancelEdit.addEventListener("click", () => {
  els.recordForm.reset();
  setActivityDate();
  setResidentYear("");
  renderResidentOptions("");
  setMultiSelectValues(diaryEpaControl, []);
  clearEditMode();
  setMessage(els.formMessage, "");
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

els.activity.addEventListener("change", () => {
  const linkedEpa = state.activityEpaMap.get(els.activity.value);
  if (linkedEpa) setMultiSelectValues(diaryEpaControl, splitValues(linkedEpa));
});

els.epaToggle.addEventListener("click", () => toggleMultiSelect(diaryEpaControl));
els.epaPanel.addEventListener("change", () => updateMultiSelectSummary(diaryEpaControl));

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

async function initializeApp() {
  localStorage.removeItem("preceptoria.unitNames");
  await loadOptions();
  setActivityDate();

  if (state.preceptorUnit && !state.unitNames.includes(state.preceptorUnit)) {
    state.preceptorUnit = "";
    localStorage.removeItem("preceptoria.preceptorUnit");
  }

  if (state.preceptorName && state.preceptorEmail && state.preceptorUnit) {
    setLoggedIn(state.preceptorName, state.preceptorEmail, state.preceptorUnit);
    await loadHistory();
  } else {
    els.preceptorName.value = state.preceptorName;
    els.preceptorEmail.value = state.preceptorEmail;
    renderUnitOptions();
    showView("diary");
  }
}

initializeApp();
