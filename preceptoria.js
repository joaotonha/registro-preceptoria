/* Calgary: apêndice de Dohms et al. (2021), CC BY 4.0; demais versões identificadas abaixo. */
const CALGARY_SECTIONS = [
  ["Iniciando a consulta", [
    "Cumprimenta o paciente.", "Apresenta-se e menciona a sua função.", "Demonstra respeito.",
    "Confirma os motivos de consulta.", "Negocia a agenda (motivos de consulta).",
  ]],
  ["Obtendo informações: exploração dos problemas", [
    "Encoraja o paciente a contar sua história.", "Muda apropriadamente de questões abertas para fechadas.",
    "Escuta atentamente.", "Facilita respostas verbais e não verbais do paciente.",
    "Utiliza perguntas e comentários facilmente compreensíveis.", "Esclarece as declarações do paciente.",
    "Define cronologia dos problemas.",
  ]],
  ["Compreendendo a perspectiva do paciente", [
    "Determina e reconhece as ideias do paciente sobre a causa do problema.",
    "Explora as preocupações do paciente sobre o problema.", "Estimula que o paciente verbalize como se sente.",
    "Percebe e responde às pistas verbais e não-verbais.",
  ]],
  ["Estruturando a consulta", [
    "Resume ao final de uma linha específica de investigação.",
    "Progride usando frases de transição entre os tópicos.", "Estrutura uma sequência lógica.",
    "Usa o tempo de maneira eficiente.",
  ]],
  ["Construindo a relação", [
    "Demonstra comportamento não verbal apropriado.", "Se lê ou escreve, isto não interfere com o diálogo/comunicação.",
    "Não demonstra preconceito ou julgamento.", "Demonstra empatia e apoio ao paciente.", "Demonstra confiança.",
  ]],
  ["Encerrando a consulta", [
    "Encoraja o paciente a discutir mais algum ponto adicional.", "Encerra a consulta com um breve resumo.",
    "Pactua com o paciente os próximos passos.",
  ]],
];

const DOPS_SECTIONS = [
  ["Indicação e preparo", [
    "Relaciona a necessidade do procedimento ao caso e discute suas limitações.",
    "Verifica condições clínicas que possam modificar ou impedir a realização.",
    "Organiza os recursos necessários e confirma que estão disponíveis para uso.",
  ]],
  ["Consentimento e comunicação", [
    "Conversa sobre benefícios, possíveis danos e outras opções antes de iniciar.",
    "Confirma a concordância da pessoa após esclarecer suas dúvidas.",
    "Mantém a pessoa informada sobre o andamento e acolhe suas manifestações.",
  ]],
  ["Segurança e assepsia", [
    "Realiza as verificações de pessoa, procedimento e local pertinentes ao caso.",
    "Adota as medidas de prevenção de infecção exigidas pelo procedimento.",
    "Evita exposição da pessoa e da equipe a materiais e situações de risco.",
  ]],
  ["Controle da dor", [
    "Avalia a necessidade de analgesia ou anestesia e sua adequação à pessoa.",
    "Verifica o efeito das medidas de conforto e responde à dor durante a execução.",
  ]],
  ["Execução", [
    "Realiza as manobras necessárias com controle e respeito às estruturas anatômicas.",
    "Identifica desvios do esperado e ajusta sua atuação com segurança.",
    "Solicita supervisão adicional antes de ultrapassar sua capacidade de atuação.",
  ]],
  ["Cuidados posteriores", [
    "Confere as condições da pessoa ao término e define os cuidados subsequentes.",
    "Verifica a compreensão das orientações, incluindo quando e onde buscar assistência.",
    "Documenta os achados, a execução e o plano de acompanhamento.",
  ]],
  ["Profissionalismo", [
    "Considera a dignidade, as preferências e a privacidade da pessoa durante toda a atividade.",
    "Articula sua atuação com a equipe e reconhece as próprias limitações.",
  ]],
];

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
    id: "minicex", category: "observe", name: "Mini-CEX", subtitle: "Desempenho clínico · escala de 1 a 9",
    version: "Mini-CEX / ABIM: sete domínios e escala de 1 a 9; apresentação em português para o diário",
    note: "Domínios e escala do formulário ABIM, com rótulos em português. Esta interface não constitui uma tradução validada independente. 1–3: insatisfatório; 4–6: satisfatório; 7–9: superior. A nota 4 é marginal e indica necessidade de melhoria. Não observado é distinto de um domínio ainda sem avaliação.",
    purpose: "Combine um foco, observe o atendimento e converse com o residente logo após a consulta.",
    activity: "Observação direta de Consulta Individual",
    reference: "https://www.abim.org/program-directors-administrators/assessment-tools",
    citation: "American Board of Internal Medicine. Mini-Clinical Evaluation Exercise (Mini-CEX).",
    domains: ["Entrevista clínica", "Exame físico", "Qualidades humanísticas e profissionalismo", "Julgamento clínico", "Aconselhamento", "Organização e eficiência", "Competência clínica global"],
    fields: [
      ["Contexto e foco combinado", "Que parte do atendimento será observada?"],
      ["Evidências observadas", "Descreva ações concretas que sustentam sua avaliação."],
      ["Autoavaliação do residente", "Como você avalia seu desempenho nesta consulta?"],
      ["Feedback e próximos passos", "O que manter, o que desenvolver e quando observar novamente?"],
    ],
  },
  {
    id: "calgary", category: "observe", name: "Calgary-Cambridge", subtitle: "Comunicação · versão brasileira de 28 itens",
    purpose: "Observe os comportamentos de comunicação e registre os pontos para a conversa com o residente.",
    activity: "Observação direta de Consulta Individual",
    version: "Calgary-Cambridge: versão brasileira de 28 itens, Dohms et al., Clinics 2021;76:e1706",
    reference: "https://doi.org/10.6061/clinics/2021/e1706",
    citation: "Dohms MC, Collares CF, Tiberio IC. Clinics. 2021;76:e1706. Apêndice: versão brasileira do Calgary-Cambridge Observation Guide. Baseado em Kurtz et al. (2005). Licença CC BY 4.0.",
    note: "Texto dos 28 itens e respostas preservados do apêndice fornecido; somente a apresentação digital foi reorganizada. Não (0), Sim, mas (1), Sim (2). Item sem resposta significa não avaliado. Sem cálculo automático de nota total. Comentários, contexto e feedback são campos complementares do diário.",
    sections: CALGARY_SECTIONS,
    choices: ["Não", "Sim, mas", "Sim"],
    fields: [["Contexto e foco da observação", "Que situação de comunicação será observada?"],
      ["Autoavaliação do residente", "Como o residente percebeu a conversa?"],
      ["Feedback e próximos passos", "Pontos fortes, prioridade de melhoria e próxima observação."]],
  },
  {
    id: "dops", category: "observe", name: "DOPS", subtitle: "Observar um procedimento",
    purpose: "Observe um procedimento real, registre o desempenho e combine uma oportunidade de aprimoramento.",
    activity: "Supervisão de Procedimento Ambulatorial",
    reference: "https://foundationprogramme.nhs.uk/curriculum/supervised-learning-events/sle-types/",
    citation: "UK Foundation Programme. DOPS: áreas de observação. Norcini e Burch (2007), AMEE Guide No. 31.",
    version: "DOPS: checklist formativo local PRMFC UERJ, versão 2026-10",
    note: "Checklist local com redação própria, organizado por etapas. Não reproduz integralmente o checklist do site de referência nem representa um formulário original validado. Fez, Não fez e Não se aplica descrevem apenas os itens observados nesta atividade; não certificam autonomia.",
    sections: DOPS_SECTIONS,
    choices: ["Fez", "Não fez", "Não se aplica"],
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
  const drafts = new Map();
  const categoryTitles = { discuss: "Discutir um caso", observe: "Observar uma atividade", feedback: "Dar feedback" };

  function storeDraft() {
    if (!method) return;
    drafts.set(method.id, {
      year, dirty, savedRecord,
      values: [...q("form").querySelectorAll("input, textarea, select")].filter((input) => input.id)
        .map((input) => [input.id, input.value, input.checked]),
      epas: [...q("epas").querySelectorAll("input")].map((input) => input.checked),
      details: [...q("form").querySelectorAll("details")].map((details) => details.open),
      review: !q("review").classList.contains("is-hidden"),
    });
  }

  function refreshChoices() {
    q("form").querySelectorAll("[data-choice-input]").forEach((button) => {
      const input = document.getElementById(button.dataset.choiceInput);
      button.setAttribute("aria-pressed", String(input.value === button.dataset.value));
    });
    q("form").querySelectorAll(".checklist-section").forEach((section) => {
      const inputs = [...section.querySelectorAll("input[type=hidden]")];
      section.querySelector(".checklist-count").textContent = `${inputs.filter((input) => input.value).length}/${inputs.length}`;
    });
  }

  function choiceControl(id, options, rating = false) {
    const group = document.createElement("div");
    group.className = `choice-buttons${rating ? " rating-buttons" : ""}`;
    group.setAttribute("role", "group");
    const input = document.createElement("input");
    input.type = "hidden";
    input.id = id;
    group.append(input);
    options.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.choiceInput = id;
      button.dataset.value = value;
      button.textContent = value;
      button.setAttribute("aria-pressed", "false");
      if (rating && value !== "Não observado") {
        const band = Number(value) <= 3 ? "Insatisfatório" : Number(value) <= 6 ? "Satisfatório" : "Superior";
        button.title = `${value}: ${band}${value === "4" ? " (marginal)" : ""}`;
        button.setAttribute("aria-label", button.title);
      }
      button.addEventListener("click", () => {
        input.value = input.value === value ? "" : value;
        refreshChoices();
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      group.append(button);
    });
    return group;
  }

  function renderChecklist(item) {
    let number = 0;
    item.sections.forEach(([title, tasks], sectionIndex) => {
      const section = document.createElement("details");
      section.className = "checklist-section";
      section.open = sectionIndex === 0;
      const summary = document.createElement("summary");
      const count = document.createElement("span");
      count.className = "checklist-count";
      summary.append(document.createTextNode(title), count);
      section.append(summary);
      tasks.forEach((task, taskIndex) => {
        number += 1;
        const row = document.createElement("div");
        row.className = "checklist-item";
        const label = document.createElement("p");
        label.id = `practice-task-label-${sectionIndex}-${taskIndex}`;
        label.textContent = `${number}. ${task}`;
        const control = choiceControl(`practice-task-${sectionIndex}-${taskIndex}`, item.choices);
        control.setAttribute("aria-labelledby", label.id);
        row.append(label, control);
        section.append(row);
      });
      const label = document.createElement("label");
      label.htmlFor = `practice-comment-${sectionIndex}`;
      label.textContent = "Comentários desta etapa (opcional)";
      const comments = document.createElement("textarea");
      comments.id = label.htmlFor;
      comments.rows = 2;
      section.append(label, comments);
      q("prompts").append(section);
    });
  }

  function refreshResidents() {
    if (!method || saving) return;
    renderResidentSelect({ select: q("resident"), hiddenInput: q("resident-name"), otherInput: q("other"),
      hint: q("resident-hint"), selectedYear: year, selectedValue: q("resident-name").value });
  }

  function renderCatalog(category) {
    q("category-title").textContent = categoryTitles[category];
    q("catalog").classList.toggle("is-hidden", category === "feedback");
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
    if (element.matches("input, textarea, select")) caption.htmlFor = element.id;
    else {
      caption.id = `${element.querySelector("input").id}-label`;
      element.setAttribute("aria-labelledby", caption.id);
    }
    caption.textContent = label;
    field.append(caption, element);
    q("prompts").append(field);
  }

  function openMethod(item, force = false) {
    if (saving) return;
    storeDraft();
    if (force) drafts.delete(item.id);
    const draft = drafts.get(item.id);
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
    q("reference-note").textContent = `${item.note || "Roteiro formativo adaptado para o diário."} Referência: ${item.citation}`;
    q("reference-link").href = item.reference;
    q("prompts").replaceChildren();
    q("form").querySelectorAll("details").forEach((details) => { details.open = false; });
    q("form").querySelectorAll("[data-practice-year]").forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
    if (item.id === "shadow") {
      addField("Quem observa quem?", choiceControl("practice-direction", ["Residente observa o preceptor", "Preceptor observa o residente"]));
    }
    item.fields.forEach(([label, prompt], index) => {
      const input = document.createElement("textarea");
      input.id = `practice-answer-${index}`;
      input.rows = 2;
      input.placeholder = prompt;
      addField(label, input);
      if (index === 0 && item.sections) renderChecklist(item);
    });
    if (item.domains) {
      const heading = document.createElement("h3");
      heading.textContent = "Avaliação por domínio";
      q("prompts").append(heading);
      const scale = document.createElement("p");
      scale.className = "rating-legend";
      scale.textContent = "1–3: insatisfatório · 4–6: satisfatório · 7–9: superior. Nota 4: marginal, requer melhoria.";
      q("prompts").append(scale);
      item.domains.forEach((label, index) => {
        addField(label, choiceControl(`practice-domain-${index}`, ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Não observado"], true));
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
    if (draft) {
      year = draft.year;
      dirty = draft.dirty;
      savedRecord = draft.savedRecord;
      draft.values.forEach(([id, value, checked]) => {
        const input = document.getElementById(id);
        if (input) { input.value = value; input.checked = checked; }
      });
      q("epas").querySelectorAll("input").forEach((input, index) => { input.checked = draft.epas[index]; });
      q("form").querySelectorAll("details").forEach((details, index) => { details.open = draft.details[index]; });
      q("review").classList.toggle("is-hidden", !draft.review);
      q("saved").classList.toggle("is-hidden", !savedRecord);
      q("fields").disabled = Boolean(savedRecord);
      q("form").querySelectorAll("[data-practice-year]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.practiceYear === year);
        button.setAttribute("aria-pressed", String(button.dataset.practiceYear === year));
      });
      if (savedRecord) setMessage(q("message"), "Atividade já salva no Diário.", "success");
    }
    refreshChoices();
    refreshResidents();
    renderCatalog(item.category);
    refreshSmallSelects();
    q("title").setAttribute("tabindex", "-1");
    q("title").focus({ preventScroll: true });
    q("title").scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function buildDescription() {
    const parts = [`Método: ${method.name}`, `Versão: ${method.version || "Roteiro formativo do diário"}`];
    if (method.domains) parts.push("Escala: 1–3 insatisfatório; 4–6 satisfatório (4 marginal); 7–9 superior.");
    if (method.id === "shadow" && q("direction").value) parts.push(`Observação: ${q("direction").value}`);
    (method.sections || []).forEach(([title, tasks], sectionIndex) => {
      const lines = tasks.map((task, taskIndex) => `${task} — ${q(`task-${sectionIndex}-${taskIndex}`).value || "Não avaliado"}`);
      const comment = q(`comment-${sectionIndex}`).value.trim();
      if (comment) lines.push(`Comentários: ${comment}`);
      parts.push(`${title}\n${lines.join("\n")}`);
    });
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

  document.querySelectorAll("[data-home-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.homeAction;
      if (category === "diary") {
        showView("diary");
        els.recordFormTitle.setAttribute("tabindex", "-1");
        els.recordFormTitle.focus();
        return;
      }
      if (saving) return;
      storeDraft();
      showView("practice");
      renderCatalog(category);
      q("form").classList.toggle("is-hidden", method?.category !== category);
      if (category === "feedback") openMethod(PRACTICE_METHODS.find((item) => item.id === "feedback"));
      else q("category-title").focus();
    });
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
    document.querySelector("#home-change-preceptor").disabled = true;
    q("fields").disabled = true;
    setMessage(q("message"), "Salvando no Diário...");
    try {
      await apiPost(payload);
      savedRecord = { ...payload, timestamp: `${payload.activityDate}T12:00:00`, unit: payload.preceptorUnit };
      dirty = false;
      drafts.delete(method.id);
      rememberResidentNames([payload.residentName]);
      q("saved").classList.remove("is-hidden");
      setMessage(q("message"), "Atividade salva no Diário. Você já pode copiar o registro para o residente.", "success");
      await loadHistory();
    } catch (error) {
      setMessage(q("message"), `${error.message} As anotações foram mantidas. Se a conexão caiu, confira o Histórico antes de tentar salvar novamente.`, "error");
    } finally {
      saving = false;
      els.changePreceptor.disabled = false;
      document.querySelector("#home-change-preceptor").disabled = false;
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
    drafts.clear();
    method = null;
    savedRecord = null;
    dirty = false;
    q("form").reset();
    q("form").classList.add("is-hidden");
    renderCatalog("discuss");
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty || saving || [...drafts.values()].some((draft) => draft.dirty)) { event.preventDefault(); event.returnValue = ""; }
  });
  renderCatalog("discuss");
})();
