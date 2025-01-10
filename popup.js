const defaultSiteData = {
  JaxToday: {
    LIVE: "jaxtoday.org",
    TEST: "test-jacksonville-today.pantheonsite.io",
    DEV: "dev-jacksonville-today.pantheonsite.io"
  },
  WJCT: {
    LIVE: "wjct.org",
    TEST: "test-wjct.pantheonsite.io",
    DEV: "dev-wjct.pantheonsite.io"
  },
  JaxPlays: {
    LIVE: "jaxplays.org",
    DEV: "jaxplays.local"
  },
  JaxMusic: {
    LIVE: "jaxmusic.org",
    TEST: "test-jaxmusic.pantheonsite.io",
    DEV: "dev-jaxmusic.pantheonsite.io"
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = new URL(tabs[0].url);

  // Get data from chrome.storage (or use defaults if empty)
  const data = await loadSiteDataFromStorage();

  // Attempt to find a site match
  const match = getSiteAndEnv(currentUrl.hostname, data);

  const headerEl = document.getElementById("header");
  const envListEl = document.getElementById("env-list");

  if (!match) {
    headerEl.textContent = "No multidev environments detected.";

    // Provide a link for adding a new environment
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

  // If found, show "Switch [siteName] Server"
  headerEl.textContent = `Switch ${match.siteName} Server`;

  // Create a list item for each environment in the site’s env map
  const envMap = data[match.siteName]; // { LIVE: "...", DEV: "...", etc. }

  Object.keys(envMap).forEach(envName => {
    const li = document.createElement("li");
    li.textContent = envName;
    li.addEventListener("click", () => switchToEnvironment(envName, envMap, tabs[0].id, currentUrl));
    envListEl.appendChild(li);
  });
});

function switchToEnvironment(envName, envMap, tabId, currentUrl) {
  const newHost = envMap[envName];
  if (!newHost) return;

  currentUrl.hostname = newHost;
  chrome.tabs.update(tabId, { url: currentUrl.href });
}

function getSiteAndEnv(domain, data) {
  for (const [siteName, envMap] of Object.entries(data)) {
    for (const [envName, envDomain] of Object.entries(envMap)) {
      if (envDomain === domain) {
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
        // No data in storage, so set our defaults
        chrome.storage.sync.set({ serverSwitchData: defaultSiteData }, () => {
          resolve(defaultSiteData);
        });
      } else {
        resolve(storedData);
      }
    });
  });
}
