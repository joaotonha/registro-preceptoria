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
  function feedbackPeriod(today, from = "", to = "") {
    const [year, month] = (to || today).split("-").map(Number);
    const cycleYear = month < 3 ? year - 1 : year;
    const quarter = month < 3 || month >= 11 ? 2 : month < 7 ? 0 : 1;
    const start = new Date(cycleYear, 2 + quarter * 4, 1, 12);
    const end = new Date(cycleYear, 6 + quarter * 4, 0, 12);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    return { from: from || iso(start), to: to || (from ? today : iso(end)), custom: Boolean(from || to) };
  }
  function feedbackBundle(history, evaluations, name, unit, period) {
    const diary = residentRows(history, name, unit).filter((row) => inPeriod(row.timestamp, period.from, period.to));
    const epas = residentRows(evaluations, name, unit).filter((row) => inPeriod(row.progressDate, period.from, period.to));
    const entries = [...diary.map((row) => ({ kind: "diary", row, day: row.timestamp })),
      ...epas.map((row) => ({ kind: "epa", row, day: row.progressDate }))]
      .sort((a, b) => String(a.day || "").localeCompare(String(b.day || "")));
    return { diary, epas, entries, period, name, unit };
  }
  function feedbackText(bundle) {
    const labelDate = (value) => date(value).split("-").reverse().join("/") || "Não informada";
    const lines = ["Registros e avaliações para apoiar o feedback", "", `Residente: ${bundle.name}`,
      `Unidade: ${bundle.unit}`, `Período: ${labelDate(bundle.period.from)} a ${labelDate(bundle.period.to)}`,
      `Registros do diário: ${bundle.diary.length} (incluem observações e discussões)`,
      `Avaliações de EPA: ${bundle.epas.length}`, `Total: ${bundle.entries.length}`, ""];
    bundle.entries.forEach(({ kind, row, day }, index) => {
      lines.push(`${index + 1}. ${labelDate(day)} · ${kind === "epa" ? "Avaliação de EPA" : method(row)}`,
        `Ano do residente: ${row.residentYear || "Não informado"}`, `Preceptor: ${row.preceptorName || "Não informado"}`,
        `Unidade: ${row.unit || "Não informada"}`);
      if (kind === "epa") lines.push(`EPA: ${row.epa || "Não informada"}`, `Subtarefa: ${row.epaTask || "Não informada"}`,
        `Nível de supervisão: ${row.progressLevel || "Não informado"}`, "Registro da avaliação:", row.notes || "Sem registro descritivo.",
        ...(row.nextSteps ? [`Próximos passos: ${row.nextSteps}`] : []));
      else lines.push(`Atividade: ${row.activity || "Não informada"}`, `EPA(s): ${row.epa || "Não informada"}`,
        "Registro:", row.description || "Sem registro descritivo.");
      lines.push("", "────────────────────", "");
    });
    lines.push("Espaço para elaboração do feedback:", "- Pontos fortes observados:", "- Aspectos a desenvolver:", "- Combinados e próximos passos:");
    return lines.join("\n");
  }
  return { key, epaKey, date, newest, inPeriod, residentRows, method, isObservation, epaSummary, feedbackPeriod, feedbackBundle, feedbackText };
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
  let copyingFeedback = false;
  let epaSearch = "";
  let epaFilter = "all";

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
      statistic(loaded ? history.filter(M.isObservation).length : "—", "observações entre os registros"),
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
    const controls = node("div", undefined, "epa-explore-filters");
    const search = node("input"); search.type = "search"; search.placeholder = "Buscar EPA ou subtarefa"; search.setAttribute("aria-label", "Buscar EPA ou subtarefa"); search.value = epaSearch;
    const filter = node("select"); filter.setAttribute("aria-label", "Filtrar EPAs"); filter.setAttribute("data-keep-select", "");
    [["all","Todas as EPAs"],["evaluated","Com avaliações"],["empty","Sem avaliações"]].forEach(([value,label]) => filter.append(new Option(label,value)));
    filter.value = epaFilter;
    const count = node("p", undefined, "panel-note");
    controls.append(search, filter); container.append(controls, count);
    function filterCards() {
      let visible = 0;
      container.querySelectorAll(".resident-epa").forEach((card) => {
        const matches = (!epaSearch || card.dataset.search.includes(M.key(epaSearch))) && (epaFilter === "all" || (epaFilter === "evaluated" ? card.dataset.evaluated === "true" : card.dataset.evaluated === "false"));
        card.hidden = !matches; if (matches) visible++;
      });
      count.textContent = `${visible} de ${summaries.length} EPAs${visible ? "" : " · Nenhuma EPA encontrada"}`;
    }
    search.addEventListener("input", () => { epaSearch = search.value; filterCards(); });
    filter.addEventListener("change", () => { epaFilter = filter.value; filterCards(); });
    summaries.forEach((s) => {
      const details = node("details", undefined, "resident-epa");
      details.dataset.epaKey = M.epaKey(s.epa);
      details.dataset.search = M.key([s.epa, ...s.subtasks.map(t => t.task)].join(" "));
      details.dataset.evaluated = String(Boolean(s.evaluations.length));
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
    filterCards();
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
  const feedbackCounts = (bundle) => `${bundle.diary.length} ${bundle.diary.length === 1 ? "registro" : "registros"} e ${bundle.epas.length} ${bundle.epas.length === 1 ? "avaliação EPA" : "avaliações EPA"}`;
  function currentFeedbackBundle() {
    const period = M.feedbackPeriod(todayInputValue(), byId("start").value, byId("end").value);
    return M.feedbackBundle(unitHistory, state.epaProgress, selected, state.preceptorUnit, period);
  }
  function updateFeedbackButton() {
    const bundle = currentFeedbackBundle();
    const button = byId("copy-feedback");
    const complete = loaded && !loading && !loadError && historyScope === "unit" && state.epaLoadStatus === "ready";
    button.disabled = !selected || !complete || !bundle.entries.length || copyingFeedback || bundle.period.from > bundle.period.to;
    button.textContent = copyingFeedback ? "Copiando…" : bundle.period.custom ? "Copiar período para feedback" : "Copiar quadrimestre para feedback";
    byId("feedback-period").textContent = `Feedback: ${displayDate(bundle.period.from)} a ${displayDate(bundle.period.to)} · registros do diário e avaliações EPA de todos os preceptores da unidade.`;
    button.title = complete ? `${feedbackCounts(bundle)}, de ${displayDate(bundle.period.from)} a ${displayDate(bundle.period.to)}. Sem filtro de datas, copia o quadrimestre atual do ciclo iniciado em março.`
      : "Aguarde o carregamento completo dos registros e avaliações da unidade. Se houver falha, atualize o painel.";
  }
  async function copyResidentFeedback() {
    updateFeedbackButton();
    if (byId("copy-feedback").disabled) return;
    const bundle = currentFeedbackBundle();
    const copyGeneration = generation;
    const copyResident = selected;
    copyingFeedback = true;
    updateFeedbackButton();
    try {
      await copyTextToClipboard(M.feedbackText(bundle));
      if (copyGeneration !== generation || selected !== copyResident) return;
      setMessage(byId("feedback-status"), `Copiados ${feedbackCounts(bundle)}, de ${displayDate(bundle.period.from)} a ${displayDate(bundle.period.to)}. Cole o texto onde for elaborar o feedback.`, "success");
    } catch (error) {
      if (copyGeneration === generation && selected === copyResident) setMessage(byId("feedback-status"), error.message, "error");
    } finally {
      if (copyGeneration === generation) { copyingFeedback = false; updateFeedbackButton(); }
    }
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
    const periodParts = [byId("start").value ? `De ${displayDate(byId("start").value)}` : "", byId("end").value ? `Até ${displayDate(byId("end").value)}` : ""].filter(Boolean);
    byId("period-label").textContent = `Filtrar por período${periodParts.length ? " · ativo" : ""}`;
    byId("active-period").textContent = periodParts.join(" · ");
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
    updateFeedbackButton();
    if (!selected || invalidPeriod) return;
    const resident = currentResident();
    byId("name").textContent = resident.name;
    byId("context").textContent = [resident.year, state.preceptorUnit, byId("start").value || byId("end").value ? periodParts.join(" · ") : "Todo o período"].filter(Boolean).join(" · ");
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
    setMessage(byId("feedback-status"), "");
    state.epaSelectedResident = selected;
    byId("epas").replaceChildren();
    render();
  });
  ["start", "end"].forEach((id) => byId(id).addEventListener("change", () => { byId("period-preset").value = "custom"; setMessage(byId("feedback-status"), ""); render(); }));
  byId("clear-period").addEventListener("click", () => { byId("start").value = ""; byId("end").value = ""; byId("period-preset").value = "all"; setMessage(byId("feedback-status"), ""); render(); });
  byId("period-preset").addEventListener("change", () => {
    const choice = byId("period-preset").value;
    if (choice === "custom") { byId("start").focus(); return; }
    let reference = todayInputValue();
    if (choice === "previous") {
      const current = M.feedbackPeriod(reference);
      const day = new Date(`${current.from}T12:00:00`); day.setDate(0); reference = dateKey(day);
    }
    const period = M.feedbackPeriod(reference);
    byId("start").value = choice === "all" ? "" : period.from;
    byId("end").value = choice === "all" ? "" : period.to;
    setMessage(byId("feedback-status"), ""); render();
  });
  document.addEventListener("resident:prepare-feedback", (event) => {
    selected = event.detail?.resident || "";
    const period = M.feedbackPeriod(todayInputValue());
    byId("start").value = period.from; byId("end").value = period.to;
    byId("period-preset").value = "current";
    setMessage(byId("feedback-status"), ""); render();
    if (selected) byId("copy-feedback").focus(); else byId("resident").focus();
  });
  byId("new-epa").addEventListener("click", () => openEvaluation());
  byId("copy-feedback").addEventListener("click", copyResidentFeedback);
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
    copyingFeedback = false;
    epaSearch = ""; epaFilter = "all"; byId("period-preset").value = "all";
    setMessage(byId("feedback-status"), "");
    byId("copy-feedback").disabled = true;
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
