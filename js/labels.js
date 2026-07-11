/*
  labels.js
  ---------
  Everything about labels: creating, editing, deleting, rendering the
  label pills, and tracking which label (if any) is currently filtering
  the task list. tasks.js reads getCurrentFilter() when it renders.
*/

const labelInput = document.getElementById("labelInput");
const labelColor = document.getElementById("labelColor");
const addLabelBtn = document.getElementById("addLabelBtn");
const labelList = document.getElementById("labelList");
const labelSelect = document.getElementById("labelSelect"); // "assign label" dropdown on the add-task row

// Which label id is currently selected to filter the task list. null = show all.
let currentFilter = null;

function getCurrentFilter() {
  return currentFilter;
}

function setCurrentFilter(labelId) {
  currentFilter = labelId;
}

// ---- Render ----
function renderLabels() {
  const labels = getLabels();
  labelList.innerHTML = "";

  // "All" pill clears the filter
  const allPill = document.createElement("div");
  allPill.className = "label-pill" + (currentFilter === null ? " active" : "");
  allPill.style.background = "#777";
  allPill.textContent = "All";
  allPill.addEventListener("click", () => {
    currentFilter = null;
    renderLabels();
    render(); // from tasks.js
  });
  labelList.appendChild(allPill);

  labels.forEach(label => {
    const pill = document.createElement("div");
    pill.className = "label-pill" + (currentFilter === label.id ? " active" : "");
    pill.style.background = label.color;
    pill.dataset.id = label.id;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = label.name;
    nameSpan.addEventListener("click", () => {
      currentFilter = (currentFilter === label.id) ? null : label.id;
      renderLabels();
      render(); // from tasks.js
    });

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.title = "Edit label";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startLabelEdit(pill, label);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn";
    delBtn.title = "Delete label";
    delBtn.textContent = "🗑️";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteLabel(label.id);
    });

    pill.appendChild(nameSpan);
    pill.appendChild(editBtn);
    pill.appendChild(delBtn);
    labelList.appendChild(pill);
  });

  // Keep the "assign label" dropdown on the add-task row in sync
  const previousValue = labelSelect.value;
  labelSelect.innerHTML = '<option value="">No label</option>' +
    labels.map(l => `<option value="${l.id}">${escapeHtml(l.name)}</option>`).join("");
  if (labels.some(l => l.id === previousValue)) {
    labelSelect.value = previousValue;
  }
}

// ---- Add ----
function addLabel() {
  const name = labelInput.value.trim();
  if (!name) return;

  const labels = getLabels();
  labels.push({
    id: "lbl_" + Date.now().toString(),
    name: name,
    color: labelColor.value
  });

  saveLabels(labels);
  labelInput.value = "";
  renderLabels();
}

addLabelBtn.addEventListener("click", addLabel);
labelInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addLabel();
});

// ---- Edit ----
function startLabelEdit(pillEl, label) {
  pillEl.classList.add("editing");
  pillEl.innerHTML = `
    <input type="text" class="edit-label-name" value="${escapeHtml(label.name)}" maxlength="30">
    <input type="color" class="edit-label-color" value="${label.color}">
    <button class="icon-btn save-label-btn" title="Save">✅</button>
    <button class="icon-btn cancel-label-btn" title="Cancel">✖️</button>
  `;

  const nameField = pillEl.querySelector(".edit-label-name");
  const colorField = pillEl.querySelector(".edit-label-color");
  nameField.focus();

  function saveLabelEdit() {
    const newName = nameField.value.trim();
    if (newName) {
      const labels = getLabels();
      const target = labels.find(l => l.id === label.id);
      target.name = newName;
      target.color = colorField.value;
      saveLabels(labels);
    }
    renderLabels();
    render(); // from tasks.js - badges may need to reflect the new name/color
  }

  pillEl.querySelector(".save-label-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    saveLabelEdit();
  });
  pillEl.querySelector(".cancel-label-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    renderLabels();
  });
  nameField.addEventListener("keydown", e => {
    if (e.key === "Enter") saveLabelEdit();
    if (e.key === "Escape") renderLabels();
  });
}

// ---- Delete ----
function deleteLabel(id) {
  let labels = getLabels();
  labels = labels.filter(l => l.id !== id);
  saveLabels(labels);

  // Unassign this label from any tasks that had it
  const tasks = getTasks();
  tasks.forEach(t => {
    if (t.labelId === id) t.labelId = null;
  });
  saveTasks(tasks);

  if (currentFilter === id) currentFilter = null;

  renderLabels();
  render(); // from tasks.js
}
