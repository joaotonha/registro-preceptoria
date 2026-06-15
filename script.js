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

const state = {
  preceptorName: localStorage.getItem("preceptoria.preceptorName") || "",
  preceptorEmail: localStorage.getItem("preceptoria.preceptorEmail") || "",
  history: [],
  schedules: [],
  editingId: "",
  editingScheduleId: "",
  filter: "",
  scheduleFilter: "",
  activityEpaMap: new Map(),
  calendarDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  activeView: "diary",
};

const els = {
  viewTabs: document.querySelector("#view-tabs"),
  diaryView: document.querySelector("#diary-view"),
  scheduleView: document.querySelector("#schedule-view"),
  tabButtons: document.querySelectorAll(".tab-button"),
  loginPanel: document.querySelector("#login-panel"),
  recordPanel: document.querySelector("#record-panel"),
  historyPanel: document.querySelector("#history-panel"),
  loginForm: document.querySelector("#login-form"),
  recordForm: document.querySelector("#record-form"),
  recordFormTitle: document.querySelector("#record-form-title"),
  recordId: document.querySelector("#record-id"),
  residentYear: document.querySelector("#resident-year"),
  residentName: document.querySelector("#resident-name"),
  description: document.querySelector("#description"),
  preceptorName: document.querySelector("#preceptor-name"),
  preceptorEmail: document.querySelector("#preceptor-email"),
  activePreceptor: document.querySelector("#active-preceptor"),
  changePreceptor: document.querySelector("#change-preceptor"),
  refreshHistory: document.querySelector("#refresh-history"),
  submitRecord: document.querySelector("#submit-record"),
  cancelEdit: document.querySelector("#cancel-edit"),
  formMessage: document.querySelector("#form-message"),
  historyBody: document.querySelector("#history-body"),
  historyFilter: document.querySelector("#history-filter"),
  totalCount: document.querySelector("#total-count"),
  monthCount: document.querySelector("#month-count"),
  lastDate: document.querySelector("#last-date"),
  activity: document.querySelector("#activity"),
  epa: document.querySelector("#epa"),
  epaToggle: document.querySelector("#epa-toggle"),
  epaPanel: document.querySelector("#epa-options-panel"),
  epaSelectedSummary: document.querySelector("#epa-selected-summary"),
  rowTemplate: document.querySelector("#history-row-template"),
  scheduleForm: document.querySelector("#schedule-form"),
  scheduleFormTitle: document.querySelector("#schedule-form-title"),
  scheduleId: document.querySelector("#schedule-id"),
  scheduleDate: document.querySelector("#schedule-date"),
  scheduleTime: document.querySelector("#schedule-time"),
  scheduleResidentYear: document.querySelector("#schedule-resident-year"),
  scheduleResidentName: document.querySelector("#schedule-resident-name"),
  scheduleActivity: document.querySelector("#schedule-activity"),
  scheduleNotes: document.querySelector("#schedule-notes"),
  scheduleEpa: document.querySelector("#schedule-epa"),
  scheduleEpaToggle: document.querySelector("#schedule-epa-toggle"),
  scheduleEpaPanel: document.querySelector("#schedule-epa-options-panel"),
  scheduleEpaSelectedSummary: document.querySelector("#schedule-epa-selected-summary"),
  submitSchedule: document.querySelector("#submit-schedule"),
  cancelScheduleEdit: document.querySelector("#cancel-schedule-edit"),
  scheduleMessage: document.querySelector("#schedule-message"),
  refreshSchedule: document.querySelector("#refresh-schedule"),
  scheduleCount: document.querySelector("#schedule-count"),
  scheduleWeekCount: document.querySelector("#schedule-week-count"),
  scheduleNextDate: document.querySelector("#schedule-next-date"),
  scheduleFilter: document.querySelector("#schedule-filter"),
  scheduleCalendar: document.querySelector("#schedule-calendar"),
  scheduleList: document.querySelector("#schedule-list"),
  scheduleEmptyState: document.querySelector("#schedule-empty-state"),
  calendarPrev: document.querySelector("#calendar-prev"),
  calendarNext: document.querySelector("#calendar-next"),
  calendarLabel: document.querySelector("#calendar-label"),
};

const diaryEpaControl = {
  hidden: els.epa,
  toggle: els.epaToggle,
  panel: els.epaPanel,
  summary: els.epaSelectedSummary,
  containerSelector: "#epa-multi-select",
  prefix: "epa-option",
};

const scheduleEpaControl = {
  hidden: els.scheduleEpa,
  toggle: els.scheduleEpaToggle,
  panel: els.scheduleEpaPanel,
  summary: els.scheduleEpaSelectedSummary,
  containerSelector: "#schedule-epa-multi-select",
  prefix: "schedule-epa-option",
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

function formatScheduleDate(dateValue, timeValue = "") {
  if (!dateValue) return "-";
  const [year, month, day] = String(dateValue).split("-").map(Number);
  if (!year || !month || !day) return dateValue;
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
  return timeValue ? `${formatted} ${timeValue}` : formatted;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseScheduleDate(item) {
  if (!item.plannedDate) return null;
  const [year, month, day] = String(item.plannedDate).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
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
  closeMultiSelect(scheduleEpaControl);
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
  els.scheduleView.classList.toggle("is-hidden", viewName !== "schedule");
  els.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
}

function setLoggedIn(preceptorName, preceptorEmail) {
  state.preceptorName = normalizeName(preceptorName);
  state.preceptorEmail = normalizeEmail(preceptorEmail);
  localStorage.setItem("preceptoria.preceptorName", state.preceptorName);
  localStorage.setItem("preceptoria.preceptorEmail", state.preceptorEmail);
  els.activePreceptor.textContent = `${state.preceptorName} · ${state.preceptorEmail}`;
  els.preceptorName.value = state.preceptorName;
  els.preceptorEmail.value = state.preceptorEmail;
  els.loginPanel.classList.add("is-hidden");
  els.recordPanel.classList.remove("is-hidden");
  els.historyPanel.classList.remove("is-hidden");
  els.viewTabs.classList.remove("is-hidden");
  showView(state.activeView || "diary");
}

function setLoggedOut() {
  state.preceptorName = "";
  state.preceptorEmail = "";
  state.history = [];
  state.schedules = [];
  clearEditMode();
  clearScheduleEditMode();
  localStorage.removeItem("preceptoria.preceptorName");
  localStorage.removeItem("preceptoria.preceptorEmail");
  els.viewTabs.classList.add("is-hidden");
  showView("diary");
  els.loginPanel.classList.remove("is-hidden");
  els.recordPanel.classList.add("is-hidden");
  els.historyPanel.classList.add("is-hidden");
  els.preceptorName.focus();
}

function filteredHistory() {
  const term = state.filter.trim().toLowerCase();
  if (!term) return state.history;

  return state.history.filter((item) => {
    return [item.residentYear, item.residentName, item.activity, item.description, item.epa]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(term));
  });
}

function clearEditMode() {
  state.editingId = "";
  els.recordId.value = "";
  els.recordFormTitle.textContent = "Atividade realizada";
  els.submitRecord.textContent = "Registrar atividade";
  els.cancelEdit.classList.add("is-hidden");
}

function startEdit(recordId) {
  const record = state.history.find((item) => item.id === recordId);
  if (!record) return;

  state.editingId = record.id;
  els.recordId.value = record.id;
  els.residentYear.value = record.residentYear || "";
  els.residentName.value = record.residentName || "";
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

  els.totalCount.textContent = total;
  els.monthCount.textContent = monthTotal;
  els.lastDate.textContent = last ? formatDate(last).split(" ")[0] : "-";
}

function renderHistory() {
  const rows = filteredHistory();
  els.historyBody.innerHTML = "";

  rows.forEach((item) => {
    const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
    const cells = row.querySelectorAll("td");
    cells[0].textContent = formatDate(item.timestamp);
    cells[1].textContent = item.residentYear || "-";
    cells[2].textContent = item.residentName || "-";
    cells[3].textContent = item.activity || "-";
    cells[4].textContent = item.description || "-";
    cells[5].textContent = item.epa || "-";

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(
      createActionButton("Editar", "edit", item.id),
      createActionButton("Excluir", "delete", item.id, true),
    );
    cells[6].appendChild(actions);
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
  fillSelect(els.scheduleActivity, DEFAULT_ACTIVITY_OPTIONS, "Selecione a atividade");
  fillMultiSelect(diaryEpaControl, DEFAULT_EPA_OPTIONS);
  fillMultiSelect(scheduleEpaControl, DEFAULT_EPA_OPTIONS);

  try {
    const data = await apiGet({ action: "options" });
    const activities = data.activities?.length ? data.activities : DEFAULT_ACTIVITY_OPTIONS;
    const epas = [...DEFAULT_EPA_OPTIONS, ...(data.epas || [])];
    fillSelect(els.activity, activities, "Selecione a atividade");
    fillSelect(els.scheduleActivity, activities, "Selecione a atividade");
    fillMultiSelect(diaryEpaControl, epas);
    fillMultiSelect(scheduleEpaControl, epas);
    state.activityEpaMap = new Map((data.activityEpaLinks || []).map((item) => [item.activity, item.epa]));
  } catch (error) {
    console.warn(error);
  }
}

async function loadHistory() {
  if (!state.preceptorEmail) return;
  els.refreshHistory.disabled = true;

  try {
    const data = await apiGet({ action: "history", preceptorEmail: state.preceptorEmail });
    state.history = Array.isArray(data.records) ? data.records : [];
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
      residentYear: formData.get("residentYear"),
      residentName: formData.get("residentName"),
      activity: formData.get("activity"),
      description: formData.get("description"),
      epa: formData.get("epa"),
    });

    els.recordForm.reset();
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
      clearEditMode();
    }

    setMessage(els.formMessage, "Registro excluído com sucesso.", "success");
    await loadHistory();
  } catch (error) {
    setMessage(els.formMessage, error.message, "error");
  }
}

function filteredSchedules() {
  const term = state.scheduleFilter.trim().toLowerCase();
  const sorted = [...state.schedules].sort(compareSchedules);
  if (!term) return sorted;

  return sorted.filter((item) => {
    return [item.plannedDate, item.plannedTime, item.residentYear, item.residentName, item.activity, item.notes, item.epa]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(term));
  });
}

function compareSchedules(a, b) {
  const dateA = `${a.plannedDate || "9999-12-31"} ${a.plannedTime || "23:59"}`;
  const dateB = `${b.plannedDate || "9999-12-31"} ${b.plannedTime || "23:59"}`;
  return dateA.localeCompare(dateB);
}

function renderScheduleStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const nextItems = state.schedules
    .map((item) => ({ item, date: parseScheduleDate(item) }))
    .filter(({ date }) => date && date >= today)
    .sort((a, b) => a.date - b.date);

  const weekCount = nextItems.filter(({ date }) => date <= weekEnd).length;

  els.scheduleCount.textContent = state.schedules.length;
  els.scheduleWeekCount.textContent = weekCount;
  els.scheduleNextDate.textContent = nextItems[0] ? formatScheduleDate(nextItems[0].item.plannedDate).split(" ")[0] : "-";
}

function renderScheduleCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const itemsByDate = state.schedules.reduce((map, item) => {
    if (!item.plannedDate) return map;
    map[item.plannedDate] = map[item.plannedDate] || [];
    map[item.plannedDate].push(item);
    return map;
  }, {});

  els.calendarLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(firstDay);

  els.scheduleCalendar.innerHTML = "";
  ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((day) => {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = day;
    els.scheduleCalendar.appendChild(header);
  });

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = dateKey(day);
    const count = itemsByDate[key]?.length || 0;
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (day.getMonth() !== month) cell.classList.add("is-muted");
    if (key === dateKey(new Date())) cell.classList.add("is-today");

    const number = document.createElement("span");
    number.className = "calendar-day";
    number.textContent = day.getDate();
    cell.appendChild(number);

    if (count > 0) {
      const badge = document.createElement("span");
      badge.className = "calendar-badge";
      badge.textContent = count;
      cell.appendChild(badge);
    }

    els.scheduleCalendar.appendChild(cell);
  }
}

function renderScheduleList() {
  const items = filteredSchedules();
  els.scheduleList.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "todo-card";

    const header = document.createElement("div");
    header.className = "todo-card-header";

    const titleWrap = document.createElement("div");
    const date = document.createElement("strong");
    date.textContent = formatScheduleDate(item.plannedDate, item.plannedTime);
    const title = document.createElement("span");
    title.textContent = item.activity || "Atividade sem título";
    titleWrap.append(date, title);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(
      createActionButton("Registrar no Diário", "register-diary", item.id),
      createActionButton("Editar", "edit-schedule", item.id),
      createActionButton("Excluir", "delete-schedule", item.id, true),
    );

    header.append(titleWrap, actions);
    card.appendChild(header);

    const details = document.createElement("div");
    details.className = "todo-details";
    [
      ["Ano", item.residentYear || "-"],
      ["Residente", item.residentName || "-"],
      ["EPA", item.epa || "-"],
      ["Obs.", item.notes || "-"],
    ].forEach(([label, value]) => {
      const line = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      line.append(strong, document.createTextNode(value));
      details.appendChild(line);
    });
    card.appendChild(details);

    els.scheduleList.appendChild(card);
  });

  els.scheduleEmptyState.style.display = items.length === 0 ? "grid" : "none";
}

function renderSchedule() {
  renderScheduleStats();
  renderScheduleCalendar();
  renderScheduleList();
}

async function loadSchedule() {
  if (!state.preceptorEmail) return;
  els.refreshSchedule.disabled = true;

  try {
    const data = await apiGet({ action: "schedule", preceptorEmail: state.preceptorEmail });
    state.schedules = Array.isArray(data.items) ? data.items : [];
    renderSchedule();
  } catch (error) {
    setMessage(els.scheduleMessage, error.message, "error");
  } finally {
    els.refreshSchedule.disabled = false;
  }
}

function clearScheduleEditMode() {
  state.editingScheduleId = "";
  els.scheduleId.value = "";
  els.scheduleFormTitle.textContent = "Nova atividade futura";
  els.submitSchedule.textContent = "Programar atividade";
  els.cancelScheduleEdit.classList.add("is-hidden");
}

function startScheduleEdit(scheduleId) {
  const item = state.schedules.find((schedule) => schedule.id === scheduleId);
  if (!item) return;

  state.editingScheduleId = item.id;
  els.scheduleId.value = item.id;
  els.scheduleDate.value = item.plannedDate || "";
  els.scheduleTime.value = item.plannedTime || "";
  els.scheduleResidentYear.value = item.residentYear || "";
  els.scheduleResidentName.value = item.residentName || "";
  setSelectValue(els.scheduleActivity, item.activity);
  els.scheduleNotes.value = item.notes || "";
  setMultiSelectValues(scheduleEpaControl, splitValues(item.epa));
  els.scheduleFormTitle.textContent = "Editar programação";
  els.submitSchedule.textContent = "Salvar programação";
  els.cancelScheduleEdit.classList.remove("is-hidden");
  setMessage(els.scheduleMessage, "");
  els.scheduleForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveSchedule(formData) {
  els.submitSchedule.disabled = true;
  const isEditing = Boolean(formData.get("scheduleId"));
  setMessage(els.scheduleMessage, isEditing ? "Salvando programação..." : "Programando atividade...");

  try {
    await apiPost({
      action: isEditing ? "updateSchedule" : "createSchedule",
      scheduleId: formData.get("scheduleId"),
      preceptorName: state.preceptorName,
      preceptorEmail: state.preceptorEmail,
      plannedDate: formData.get("plannedDate"),
      plannedTime: formData.get("plannedTime"),
      residentYear: formData.get("residentYear"),
      residentName: formData.get("residentName"),
      activity: formData.get("activity"),
      epa: formData.get("epa"),
      notes: formData.get("notes"),
    });

    els.scheduleForm.reset();
    setMultiSelectValues(scheduleEpaControl, []);
    clearScheduleEditMode();
    setMessage(els.scheduleMessage, isEditing ? "Programação atualizada." : "Atividade programada.", "success");
    await loadSchedule();
  } catch (error) {
    setMessage(els.scheduleMessage, error.message, "error");
  } finally {
    els.submitSchedule.disabled = false;
  }
}

async function deleteSchedule(scheduleId) {
  if (!scheduleId) return;
  const confirmed = window.confirm("Excluir esta atividade programada?");
  if (!confirmed) return;

  setMessage(els.scheduleMessage, "Excluindo programação...");

  try {
    await apiPost({
      action: "deleteSchedule",
      scheduleId,
      preceptorEmail: state.preceptorEmail,
    });

    if (state.editingScheduleId === scheduleId) {
      els.scheduleForm.reset();
      clearScheduleEditMode();
    }

    setMessage(els.scheduleMessage, "Programação excluída.", "success");
    await loadSchedule();
  } catch (error) {
    setMessage(els.scheduleMessage, error.message, "error");
  }
}

function registerScheduleInDiary(scheduleId) {
  const item = state.schedules.find((schedule) => schedule.id === scheduleId);
  if (!item) return;

  els.recordForm.reset();
  clearEditMode();
  els.residentYear.value = item.residentYear || "";
  els.residentName.value = item.residentName || "";
  setSelectValue(els.activity, item.activity);
  els.description.value = item.notes || "";
  setMultiSelectValues(diaryEpaControl, splitValues(item.epa));
  showView("diary");
  setMessage(els.formMessage, "Dados copiados da programação. Revise e toque em Registrar atividade.", "success");
  els.recordPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const preceptorName = normalizeName(new FormData(els.loginForm).get("preceptorName"));
  const preceptorEmail = normalizeEmail(new FormData(els.loginForm).get("preceptorEmail"));
  if (!preceptorName || !preceptorEmail) return;
  setLoggedIn(preceptorName, preceptorEmail);
  setMessage(els.formMessage, "");
  await Promise.all([loadOptions(), loadHistory(), loadSchedule()]);
});

els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

els.recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveRecord(new FormData(els.recordForm));
});

els.scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveSchedule(new FormData(els.scheduleForm));
});

els.changePreceptor.addEventListener("click", setLoggedOut);
els.refreshHistory.addEventListener("click", loadHistory);
els.refreshSchedule.addEventListener("click", loadSchedule);

els.cancelEdit.addEventListener("click", () => {
  els.recordForm.reset();
  setMultiSelectValues(diaryEpaControl, []);
  clearEditMode();
  setMessage(els.formMessage, "");
});

els.cancelScheduleEdit.addEventListener("click", () => {
  els.scheduleForm.reset();
  setMultiSelectValues(scheduleEpaControl, []);
  clearScheduleEditMode();
  setMessage(els.scheduleMessage, "");
});

els.historyBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") startEdit(button.dataset.id);
  if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
});

els.scheduleList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "register-diary") registerScheduleInDiary(button.dataset.id);
  if (button.dataset.action === "edit-schedule") startScheduleEdit(button.dataset.id);
  if (button.dataset.action === "delete-schedule") deleteSchedule(button.dataset.id);
});

els.activity.addEventListener("change", () => {
  const linkedEpa = state.activityEpaMap.get(els.activity.value);
  if (linkedEpa) setMultiSelectValues(diaryEpaControl, splitValues(linkedEpa));
});

els.scheduleActivity.addEventListener("change", () => {
  const linkedEpa = state.activityEpaMap.get(els.scheduleActivity.value);
  if (linkedEpa) setMultiSelectValues(scheduleEpaControl, splitValues(linkedEpa));
});

els.epaToggle.addEventListener("click", () => toggleMultiSelect(diaryEpaControl));
els.scheduleEpaToggle.addEventListener("click", () => toggleMultiSelect(scheduleEpaControl));
els.epaPanel.addEventListener("change", () => updateMultiSelectSummary(diaryEpaControl));
els.scheduleEpaPanel.addEventListener("change", () => updateMultiSelectSummary(scheduleEpaControl));

document.addEventListener("click", (event) => {
  if (!event.target.closest(diaryEpaControl.containerSelector)) closeMultiSelect(diaryEpaControl);
  if (!event.target.closest(scheduleEpaControl.containerSelector)) closeMultiSelect(scheduleEpaControl);
});

els.historyFilter.addEventListener("input", (event) => {
  state.filter = event.target.value;
  renderHistory();
});

els.scheduleFilter.addEventListener("input", (event) => {
  state.scheduleFilter = event.target.value;
  renderScheduleList();
});

els.calendarPrev.addEventListener("click", () => {
  state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
  renderScheduleCalendar();
});

els.calendarNext.addEventListener("click", () => {
  state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
  renderScheduleCalendar();
});

if (state.preceptorName && state.preceptorEmail) {
  setLoggedIn(state.preceptorName, state.preceptorEmail);
  Promise.all([loadOptions(), loadHistory(), loadSchedule()]);
} else {
  showView("diary");
}
