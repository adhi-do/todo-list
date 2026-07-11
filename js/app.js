/*
  app.js
  ------
  The "glue" file. It doesn't own any data - it just wires up the
  incognito toggle (which affects storage.js's behavior) and kicks off
  the first render when the page loads. This file is loaded LAST, after
  every function it calls already exists.
*/

const incognitoBtn = document.getElementById("incognitoBtn");
const modeBanner = document.getElementById("modeBanner");

function toggleIncognito() {
  setIncognito(!isIncognitoOn()); // from storage.js
  incognitoBtn.classList.toggle("active", isIncognitoOn());
  modeBanner.classList.toggle("show", isIncognitoOn());

  setCurrentFilter(null); // from labels.js - reset filter, labels differ between storages
  renderLabels();         // from labels.js
  render();               // from tasks.js
}

incognitoBtn.addEventListener("click", toggleIncognito);

// ---- Initial load ----
loadTheme();    // from theme.js
renderLabels(); // from labels.js
render();       // from tasks.js
