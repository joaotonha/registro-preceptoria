const CONFIG = {
  SPREADSHEET_ID: "COLE_AQUI_O_ID_DA_SUA_PLANILHA",
  REGISTRO_SHEET_NAME: "Registo do Preceptor",
  PROGRAMACAO_SHEET_NAME: "Programação de Atividades",
  BASE_SHEET_NAME: "Base de Dados das Atividades",
  TIMEZONE: "America/Sao_Paulo",
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

const REGISTRO_FIELDS = {
  id: ["id registo", "id registro", "id"],
  timestamp: ["data e hora", "data/hora", "timestamp", "carimbo de data/hora", "data e hora automatica", "data e hora automática"],
  preceptorName: ["nome do preceptor", "preceptor"],
  preceptorEmail: ["e-mail do preceptor", "email do preceptor", "e-mail", "email"],
  residentYear: ["ano do residente", "ano residente"],
  residentName: ["nome do residente", "residente", "nome do residente avaliado", "residente avaliado"],
  activity: ["atividade", "atividade realizada", "atividade de preceptoria"],
  description: ["registo descritivo", "registro descritivo", "descricao", "descrição"],
  epa: ["qual epa isso se relaciona?", "qual epa isso se relaciona", "epa", "epa correspondente"],
};

const PROGRAMACAO_HEADERS = [
  "ID Programação",
  "Criado em",
  "Atualizado em",
  "Nome do Preceptor",
  "E-mail do Preceptor",
  "Data Prevista",
  "Horário",
  "Ano do Residente",
  "Nome do Residente",
  "Atividade Programada",
  "EPA Relacionada",
  "Observações",
  "Status",
];

const PROGRAMACAO_FIELDS = {
  id: ["id programação", "id programacao", "id"],
  createdAt: ["criado em", "data de criação", "data de criacao"],
  updatedAt: ["atualizado em", "data de atualização", "data de atualizacao"],
  preceptorName: ["nome do preceptor", "preceptor"],
  preceptorEmail: ["e-mail do preceptor", "email do preceptor", "e-mail", "email"],
  plannedDate: ["data prevista", "data programada", "data"],
  plannedTime: ["horário", "horario", "hora"],
  residentYear: ["ano do residente", "ano residente"],
  residentName: ["nome do residente", "residente"],
  activity: ["atividade programada", "atividade", "atividade realizada"],
  epa: ["epa relacionada", "qual epa isso se relaciona?", "qual epa isso se relaciona", "epa"],
  notes: ["observações", "observacoes", "notas"],
  status: ["status", "situação", "situacao"],
};

const BASE_FIELDS = {
  activity: ["atividade", "atividade realizada", "atividade programada", "atividade de preceptoria"],
  epa: ["qual epa isso se relaciona?", "qual epa isso se relaciona", "epa relacionada", "epa", "epa correspondente"],
};

function doGet(e) {
  try {
    const action = String(e.parameter.action || "history").toLowerCase();

    if (action === "history") {
      const preceptorEmail = normalizeEmail_(e.parameter.preceptorEmail);
      validateEmail_(preceptorEmail);
      return json_({ ok: true, records: getHistory_(preceptorEmail) });
    }

    if (action === "schedule") {
      const preceptorEmail = normalizeEmail_(e.parameter.preceptorEmail);
      validateEmail_(preceptorEmail);
      return json_({ ok: true, items: getSchedule_(preceptorEmail) });
    }

    if (action === "options") {
      return json_({ ok: true, ...getOptions_() });
    }

    return json_({ ok: false, error: "Ação inválida." });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const payload = parseBody_(e);
    const action = String(payload.action || "create").toLowerCase();
    const preceptorEmail = normalizeEmail_(payload.preceptorEmail);
    validateEmail_(preceptorEmail);

    if (action === "delete") {
      deleteRecord_(required_(payload.recordId, "Informe o ID do registro."), preceptorEmail);
      return json_({ ok: true });
    }

    if (action === "deleteschedule") {
      deleteSchedule_(required_(payload.scheduleId, "Informe o ID da programação."), preceptorEmail);
      return json_({ ok: true });
    }

    const preceptorName = normalizeName_(payload.preceptorName);
    validateName_(preceptorName, "Informe o nome do preceptor.");

    if (action === "update") {
      const record = buildRecordPayload_(payload, preceptorName, preceptorEmail, false);
      record.id = required_(payload.recordId, "Informe o ID do registro.");
      updateRecord_(record);
      return json_({ ok: true, record });
    }

    if (action === "create") {
      const record = buildRecordPayload_(payload, preceptorName, preceptorEmail, true);
      appendRecord_(record);
      return json_({ ok: true, record });
    }

    if (action === "updateschedule") {
      const item = buildSchedulePayload_(payload, preceptorName, preceptorEmail, false);
      item.id = required_(payload.scheduleId, "Informe o ID da programação.");
      updateSchedule_(item);
      return json_({ ok: true, item });
    }

    if (action === "createschedule") {
      const item = buildSchedulePayload_(payload, preceptorName, preceptorEmail, true);
      appendSchedule_(item);
      return json_({ ok: true, item });
    }

    throw new Error("Ação inválida.");
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function buildRecordPayload_(payload, preceptorName, preceptorEmail, withId) {
  return {
    id: withId ? Utilities.getUuid() : "",
    timestamp: new Date(),
    preceptorName,
    preceptorEmail,
    residentYear: optional_(payload.residentYear),
    residentName: optional_(payload.residentName),
    activity: optional_(payload.activity),
    description: optional_(payload.description),
    epa: optional_(payload.epa),
  };
}

function buildSchedulePayload_(payload, preceptorName, preceptorEmail, withId) {
  const now = new Date();
  return {
    id: withId ? Utilities.getUuid() : "",
    createdAt: now,
    updatedAt: now,
    preceptorName,
    preceptorEmail,
    plannedDate: optional_(payload.plannedDate),
    plannedTime: optional_(payload.plannedTime),
    residentYear: optional_(payload.residentYear),
    residentName: optional_(payload.residentName),
    activity: optional_(payload.activity),
    epa: optional_(payload.epa),
    notes: optional_(payload.notes),
    status: optional_(payload.status) || "Programada",
  };
}

function appendRecord_(record) {
  const sheet = getSheet_(CONFIG.REGISTRO_SHEET_NAME);
  const headers = getHeaders_(sheet);
  const map = buildHeaderMap_(headers, REGISTRO_FIELDS);
  const row = new Array(headers.length).fill("");

  row[map.id] = record.id;
  row[map.timestamp] = record.timestamp;
  row[map.preceptorName] = record.preceptorName;
  row[map.preceptorEmail] = record.preceptorEmail;
  row[map.residentYear] = record.residentYear;
  row[map.residentName] = record.residentName;
  row[map.activity] = record.activity;
  row[map.description] = record.description;
  row[map.epa] = record.epa;

  sheet.appendRow(row);
}

function updateRecord_(record) {
  const location = findRecordLocation_(record.id, record.preceptorEmail);
  const map = location.map;
  const rowNumber = location.rowNumber;
  const sheet = location.sheet;
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

  row[map.preceptorName] = record.preceptorName;
  row[map.preceptorEmail] = record.preceptorEmail;
  row[map.residentYear] = record.residentYear;
  row[map.residentName] = record.residentName;
  row[map.activity] = record.activity;
  row[map.description] = record.description;
  row[map.epa] = record.epa;

  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}

function deleteRecord_(recordId, preceptorEmail) {
  const location = findRecordLocation_(recordId, preceptorEmail);
  location.sheet.deleteRow(location.rowNumber);
}

function findRecordLocation_(recordId, preceptorEmail) {
  const sheet = getSheet_(CONFIG.REGISTRO_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error("Registro não encontrado.");

  const headers = values[0];
  const map = buildHeaderMap_(headers, REGISTRO_FIELDS);
  const normalizedId = String(recordId || "").trim();
  const normalizedEmail = normalizeEmail_(preceptorEmail);

  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    const rowId = String(row[map.id] || "").trim();
    const rowEmail = normalizeEmail_(row[map.preceptorEmail]);

    if (rowId === normalizedId && rowEmail === normalizedEmail) {
      return { sheet, map, rowNumber: index + 1 };
    }
  }

  throw new Error("Registro não encontrado para este preceptor.");
}

function getHistory_(preceptorEmail) {
  const sheet = getSheet_(CONFIG.REGISTRO_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const map = buildHeaderMap_(headers, REGISTRO_FIELDS);

  return values
    .slice(1)
    .filter((row) => normalizeEmail_(row[map.preceptorEmail]) === preceptorEmail)
    .map((row) => ({
      id: String(row[map.id] || ""),
      timestamp: toIso_(row[map.timestamp]),
      preceptorName: normalizeName_(row[map.preceptorName]),
      preceptorEmail: normalizeEmail_(row[map.preceptorEmail]),
      residentYear: String(row[map.residentYear] || ""),
      residentName: String(row[map.residentName] || ""),
      activity: String(row[map.activity] || ""),
      description: String(row[map.description] || ""),
      epa: String(row[map.epa] || ""),
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function appendSchedule_(item) {
  const sheet = getScheduleSheet_();
  const headers = getHeaders_(sheet);
  const map = buildHeaderMap_(headers, PROGRAMACAO_FIELDS);
  const row = new Array(headers.length).fill("");

  row[map.id] = item.id;
  row[map.createdAt] = item.createdAt;
  row[map.updatedAt] = item.updatedAt;
  row[map.preceptorName] = item.preceptorName;
  row[map.preceptorEmail] = item.preceptorEmail;
  row[map.plannedDate] = item.plannedDate;
  row[map.plannedTime] = item.plannedTime;
  row[map.residentYear] = item.residentYear;
  row[map.residentName] = item.residentName;
  row[map.activity] = item.activity;
  row[map.epa] = item.epa;
  row[map.notes] = item.notes;
  row[map.status] = item.status;

  sheet.appendRow(row);
}

function updateSchedule_(item) {
  const location = findScheduleLocation_(item.id, item.preceptorEmail);
  const map = location.map;
  const rowNumber = location.rowNumber;
  const sheet = location.sheet;
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

  row[map.updatedAt] = new Date();
  row[map.preceptorName] = item.preceptorName;
  row[map.preceptorEmail] = item.preceptorEmail;
  row[map.plannedDate] = item.plannedDate;
  row[map.plannedTime] = item.plannedTime;
  row[map.residentYear] = item.residentYear;
  row[map.residentName] = item.residentName;
  row[map.activity] = item.activity;
  row[map.epa] = item.epa;
  row[map.notes] = item.notes;
  row[map.status] = item.status;

  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}

function deleteSchedule_(scheduleId, preceptorEmail) {
  const location = findScheduleLocation_(scheduleId, preceptorEmail);
  location.sheet.deleteRow(location.rowNumber);
}

function findScheduleLocation_(scheduleId, preceptorEmail) {
  const sheet = getScheduleSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error("Programação não encontrada.");

  const headers = values[0];
  const map = buildHeaderMap_(headers, PROGRAMACAO_FIELDS);
  const normalizedId = String(scheduleId || "").trim();
  const normalizedEmail = normalizeEmail_(preceptorEmail);

  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    const rowId = String(row[map.id] || "").trim();
    const rowEmail = normalizeEmail_(row[map.preceptorEmail]);

    if (rowId === normalizedId && rowEmail === normalizedEmail) {
      return { sheet, map, rowNumber: index + 1 };
    }
  }

  throw new Error("Programação não encontrada para este preceptor.");
}

function getSchedule_(preceptorEmail) {
  const sheet = getScheduleSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const map = buildHeaderMap_(headers, PROGRAMACAO_FIELDS);

  return values
    .slice(1)
    .filter((row) => normalizeEmail_(row[map.preceptorEmail]) === preceptorEmail)
    .map((row) => ({
      id: String(row[map.id] || ""),
      createdAt: toIso_(row[map.createdAt]),
      updatedAt: toIso_(row[map.updatedAt]),
      preceptorName: normalizeName_(row[map.preceptorName]),
      preceptorEmail: normalizeEmail_(row[map.preceptorEmail]),
      plannedDate: toDateInputValue_(row[map.plannedDate]),
      plannedTime: String(row[map.plannedTime] || ""),
      residentYear: String(row[map.residentYear] || ""),
      residentName: String(row[map.residentName] || ""),
      activity: String(row[map.activity] || ""),
      epa: String(row[map.epa] || ""),
      notes: String(row[map.notes] || ""),
      status: String(row[map.status] || ""),
    }))
    .sort((a, b) => `${a.plannedDate || "9999-12-31"} ${a.plannedTime || "23:59"}`.localeCompare(`${b.plannedDate || "9999-12-31"} ${b.plannedTime || "23:59"}`));
}

function getOptions_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CONFIG.BASE_SHEET_NAME);
  if (!sheet) return { activities: DEFAULT_ACTIVITY_OPTIONS, epas: DEFAULT_EPA_OPTIONS };

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { activities: DEFAULT_ACTIVITY_OPTIONS, epas: DEFAULT_EPA_OPTIONS };

  const headers = values[0];
  const map = buildOptionalHeaderMap_(headers, BASE_FIELDS);
  const activities = [];
  const epas = [];
  const activityEpaLinks = [];

  values.slice(1).forEach((row) => {
    const activity = map.activity !== undefined ? String(row[map.activity] || "").trim() : "";
    const epa = map.epa !== undefined ? String(row[map.epa] || "").trim() : "";

    if (activity) activities.push(activity);
    if (epa) epas.push(epa);
    if (activity && epa) activityEpaLinks.push({ activity, epa });
  });

  return {
    activities: activities.length ? unique_(activities) : DEFAULT_ACTIVITY_OPTIONS,
    epas: unique_([...DEFAULT_EPA_OPTIONS, ...epas]),
    activityEpaLinks: uniqueLinks_(activityEpaLinks),
  };
}

function getSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error(`A aba "${sheetName}" não foi encontrada.`);
  return sheet;
}

function getScheduleSheet_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.PROGRAMACAO_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.PROGRAMACAO_SHEET_NAME);
    sheet.getRange(1, 1, 1, PROGRAMACAO_HEADERS.length).setValues([PROGRAMACAO_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) throw new Error(`A aba "${sheet.getName()}" não possui cabeçalhos.`);
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function buildHeaderMap_(headers, fields) {
  const map = buildOptionalHeaderMap_(headers, fields);
  Object.keys(fields).forEach((key) => {
    if (map[key] === undefined) {
      throw new Error(`Cabeçalho obrigatório não encontrado: ${fields[key][0]}.`);
    }
  });
  return map;
}

function buildOptionalHeaderMap_(headers, fields) {
  const normalizedHeaders = headers.map((header) => normalizeHeader_(header));
  const map = {};

  Object.entries(fields).forEach(([field, aliases]) => {
    const aliasSet = aliases.map(normalizeHeader_);
    const index = normalizedHeaders.findIndex((header) => aliasSet.includes(header));
    if (index !== -1) map[field] = index;
  });

  return map;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    const params = {};
    e.postData.contents.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
    return params;
  }
}

function required_(value, message) {
  const text = String(value || "").trim();
  if (!text) throw new Error(message);
  return text;
}

function optional_(value) {
  return String(value || "").trim();
}

function validateName_(value, message) {
  if (!value) throw new Error(message);
}

function validateEmail_(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("E-mail inválido.");
  }
}

function normalizeName_(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeHeader_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique_(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function uniqueLinks_(links) {
  const seen = new Set();
  return links.filter((link) => {
    const key = `${link.activity}||${link.epa}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toIso_(value) {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString();
  return value || "";
}

function toDateInputValue_(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return Utilities.formatDate(value, CONFIG.TIMEZONE, "yyyy-MM-dd");
  }
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd");
  }
  return text;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
