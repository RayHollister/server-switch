// popup.js

/**
 * Loads environment data from storage or uses defaults if empty.
 */
async function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      const storedData = items.serverSwitchData;
      if (Object.keys(storedData).length === 0) {
        // If empty, set defaults from our global variable
        chrome.storage.sync.set({ serverSwitchData: window.defaultSiteData }, () => {
          resolve(window.defaultSiteData);
        });
      } else {
        resolve(storedData);
      }
    });
  });
}

/**
 * Parses a domain string. If it contains "://", we treat it as a full URL.
 * Otherwise, we prepend the default scheme (e.g. currentUrl.protocol) to parse it.
 * Returns a URL object, or null if invalid.
 */
function parseEnvDomain(domainStr, defaultScheme) {
  try {
    // If user included a scheme (like http:// or https://), parse as is
    if (domainStr.includes("://")) {
      return new URL(domainStr);
    } else {
      // Prepend scheme// to handle port or plain domain
      return new URL(`${defaultScheme}//${domainStr}`);
    }
  } catch (err) {
    console.error("Failed to parse domain:", domainStr, err);
    return null;
  }
}

/**
 * Attempts to find which site/env the current URL matches
 * by comparing host and port against the stored domain.
 */
function getSiteAndEnv(currentUrl, data) {
  for (const [siteName, envMap] of Object.entries(data)) {
    for (const [envName, envObj] of Object.entries(envMap)) {
      const parsed = parseEnvDomain(envObj.domain, currentUrl.protocol);
      if (!parsed) continue; // skip invalid

      // Compare host+port from the environment's domain to the current URL
      if (
        parsed.hostname === currentUrl.hostname &&
        // Ports can be empty strings. Convert them to "80" or "443" logic if needed.
        (parsed.port || "") === (currentUrl.port || "")
      ) {
        return { siteName, envName };
      }
    }
  }
  return null;
}

/**
 * Switches the current tab to the selected environment.
 * Preserves path, query, and hash from the current URL.
 */
function switchToEnvironment(envName, envMap, tabId, currentUrl) {
  const envObj = envMap[envName];
  if (!envObj) return;

  const parsed = parseEnvDomain(envObj.domain, currentUrl.protocol);
  if (!parsed) return;

  // Use the parsed base (scheme/host/port) but keep path/query/hash
  parsed.pathname = currentUrl.pathname;
  parsed.search = currentUrl.search;
  parsed.hash = currentUrl.hash;

  chrome.tabs.update(tabId, { url: parsed.href });
}

// --------------- MAIN FLOW ---------------
document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = new URL(tabs[0].url);

  // Load data from storage or defaults
  const data = await loadSiteDataFromStorage();
  const match = getSiteAndEnv(currentUrl, data);

  const headerEl = document.getElementById("header");
  const envListEl = document.getElementById("env-list");

  // If no match, show "No multidev environments detected."
  if (!match) {
    headerEl.textContent = "No multidev environments detected.";
    const li = document.createElement("li");
    li.textContent = "Add a multidev environment.";
    li.style.color = "#0073ea";
    li.style.fontWeight = "bold";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
    envListEl.appendChild(li);
    return;
  }

  // Found a match, so list the environments for the matched site
  headerEl.textContent = `Switch ${match.siteName} Server`;

  const envMap = data[match.siteName];
  const envArray = Object.entries(envMap).map(([envName, obj]) => ({
    envName,
    domain: obj.domain,
    order: obj.order
  }));

  envArray.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Create environment list items
  envArray.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.envName;
    li.addEventListener("click", () =>
      switchToEnvironment(item.envName, envMap, tabs[0].id, currentUrl)
    );
    envListEl.appendChild(li);
  });

  // Add "Edit Multidev Environment" link at the bottom
  const liEdit = document.createElement("li");
  liEdit.textContent = "Edit Multidev Environments";
  liEdit.style.color = "#0073ea";
  liEdit.style.fontWeight = "bold";
  liEdit.style.cursor = "pointer";
  liEdit.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
  envListEl.appendChild(liEdit);
});