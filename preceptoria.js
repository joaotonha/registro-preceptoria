/* Roteiros autorais de apoio formativo; não são traduções validadas dos instrumentos. */
const PRACTICE_METHODS = [
  {
    id: "omp", category: "discuss", name: "One-Minute Preceptor", subtitle: "Discutir um caso rápido",
    purpose: "Explore o raciocínio do residente e escolha um aprendizado para levar ao próximo atendimento.",
    activity: "Discussão de caso clínico",
    reference: "https://www.jabfm.org/content/5/4/419",
    citation: "Neher et al. (1992). A Five-Step Microskills Model of Clinical Teaching.",
    fields: [
      ["Hipótese ou decisão do residente", "Qual hipótese ou conduta você considera mais adequada?"],
      ["Evidências e raciocínio", "Quais achados sustentam essa escolha?"],
      ["Princípio discutido", "Que aprendizado deste caso pode ser aplicado em outras situações?"],
      ["Acertos observados", "Que ação merece ser mantida e por quê?"],
      ["Melhorias e próximo passo", "O que fazer de outra forma no próximo atendimento?"],
    ],
  },
  {
    id: "snapps", category: "discuss", name: "SNAPPS", subtitle: "Explorar o raciocínio do residente",
    purpose: "O residente conduz a apresentação, explicita suas dúvidas e escolhe uma questão para estudar.",
    activity: "Discussão de caso clínico",
    reference: "https://pubmed.ncbi.nlm.nih.gov/14507619/",
    citation: "Wolpaw, Wolpaw e Papp (2003). SNAPPS: a learner-centered model for outpatient education.",
    fields: [
      ["Síntese do caso", "Quais são os dados essenciais da história e do exame?"],
      ["Hipóteses prioritárias", "Quais duas ou três hipóteses merecem ser consideradas?"],
      ["Comparação das hipóteses", "O que favorece ou enfraquece cada possibilidade?"],
      ["Dúvidas para o preceptor", "Em que ponto você está inseguro ou precisa de ajuda?"],
      ["Plano proposto", "Que plano você propõe e como vai acompanhar?"],
      ["Tema para estudo e retorno", "O que você vai estudar e quando retomaremos essa questão?"],
    ],
  },
  {
    id: "cbd", category: "discuss", name: "Discussão Baseada em Casos (CBD)", subtitle: "Revisar decisões de um atendimento",
    purpose: "Retome um caso real já atendido e discuta as decisões efetivamente tomadas.",
    activity: "Discussão de caso clínico",
    reference: "https://www.rcgp.org.uk/mrcgp-exams/wpba/cbd",
    citation: "Royal College of General Practitioners. Case-Based Discussion (CbD).",
    fields: [
      ["Contexto e foco da discussão", "Qual atendimento foi escolhido e qual decisão será explorada?"],
      ["Decisões e fundamentos", "O que você decidiu e quais informações usou?"],
      ["Pessoa, contexto e alternativas", "Como as preferências da pessoa e os recursos disponíveis influenciaram o plano?"],
      ["Incertezas e acompanhamento", "Que riscos você considerou e como organizou o seguimento?"],
      ["Reflexão e próximos passos", "O que manteria, o que mudaria e o que precisa aprofundar?"],
    ],
  },
  {
    id: "minicex", category: "observe", name: "Mini-CEX", subtitle: "Observar uma consulta",
    purpose: "Combine um foco, observe o atendimento e converse com o residente logo após a consulta.",
    activity: "Observação direta de Consulta Individual",
    reference: "https://www.abim.org/program-directors-administrators/assessment-tools",
    citation: "American Board of Internal Medicine. Mini-Clinical Evaluation Exercise (Mini-CEX).",
    domains: ["Entrevista clínica", "Exame físico", "Profissionalismo", "Julgamento clínico", "Orientação e comunicação", "Organização e eficiência", "Desempenho global"],
    fields: [
      ["Contexto e foco combinado", "Que parte do atendimento será observada?"],
      ["Evidências observadas", "Descreva ações concretas que sustentam sua avaliação."],
      ["Autoavaliação do residente", "Como você avalia seu desempenho nesta consulta?"],
      ["Feedback e próximos passos", "O que manter, o que desenvolver e quando observar novamente?"],
    ],
  },
  {
    id: "dops", category: "observe", name: "DOPS", subtitle: "Observar um procedimento",
    purpose: "Observe um procedimento real, registre o desempenho e combine uma oportunidade de aprimoramento.",
    activity: "Supervisão de Procedimento Ambulatorial",
    reference: "https://heeoe.hee.nhs.uk/sites/default/files/appendix_2_-_final_july_2015.pdf",
    citation: "Royal College of Physicians / JRCPTB. Direct Observation of Procedural Skills (DOPS).",
    domains: ["Indicação e conhecimento do procedimento", "Explicação e consentimento", "Preparação e segurança", "Técnica e manejo dos materiais", "Comunicação e profissionalismo", "Cuidados e orientações após o procedimento"],
    fields: [
      ["Procedimento e contexto", "Qual procedimento foi observado e qual era o foco?"],
      ["Evidências e apoio necessário", "O que o residente realizou e em que momentos precisou de ajuda?"],
      ["Autoavaliação do residente", "O que foi bem e o que foi mais difícil?"],
      ["Feedback e próximos passos", "Que habilidade precisa ser praticada e quando será revista?"],
    ],
  },
  {
    id: "shadow", category: "observe", name: "Sombra e sombra invertida", subtitle: "Aprender pela observação da prática",
    purpose: "Defina quem observa, combine o foco e reserve uma conversa ao final.",
    activity: "Observação direta de Consulta Individual",
    reference: "https://med.emory.edu/opex/preceptors/tips/effective-preceptors.html",
    citation: "Emory University. Being an Effective Preceptor: observação direta e modelagem da prática. A nomenclatura de sombra pode variar; o registro explicita quem observou quem.",
    fields: [
      ["Foco combinado", "Que aspecto da prática vocês decidiram observar?"],
      ["Observações", "Que ações e decisões chamaram atenção?"],
      ["Reflexão conjunta", "Que raciocínio estava por trás dessas ações? O que foi aprendido?"],
      ["Aplicação e próximos passos", "Como esse aprendizado será experimentado na próxima atividade?"],
    ],
  },
  {
    id: "feedback", category: "feedback", name: "Feedback estruturado", subtitle: "Conversar e combinar o próximo passo",
    purpose: "Converse a partir de situações observadas, ouça o residente e combine ações concretas.",
    activity: "Realização de feedback",
    reference: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3839441/",
    citation: "Preceptor Development: Providing Effective Feedback (2013).",
    fields: [
      ["Situação e autoavaliação", "Sobre qual situação vamos conversar? Como o residente a percebeu?"],
      ["Pontos fortes e evidências", "Que comportamento foi positivo e qual foi seu efeito?"],
      ["Aspectos a desenvolver", "Que comportamento precisa mudar? Qual exemplo ajuda a explicar?"],
      ["Combinados e acompanhamento", "Qual será a próxima ação, que apoio será oferecido e quando retomar?"],
    ],
  },
];

(() => {
  const q = (id) => document.getElementById(`practice-${id}`);
  let method = null;
  let year = "";
  let dirty = false;
  let saving = false;
  let savedRecord = null;
  const assessmentOptions = ["Não observado", "Precisa desenvolver", "Adequado ao momento de formação", "Destaque observado"];

  function refreshResidents() {
    if (!method || savedRecord || saving) return;
    renderResidentSelect({ select: q("resident"), hiddenInput: q("resident-name"), otherInput: q("other"),
      hint: q("resident-hint"), selectedYear: year, selectedValue: q("resident-name").value });
  }

  function renderCatalog(category) {
    q("categories").querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.category === category));
    });
    q("catalog").replaceChildren();
    PRACTICE_METHODS.filter((item) => item.category === category).forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "practice-method";
      button.dataset.method = item.id;
      button.setAttribute("aria-pressed", String(item === method));
      const title = document.createElement("strong");
      title.textContent = item.name;
      const subtitle = document.createElement("span");
      subtitle.textContent = item.subtitle;
      button.append(title, subtitle);
      button.addEventListener("click", () => openMethod(item));
      q("catalog").append(button);
    });
  }

  function addField(label, element) {
    const field = document.createElement("div");
    field.className = "field";
    const caption = document.createElement("label");
    caption.htmlFor = element.id;
    caption.textContent = label;
    field.append(caption, element);
    q("prompts").append(field);
  }

  function openMethod(item, force = false) {
    if (saving) return;
    if (dirty && !force && !window.confirm("Trocar de roteiro e descartar as anotações ainda não salvas?")) return;
    method = item;
    year = "";
    dirty = false;
    savedRecord = null;
    q("form").reset();
    q("fields").disabled = false;
    q("form").classList.remove("is-hidden");
    q("review").classList.add("is-hidden");
    q("saved").classList.add("is-hidden");
    q("date").value = todayInputValue();
    q("date").max = todayInputValue();
    q("resident-name").value = "";
    q("title").textContent = item.name;
    q("purpose").textContent = item.purpose;
    fillSelect(q("activity"), [...DEFAULT_ACTIVITY_OPTIONS, "Discussão de caso clínico"], "Selecione a atividade");
    q("activity").value = item.activity;
    q("reference-note").textContent = `Roteiro formativo adaptado para o diário, sem escala validada ou certificação de competência. Referência: ${item.citation}`;
    q("reference-link").href = item.reference;
    q("prompts").replaceChildren();
    q("form").querySelectorAll("details").forEach((details) => { details.open = false; });
    q("form").querySelectorAll("[data-practice-year]").forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
    if (item.id === "shadow") {
      const select = document.createElement("select");
      select.id = "practice-direction";
      ["Residente observa o preceptor", "Preceptor observa o residente"].forEach((text) => select.add(new Option(text, text)));
      addField("Quem observa quem?", select);
    }
    item.fields.forEach(([label, prompt], index) => {
      const input = document.createElement("textarea");
      input.id = `practice-answer-${index}`;
      input.rows = 2;
      input.placeholder = prompt;
      addField(label, input);
    });
    if (item.domains) {
      const heading = document.createElement("h3");
      heading.textContent = "Avaliação formativa por domínio (opcional)";
      q("prompts").append(heading);
      item.domains.forEach((label, index) => {
        const select = document.createElement("select");
        select.id = `practice-domain-${index}`;
        select.add(new Option("Sem avaliação", ""));
        assessmentOptions.forEach((text) => select.add(new Option(text, text)));
        addField(label, select);
      });
    }
    q("epas").replaceChildren();
    DEFAULT_EPA_OPTIONS.forEach((epa) => {
      const label = document.createElement("label");
      label.className = "multi-select-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = epa;
      const text = document.createElement("span");
      text.textContent = epa;
      label.append(checkbox, text);
      q("epas").append(label);
    });
    setMessage(q("message"), "");
    refreshResidents();
    renderCatalog(item.category);
    q("title").scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function buildDescription() {
    const parts = [`Método: ${method.name}`];
    if (method.domains) parts.push("Avaliação formativa adaptada; sem escala validada.");
    if (method.id === "shadow") parts.push(`Observação: ${q("direction").value}`);
    method.fields.forEach(([label], index) => {
      const answer = q(`answer-${index}`).value.trim();
      if (answer) parts.push(`${label}:\n${answer}`);
    });
    const domains = (method.domains || []).flatMap((label, index) => {
      const value = q(`domain-${index}`).value;
      return value ? [`${label}: ${value}`] : [];
    });
    if (domains.length) parts.push(`Avaliação por domínio:\n${domains.join("\n")}`);
    return parts.join("\n\n");
  }

  q("categories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (button && !saving) renderCatalog(button.dataset.category);
  });
  q("form").addEventListener("input", (event) => {
    if (savedRecord || saving) return;
    dirty = true;
    if (event.target !== q("description")) q("review").classList.add("is-hidden");
  });
  q("form").addEventListener("change", (event) => {
    if (savedRecord || saving) return;
    dirty = true;
    if (event.target !== q("description")) q("review").classList.add("is-hidden");
  });
  q("form").querySelectorAll("[data-practice-year]").forEach((button) => {
    button.addEventListener("click", () => {
      year = year === button.dataset.practiceYear ? "" : button.dataset.practiceYear;
      q("resident-name").value = "";
      dirty = true;
      q("review").classList.add("is-hidden");
      q("form").querySelectorAll("[data-practice-year]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.practiceYear === year);
        item.setAttribute("aria-pressed", String(item.dataset.practiceYear === year));
      });
      refreshResidents();
    });
  });
  q("resident").addEventListener("change", () => syncResidentSelect(q("resident"), q("resident-name"), q("other")));
  q("other").addEventListener("input", () => syncResidentSelect(q("resident"), q("resident-name"), q("other")));
  q("review-button").addEventListener("click", () => {
    q("description").value = buildDescription();
    q("review").classList.remove("is-hidden");
    q("description").focus();
  });
  q("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!method || saving || savedRecord || q("review").classList.contains("is-hidden")) return;
    if (!state.preceptorEmail || !state.preceptorUnit) {
      setMessage(q("message"), "Identifique-se antes de salvar a atividade.", "error");
      return;
    }
    const payload = {
      action: "create", preceptorName: state.preceptorName, preceptorEmail: state.preceptorEmail,
      preceptorUnit: state.preceptorUnit, activityDate: q("date").value || todayInputValue(),
      residentYear: year, residentName: q("resident-name").value,
      activity: q("activity").value, description: q("description").value.trim(),
      epa: [...q("epas").querySelectorAll("input:checked")].map((input) => input.value).join("; "),
    };
    saving = true;
    els.changePreceptor.disabled = true;
    q("fields").disabled = true;
    setMessage(q("message"), "Salvando no Diário...");
    try {
      await apiPost(payload);
      savedRecord = { ...payload, timestamp: `${payload.activityDate}T12:00:00`, unit: payload.preceptorUnit };
      dirty = false;
      rememberResidentNames([payload.residentName]);
      q("saved").classList.remove("is-hidden");
      setMessage(q("message"), "Atividade salva no Diário. Você já pode copiar o registro para o residente.", "success");
      await loadHistory();
    } catch (error) {
      setMessage(q("message"), `${error.message} As anotações foram mantidas. Se a conexão caiu, confira o Histórico antes de tentar salvar novamente.`, "error");
    } finally {
      saving = false;
      els.changePreceptor.disabled = false;
      q("fields").disabled = Boolean(savedRecord);
    }
  });
  q("copy").addEventListener("click", async () => {
    if (!savedRecord) return;
    try {
      await copyTextToClipboard(buildFeedbackText(savedRecord));
      setMessage(q("message"), "Registro copiado. Cole na conversa com o residente.", "success");
    } catch (error) {
      setMessage(q("message"), error.message, "error");
    }
  });
  q("history").addEventListener("click", () => {
    els.clearHistoryFilters.click();
    state.historyFilters.resident = savedRecord.residentName;
    setSelectValue(els.historyResidentFilter, savedRecord.residentName);
    renderHistory();
    showView("history");
  });
  q("new").addEventListener("click", () => openMethod(method, true));
  document.addEventListener("practice:refresh", refreshResidents);
  document.addEventListener("practice:reset", () => {
    method = null;
    savedRecord = null;
    dirty = false;
    q("form").reset();
    q("form").classList.add("is-hidden");
    renderCatalog("discuss");
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty || saving) { event.preventDefault(); event.returnValue = ""; }
  });
  renderCatalog("discuss");
})();
