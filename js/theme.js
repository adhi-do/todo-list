/*
  theme.js
  --------
  Handles the dark/light mode toggle button and remembers the choice
  in localStorage (theme is a display preference, so it always uses
  localStorage directly - even in incognito mode, it stays consistent).
*/

const themeBtn = document.getElementById("themeBtn");

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
  } else {
    themeBtn.textContent = "🌙";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

themeBtn.addEventListener("click", toggleTheme);
