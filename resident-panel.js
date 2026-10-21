/* Painel individual: usa registros existentes, sem converter supervisão em nota. */
const ResidentPanelModel = (() => {
  const key = (value) => String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const epaKey = (value) => {
    const number = String(value || "").match(/^EPA\s*(\d+)\b/i);
    return number ? `epa-${Number(number[1])}` : key(value);
  };
  const date = (value) => {
    const text = String(value || "").slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
  };
  const newest = (rows, field) => rows.map((row, index) => ({ row, index }))
    .sort((a, b) => String(b.row[field] || "").localeCompare(String(a.row[field] || "")) || b.index - a.index)
    .map(({ row }) => row);
  const inPeriod = (value, from, to) => {
    const day = date(value);
    return (!from && !to) || Boolean(day && (!from || day >= from) && (!to || day <= to));
  };
  const residentRows = (rows, name, unit) => rows.filter((row) => name && key(row.residentName) === key(name)
    && (!unit || key(row.unit) === key(unit)));
  const method = (row) => {
    const match = String(row.description || "").match(/^Método:\s*([^\r\n]+)/);
    return match ? match[1].trim() : "Registro do diário";
  };
  const isObservation = (row) => ["Calgary-Cambridge", "Mini-CEX", "DOPS", "Sombra/sombra invertida", "Sombra e sombra invertida"].includes(method(row))
    || /^Observação direta\b/i.test(row.activity || "");
  function epaSummary(epa, catalogTasks, rows, levels) {
    const tasks = [...new Map(catalogTasks.filter((item) => epaKey(item.epa) === epaKey(epa) && key(item.task))
      .map((item) => [key(item.task), item.task])).values()];
    const evaluations = newest(rows.filter((row) => epaKey(row.epa) === epaKey(epa)), "progressDate");
    const subtasks = tasks.map((task) => {
      const history = evaluations.filter((row) => key(row.epaTask) === key(task));
      const latest = history.find((row) => levels.includes(row.progressLevel));
      return { task, history, latest };
    });
    const observed = subtasks.filter((item) => item.latest).length;
    const unlinked = evaluations.filter((row) => !tasks.some((task) => key(task) === key(row.epaTask)));
    return { epa, evaluations, subtasks, observed, total: tasks.length,
      coverage: tasks.length ? Math.round(observed / tasks.length * 100) : null, unlinked };
  }
  return { key, epaKey, date, newest, inPeriod, residentRows, method, isObservation, epaSummary };
})();

(() => {
  const M = ResidentPanelModel;
  const byId = (id) => document.getElementById(`dashboard-${id}`);
  const root = document.getElementById("resident-dashboard");
  let unitHistory = [];
  let selected = "";
  let activeTab = "overview";
  let timelineType = "0";
  let loaded = false;
  let loading = false;
  let loadError = "";
  let historyScope = "";
  let generation = 0;
  let needsReload = true;
  let pendingReload = false;
  let evaluationDirty = false;

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function displayDate(value) {
    const day = M.date(value);
    return day ? formatDateOnly(`${day}T12:00:00`) : "Sem data";
  }
  function action(text, callback, className = "button secondary") {
    const button = node("button", text, className);
    button.type = "button";
    button.addEventListener("click", callback);
    return button;
  }
  function matching(rows) { return M.residentRows(rows, selected, state.preceptorUnit); }
  function periodRows(rows, field) {
    return rows.filter((row) => M.inPeriod(row[field], byId("start").value, byId("end").value));
  }
  function residents() {
    const items = new Map();
    const directory = state.residentDirectory.filter((item) => !item.unit || M.key(item.unit) === M.key(state.preceptorUnit));
    directory.forEach((item) => { if (item.name) items.set(M.key(item.name), { name: item.name, year: item.year || "" }); });
    [...unitHistory, ...state.epaProgress].forEach((row) => {
      if (!row.residentName || M.key(row.unit) !== M.key(state.preceptorUnit)) return;
      if (!items.has(M.key(row.residentName))) items.set(M.key(row.residentName), { name: row.residentName, year: row.residentYear || "" });
    });
    return [...items.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }
  function switchTab(name, focus = false) {
    activeTab = name;
    root.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
      const active = button.dataset.dashboardTab === name;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      byId(button.dataset.dashboardTab).classList.toggle("is-hidden", !active);
      if (focus && active) button.focus();
    });
  }
  function statistic(value, label) {
    const card = node("div", undefined, "resident-stat");
    card.append(node("strong", value), node("span", label));
    return card;
  }
  function currentResident() { return residents().find((item) => M.key(item.name) === M.key(selected)); }
  function openEvaluation(epa = "", task = "") {
    if (state.epaEditingId || evaluationDirty) {
      setMessage(els.epaFormMessage, `Há uma avaliação em preenchimento para ${els.epaResidentName.value || "um residente ainda não escolhido"}. Conclua ou cancele antes de iniciar outra.`, "error");
      document.getElementById("epa-evaluation-editor").open = true;
      document.getElementById("epa-evaluation-editor").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const resident = currentResident();
    setEpaResidentYear(resident?.year || "");
    renderEpaResidentOptions(selected);
    setSelectValue(els.epaProgressSelect, epa);
    fillEpaTaskSelect(task);
    refreshSmallSelects();
    const editor = document.getElementById("epa-evaluation-editor");
    editor.open = true;
    editor.scrollIntoView({ behavior: "smooth", block: "start" });
    els.epaProgressDate.focus({ preventScroll: true });
  }
  function badge(level) {
    const index = DEFAULT_PROGRESS_LEVEL_OPTIONS.indexOf(level);
    return node("span", level || "Sem avaliação", `resident-level resident-level-${index < 0 ? "none" : index}`);
  }
  function coverage(summary) {
    const box = node("div", undefined, "resident-coverage");
    if (summary.coverage === null) {
      box.append(node("span", "Cobertura indisponível: subtarefas não cadastradas."));
      return box;
    }
    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = summary.coverage;
    progress.setAttribute("aria-label", `Cobertura de ${summary.epa}: ${summary.observed} de ${summary.total} subtarefas`);
    box.append(node("span", `${summary.coverage}% · ${summary.observed} de ${summary.total} subtarefas com avaliação no período`), progress);
    return box;
  }
  function renderOverview(history, evaluations, summaries) {
    const container = byId("overview");
    container.replaceChildren();
    const stats = node("div", undefined, "resident-stats");
    stats.append(statistic(loaded ? history.length : "—", "registros do diário"),
      statistic(loaded ? history.filter(M.isObservation).length : "—", "observações registradas"),
      statistic(`${summaries.filter((s) => s.evaluations.length).length}/${summaries.length}`, "EPAs com avaliação"),
      statistic(evaluations.length, "avaliações de subtarefas"));
    container.append(stats);
    const dates = [...history.map((row) => M.date(row.timestamp)), ...evaluations.map((row) => M.date(row.progressDate))].filter(Boolean).sort();
    container.append(node("p", dates.length ? `Última atividade no período: ${displayDate(dates.at(-1))}.` : "Nenhuma atividade encontrada neste período.", "panel-note"));
    const heading = node("h3", "O que acompanhar agora");
    const opportunities = node("ul", undefined, "resident-opportunities");
    if (!evaluations.length) opportunities.append(node("li", "Ainda não há avaliação de subtarefas neste período. Escolha uma EPA para começar."));
    else {
      const missing = summaries.filter((s) => s.total && s.observed < s.total);
      missing.slice(0, 3).forEach((s) => opportunities.append(node("li", `${s.epa.split("–")[0].trim()}: ${s.total - s.observed} subtarefa(s) sem avaliação neste período.`)));
      if (!missing.length) opportunities.append(node("li", "Todas as subtarefas cadastradas têm avaliação no período. Consulte os níveis e combine o próximo acompanhamento."));
    }
    container.append(heading, opportunities, action("Explorar EPAs", () => switchTab("epas", true)));
    const instruments = new Map();
    history.filter(M.isObservation).forEach((row) => {
      const label = M.method(row) === "Registro do diário" ? row.activity : M.method(row);
      instruments.set(label, (instruments.get(label) || 0) + 1);
    });
    if (instruments.size) {
      container.append(node("h3", "Observações no período"));
      const list = node("div", undefined, "resident-instrument-list");
      instruments.forEach((count, label) => list.append(node("span", `${label} · ${count}`, "resident-instrument")));
      container.append(list);
    }
    const recent = timelineEntries(history, evaluations).slice(0, 3);
    if (recent.length) {
      container.append(node("h3", "Atividades recentes"));
      recent.forEach((entry) => container.append(timelineCard(entry)));
      container.append(action("Ver todos os registros", () => switchTab("timeline", true)));
    }
  }
  function renderTask(task, epa) {
    const details = node("details", undefined, "resident-task");
    const summary = node("summary");
    const caption = node("span", undefined, "resident-task-caption");
    caption.append(node("strong", task.task), badge(task.latest?.progressLevel));
    const date = task.latest ? displayDate(task.latest.progressDate) : "Ainda sem avaliação no período";
    caption.append(node("small", `${date}${task.history.length ? ` · ${task.history.length} avaliação(ões)` : ""}`));
    summary.append(caption);
    details.append(summary);
    if (task.history.length) {
      details.append(node("p", "Níveis no tempo (mais antigo → mais recente). Cada nível é uma atribuição do preceptor.", "panel-note"));
      const trajectory = node("ol", undefined, "resident-trajectory");
      task.history.slice().reverse().forEach((row) => {
        const point = node("li");
        point.append(node("small", displayDate(row.progressDate)), badge(row.progressLevel), node("small", row.preceptorName || "Preceptor não informado"));
        trajectory.append(point);
      });
      details.append(trajectory);
      task.history.forEach((row) => details.append(renderEpaCard(row)));
    } else details.append(node("p", "Nenhuma avaliação registrada para esta subtarefa no período selecionado.", "panel-note"));
    details.append(action("Avaliar esta subtarefa", () => openEvaluation(epa, task.task)));
    return details;
  }
  function renderEpas(summaries) {
    const container = byId("epas");
    const openEpas = new Set([...container.querySelectorAll("[data-epa-key][open]")].map((el) => el.dataset.epaKey));
    const openTasks = new Set([...container.querySelectorAll("[data-task-key][open]")].map((el) => el.dataset.taskKey));
    container.replaceChildren(node("h3", "Desenvolvimento das EPAs"),
      node("p", "A barra mostra a cobertura de subtarefas com avaliação no período. Os níveis de supervisão aparecem em cada subtarefa. Quantidade de avaliações não é uma nota.", "panel-note"));
    const legend = node("div", undefined, "resident-legend");
    legend.append(badge(""), ...DEFAULT_PROGRESS_LEVEL_OPTIONS.map(badge));
    container.append(legend);
    summaries.forEach((s) => {
      const details = node("details", undefined, "resident-epa");
      details.dataset.epaKey = M.epaKey(s.epa);
      details.open = openEpas.has(details.dataset.epaKey);
      const summary = node("summary");
      const heading = node("div", undefined, "resident-epa-heading");
      heading.append(node("strong", s.epa), node("small", `${s.evaluations.length} avaliação(ões)${s.evaluations[0] ? ` · última em ${displayDate(s.evaluations[0].progressDate)}` : " · ainda sem avaliação no período"}`));
      summary.append(heading, coverage(s));
      details.append(summary);
      const body = node("div", undefined, "resident-epa-body");
      body.append(action("Avaliar esta EPA", () => openEvaluation(s.epa)));
      s.subtasks.forEach((task) => {
        const row = renderTask(task, s.epa);
        row.dataset.taskKey = `${M.epaKey(s.epa)}|${M.key(task.task)}`;
        row.open = openTasks.has(row.dataset.taskKey);
        body.append(row);
      });
      if (!s.total) body.append(node("p", "O catálogo de subtarefas desta EPA não está disponível. As avaliações existentes continuam acessíveis abaixo.", "panel-note"));
      if (s.unlinked.length) {
        const old = node("details", undefined, "resident-task");
        old.append(node("summary", `${s.unlinked.length} avaliação(ões) sem correspondência no catálogo atual`));
        old.append(node("p", "Estes registros são preservados, mas não entram na cobertura das subtarefas cadastradas.", "panel-note"));
        s.unlinked.forEach((row) => old.append(renderEpaCard(row)));
        body.append(old);
      }
      details.append(body);
      container.append(details);
    });
  }
  function timelineEntries(history, evaluations) {
    return [...history.map((row) => ({ kind: "diary", row, day: row.timestamp })),
      ...evaluations.map((row) => ({ kind: "epa", row, day: row.progressDate }))]
      .sort((a, b) => String(b.day || "").localeCompare(String(a.day || "")));
  }
  function timelineCard(entry) {
    const row = entry.row;
    const details = node("details", undefined, "resident-timeline-card");
    const summary = node("summary");
    const title = entry.kind === "epa" ? "Avaliação EPA" : M.method(row);
    const heading = node("div");
    heading.append(node("strong", title), node("span", entry.kind === "epa" ? `${row.epa} · ${row.epaTask || "Sem subtarefa"}` : row.activity || "Atividade não informada"),
      node("small", `${M.date(entry.day) ? displayDate(entry.day) : "Data não informada"} · ${row.preceptorName || "Preceptor não informado"}`));
    summary.append(heading);
    details.append(summary);
    if (entry.kind === "epa") details.append(renderEpaCard(row));
    else {
      if (row.epa) details.append(node("p", `EPAs relacionadas: ${row.epa}`, "panel-note"));
      details.append(node("p", row.description || "Sem registro descritivo.", "history-card-description"));
      details.append(action("Copiar registro", async (event) => {
        const button = event.currentTarget;
        try {
          await copyTextToClipboard(buildFeedbackText(row));
          button.textContent = "Copiado";
          setTimeout(() => { if (button.isConnected) button.textContent = "Copiar registro"; }, 1500);
        } catch (error) { setMessage(byId("message"), error.message, "error"); }
      }));
    }
    return details;
  }
  function renderTimeline(history, evaluations) {
    const container = byId("timeline");
    container.replaceChildren(node("h3", "Registros e observações"));
    const entries = timelineEntries(history, evaluations);
    container.append(node("p", `${entries.length} registro(s) no período. Abra um registro para ler os detalhes. As observações já estão incluídas nos registros do diário.`, "panel-note"));
    if (!entries.length) container.append(node("p", "Nenhum registro encontrado neste período.", "resident-empty"));
    const filters = node("div", undefined, "resident-timeline-filters");
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Tipo de registro");
    select.setAttribute("data-keep-select", "");
    const types = ["Todos", "Avaliações EPA", "Observações", "Outros registros"];
    types.forEach((label, i) => { const option = node("option", label); option.value = String(i); select.append(option); });
    select.value = timelineType;
    filters.append(select);
    const resultCount = node("p", undefined, "panel-note");
    resultCount.setAttribute("aria-live", "polite");
    const list = node("div");
    function draw() {
      const filtered = entries.filter((entry) => select.value === "0" || (select.value === "1" && entry.kind === "epa")
        || (select.value === "2" && entry.kind === "diary" && M.isObservation(entry.row))
        || (select.value === "3" && entry.kind === "diary" && !M.isObservation(entry.row)));
      resultCount.textContent = `Mostrando ${filtered.length} de ${entries.length} registros no período.`;
      list.replaceChildren(...filtered.map(timelineCard));
      if (!filtered.length) list.append(node("p", "Nenhum registro deste tipo no período.", "resident-empty"));
    }
    select.addEventListener("change", () => { timelineType = select.value; draw(); });
    container.append(filters, resultCount, list);
    draw();
  }
  function render() {
    const options = residents();
    const select = byId("resident");
    const signature = JSON.stringify(options);
    if (select.dataset.options !== signature) {
      select.replaceChildren(new Option("Selecione o residente", ""), ...options.map((item) => new Option(`${item.name}${item.year ? ` (${item.year})` : ""}`, item.name)));
      select.dataset.options = signature;
    }
    if (!options.some((item) => M.key(item.name) === M.key(selected))) selected = "";
    select.value = options.find((item) => M.key(item.name) === M.key(selected))?.name || "";
    const invalidPeriod = byId("start").value && byId("end").value && byId("start").value > byId("end").value;
    const messages = [];
    if (loading) messages.push("Atualizando os registros da unidade…");
    if (loadError) messages.push(loadError);
    if (loaded && historyScope !== "unit") messages.push("A consulta retornou apenas os seus registros. O histórico do residente pode estar incompleto.");
    if (state.epaLoadStatus === "loading") messages.push("Atualizando as avaliações EPA…");
    if (state.epaLoadStatus === "error") messages.push("Não foi possível atualizar as avaliações EPA. Tente atualizar o painel.");
    if (invalidPeriod) messages.push("A data inicial deve ser anterior ou igual à data final.");
    setMessage(byId("message"), messages.join(" "), loadError || invalidPeriod || state.epaLoadStatus === "error" ? "error" : "");
    byId("content").classList.toggle("is-hidden", !selected || Boolean(invalidPeriod));
    byId("empty").classList.toggle("is-hidden", Boolean(selected) || Boolean(invalidPeriod));
    byId("empty").textContent = options.length ? "Selecione um residente para acompanhar os registros e as EPAs." : "Nenhum residente disponível. Atualize o painel ou confira o cadastro da unidade.";
    if (!selected || invalidPeriod) return;
    const resident = currentResident();
    byId("name").textContent = resident.name;
    byId("context").textContent = [resident.year, state.preceptorUnit, byId("start").value || byId("end").value ? "Período personalizado" : "Todo o período"].filter(Boolean).join(" · ");
    const history = periodRows(matching(unitHistory), "timestamp");
    const evaluations = periodRows(matching(state.epaProgress), "progressDate");
    const epaNames = new Map();
    [...state.epaCatalog, ...DEFAULT_EPA_OPTIONS, ...evaluations.map((row) => row.epa)].filter(Boolean).forEach((epa) => {
      if (!epaNames.has(M.epaKey(epa))) epaNames.set(M.epaKey(epa), epa);
    });
    const epas = [...epaNames.values()];
    epas.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
    const summaries = epas.map((epa) => M.epaSummary(epa, state.epaTasks, evaluations, DEFAULT_PROGRESS_LEVEL_OPTIONS));
    renderOverview(history, evaluations, summaries);
    renderEpas(summaries);
    renderTimeline(history, evaluations);
    switchTab(activeTab);
  }
  async function loadUnitHistory() {
    if (!state.preceptorEmail || !state.preceptorUnit) return;
    if (loading) { pendingReload = true; return; }
    const requestGeneration = generation;
    loading = true;
    pendingReload = false;
    loadError = "";
    render();
    try {
      const data = await apiGet({ action: "history", preceptorName: state.preceptorName, preceptorEmail: state.preceptorEmail,
        preceptorUnit: state.preceptorUnit, scope: "unit" });
      if (requestGeneration !== generation) return;
      unitHistory = Array.isArray(data.records) ? data.records : [];
      historyScope = data.scope || "mine";
      loaded = true;
      needsReload = false;
    } catch (error) {
      if (requestGeneration !== generation) return;
      loadError = `Não foi possível atualizar os registros do diário. ${loaded ? "Os registros exibidos são da última consulta. " : ""}${error.message}`;
      needsReload = true;
    } finally {
      if (requestGeneration === generation) {
        loading = false;
        render();
        if (pendingReload && state.activeView === "epa") { pendingReload = false; void loadUnitHistory(); }
      }
    }
  }
  byId("resident").addEventListener("change", () => {
    selected = byId("resident").value;
    state.epaSelectedResident = selected;
    byId("epas").replaceChildren();
    render();
  });
  ["start", "end"].forEach((id) => byId(id).addEventListener("change", render));
  byId("clear-period").addEventListener("click", () => { byId("start").value = ""; byId("end").value = ""; render(); });
  byId("new-epa").addEventListener("click", () => openEvaluation());
  root.querySelectorAll("[data-dashboard-tab]").forEach((button, index, buttons) => {
    button.addEventListener("click", () => switchTab(button.dataset.dashboardTab));
    button.addEventListener("keydown", (event) => {
      const next = event.key === "ArrowRight" ? (index + 1) % buttons.length : event.key === "ArrowLeft" ? (index + buttons.length - 1) % buttons.length
        : event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); switchTab(buttons[next].dataset.dashboardTab, true); }
    });
  });
  ["input", "change"].forEach((name) => els.epaProgressForm.addEventListener(name, () => {
    evaluationDirty = true;
    els.cancelEpaEdit.classList.remove("is-hidden");
  }));
  els.epaProgressForm.addEventListener("click", (event) => {
    if (event.target.closest("[data-epa-level], [data-epa-resident-year]")) {
      evaluationDirty = true;
      els.cancelEpaEdit.classList.remove("is-hidden");
    }
  });
  els.epaProgressForm.addEventListener("reset", () => { evaluationDirty = false; });
  root.addEventListener("click", handleEpaAction);
  document.addEventListener("resident:open", () => { render(); if (needsReload) void loadUnitHistory(); });
  document.addEventListener("resident:refresh", () => { void loadUnitHistory(); void loadEpaProgress(); });
  document.addEventListener("resident:history-changed", () => {
    needsReload = true;
    if (state.activeView === "epa") void loadUnitHistory();
  });
  document.addEventListener("resident:epa-changed", render);
  document.addEventListener("resident:reset", () => {
    generation += 1;
    unitHistory = [];
    selected = "";
    loaded = false;
    loading = false;
    needsReload = true;
    pendingReload = false;
    loadError = "";
    activeTab = "overview";
    timelineType = "0";
    evaluationDirty = false;
    byId("resident").replaceChildren(new Option("Selecione o residente", ""));
    delete byId("resident").dataset.options;
    byId("start").value = "";
    byId("end").value = "";
    byId("content").classList.add("is-hidden");
    ["overview", "epas", "timeline"].forEach((id) => byId(id).replaceChildren());
    byId("message").textContent = "";
    byId("empty").classList.remove("is-hidden");
  });
})();
