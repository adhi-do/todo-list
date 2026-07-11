/*
  export-import.js
  ----------------
  Downloading tasks+labels as a .json file, and loading them back in
  from a file the user picks. Export/import always work against
  localStorage (your normal, persistent list) regardless of incognito
  mode, so behavior stays predictable.
*/

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// ---- Export ----
function exportTasks() {
  const data = {
    tasks: JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"),
    labels: JSON.parse(localStorage.getItem(LABELS_KEY) || "[]")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "tasks-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", exportTasks);

// ---- Import ----
importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      // Support both the new format ({tasks, labels}) and a plain task array
      const rawTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
      const rawLabels = Array.isArray(parsed) ? [] : (parsed.labels || []);

      if (!Array.isArray(rawTasks)) {
        throw new Error("File does not contain a task list");
      }

      const labels = rawLabels.map((l, i) => ({
        id: l.id ? String(l.id) : "lbl_" + Date.now().toString() + i,
        name: String(l.name || "Label").trim(),
        color: /^#[0-9a-fA-F]{6}$/.test(l.color) ? l.color : "#4CAF50"
      }));

      const validLabelIds = new Set(labels.map(l => l.id));

      const tasks = rawTasks.map((item, i) => ({
        id: item.id ? String(item.id) : Date.now().toString() + i,
        text: String(item.text || "").trim(),
        done: Boolean(item.done),
        labelId: (item.labelId && validLabelIds.has(item.labelId)) ? item.labelId : null
      })).filter(t => t.text !== "");

      // Imported data always goes into localStorage (your normal list)
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      localStorage.setItem(LABELS_KEY, JSON.stringify(labels));

      if (isIncognitoOn()) {
        alert("Imported into your normal list. Turn off Incognito to view it.");
      } else {
        setCurrentFilter(null);
        renderLabels();
        render();
        alert("Tasks imported successfully!");
      }
    } catch (err) {
      alert("Could not import file: " + err.message);
    } finally {
      importFile.value = ""; // reset so the same file can be re-selected later
    }
  };
  reader.readAsText(file);
});
