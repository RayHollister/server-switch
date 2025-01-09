// popup.js
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    let url = new URL(tabs[0].url);
    let match = getSiteAndEnv(url.hostname);

    // If the site isn't in siteData, do nothing.
    if (!match) {
      document.getElementById("env-buttons").textContent = "No mapping found!";
      return;
    }

    // Create a button for each environment in the siteData entry.
    let envKeys = Object.keys(siteData[match.siteName]);
    let container = document.getElementById("env-buttons");
    envKeys.forEach(envName => {
      let btn = document.createElement("button");
      btn.textContent = envName;
      btn.addEventListener("click", () => switchToEnvironment(envName, tabs[0].id, url));
      container.appendChild(btn);
    });
  });
});

function switchToEnvironment(envName, tabId, currentUrl) {
  // Find which site/env we’re on.
  let match = getSiteAndEnv(currentUrl.hostname);
  if (!match) return;

  // Grab the new host from siteData.
  let newHost = siteData[match.siteName][envName];
  if (!newHost) return;

  // Keep path, query, etc.
  currentUrl.hostname = newHost;

  chrome.tabs.update(tabId, { url: currentUrl.href });
}
