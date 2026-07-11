/*
  storage.js
  ----------
  The ONLY file that talks directly to localStorage/sessionStorage.
  Every other file asks storage.js for data instead of touching
  localStorage/sessionStorage itself - that way, if you ever want to
  change HOW data is stored (e.g. add a server, use IndexedDB, etc.)
  this is the only file you'd need to edit.
*/

// ---- Keys used inside localStorage / sessionStorage ----
const TASKS_KEY = "todo_tasks";
const LABELS_KEY = "todo_labels";
const THEME_KEY = "todo_theme";

// ---- Incognito state ----
// When true, tasks/labels are read from & written to sessionStorage
// instead of localStorage. Intentionally NOT saved anywhere, so it
// always starts OFF again on page reload - that's what makes it "incognito".
let isIncognito = false;

function setIncognito(value) {
  isIncognito = value;
}

function isIncognitoOn() {
  return isIncognito;
}

// Returns whichever storage should currently be used.
function getStorage() {
  return isIncognito ? sessionStorage : localStorage;
}

// ---- Tasks ----
function getTasks() {
  const data = getStorage().getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTasks(tasks) {
  getStorage().setItem(TASKS_KEY, JSON.stringify(tasks));
}

// ---- Labels ----
function getLabels() {
  const data = getStorage().getItem(LABELS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLabels(labels) {
  getStorage().setItem(LABELS_KEY, JSON.stringify(labels));
}

// ---- Shared helper ----
// Escapes text before inserting it into innerHTML, so a task/label named
// something like "<script>" is displayed as plain text instead of running.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
