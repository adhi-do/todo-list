/*
  tasks.js
  --------
  Everything about tasks: adding, editing, deleting, toggling complete,
  and rendering the list (respecting whatever label filter is currently
  active in labels.js).
*/

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// ---- Render ----
function render() {
  const tasks = getTasks();
  const labels = getLabels();
  const filter = getCurrentFilter(); // from labels.js

  const visibleTasks = filter
    ? tasks.filter(t => t.labelId === filter)
    : tasks;

  taskList.innerHTML = "";

  if (visibleTasks.length === 0) {
    taskList.innerHTML = '<li class="empty-msg">No tasks to show.</li>';
    return;
  }

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const label = labels.find(l => l.id === task.labelId);
    const badgeHtml = label
      ? `<span class="label-badge" style="background:${label.color}">${escapeHtml(label.name)}</span>`
      : "";

    li.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} title="Mark complete">
      <span class="text">${escapeHtml(task.text)}</span>
      ${badgeHtml}
      <button class="icon-btn edit-btn" title="Edit">✏️</button>
      <button class="icon-btn delete-btn" title="Delete">🗑️</button>
    `;

    taskList.appendChild(li);
  });
}

// ---- Add ----
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = getTasks();
  tasks.push({
    id: Date.now().toString(),
    text: text,
    done: false,
    labelId: labelSelect.value || null // labelSelect comes from labels.js
  });

  saveTasks(tasks);
  taskInput.value = "";
  labelSelect.value = "";
  render();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// ---- Toggle complete / delete / edit ----
taskList.addEventListener("click", e => {
  const li = e.target.closest("li.task");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.type === "checkbox") {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    task.done = e.target.checked;
    saveTasks(tasks);
    render();
  }

  if (e.target.classList.contains("delete-btn")) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    render();
  }

  if (e.target.classList.contains("edit-btn")) {
    startEdit(li, id);
  }
});

// ---- Edit mode ----
function startEdit(li, id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  const labels = getLabels();

  const optionsHtml = '<option value="">No label</option>' +
    labels.map(l => `<option value="${l.id}" ${l.id === task.labelId ? "selected" : ""}>${escapeHtml(l.name)}</option>`).join("");

  li.innerHTML = `
    <input type="text" class="edit-input" value="${escapeHtml(task.text)}" maxlength="200">
    <select class="edit-label-select">${optionsHtml}</select>
    <button class="icon-btn save-btn" title="Save">✅</button>
    <button class="icon-btn cancel-btn" title="Cancel">✖️</button>
  `;

  const editInput = li.querySelector(".edit-input");
  const editLabelSelect = li.querySelector(".edit-label-select");
  editInput.focus();

  function saveEdit() {
    const newText = editInput.value.trim();
    if (newText) {
      task.text = newText;
      task.labelId = editLabelSelect.value || null;
      saveTasks(tasks);
    }
    render();
  }

  li.querySelector(".save-btn").addEventListener("click", saveEdit);
  li.querySelector(".cancel-btn").addEventListener("click", render);
  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") render();
  });
}
