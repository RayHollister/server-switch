// popup.js
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

document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = new URL(tabs[0].url);

  // Load data from storage or defaults
  const data = await loadSiteDataFromStorage();
  const match = getSiteAndEnv(currentUrl.hostname, data);

  const headerEl = document.getElementById("header");
  const envListEl = document.getElementById("env-list");

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

  headerEl.textContent = `Switch ${match.siteName} Server`;

  const envMap = data[match.siteName]; 
  // Convert the envMap to an array of {envName, domain, order}
  const envArray = Object.entries(envMap).map(([envName, obj]) => ({
    envName,
    domain: obj.domain,
    order: obj.order
  }));

  // Sort by order ascending
  envArray.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Create list items
  envArray.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.envName;
    li.addEventListener("click", () =>
      switchToEnvironment(item.envName, envMap, tabs[0].id, currentUrl)
    );
    envListEl.appendChild(li);
  });
});

function switchToEnvironment(envName, envMap, tabId, currentUrl) {
  const envObj = envMap[envName];
  if (!envObj) return;

  currentUrl.hostname = envObj.domain;
  chrome.tabs.update(tabId, { url: currentUrl.href });
}

function getSiteAndEnv(domain, data) {
  for (const [siteName, envMap] of Object.entries(data)) {
    for (const [envName, envObj] of Object.entries(envMap)) {
      if (envObj.domain === domain) {
        return { siteName, envName };
      }
    }
  }
  return null;
}

async function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      const storedData = items.serverSwitchData;
      if (Object.keys(storedData).length === 0) {
        // If empty, set defaults
        chrome.storage.sync.set({ serverSwitchData: defaultSiteData }, () => {
          resolve(defaultSiteData);
        });
      } else {
        resolve(storedData);
      }
    });
  });
}
