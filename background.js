// background.js
// We’ll listen for tab updates or extension button clicks and decide if the icon should be toggled on/off.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    await updateIconForTab(tabId);
  }
});

// Also update icon when the active tab changes
chrome.tabs.onActivated.addListener(async activeInfo => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await updateIconForTab(tab.id);
});

// Optionally, update icon when the extension icon is clicked
chrome.action.onClicked.addListener(async tab => {
  await updateIconForTab(tab.id);
});

async function updateIconForTab(tabId) {
  // We need to figure out if the current tab's domain is in our environment list
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  // Quick check – if the scheme isn't http/https, skip
  const url = new URL(tab.url);
  if (!/^https?:$/.test(url.protocol)) return;

  // Load data from storage
  const data = await loadSiteData();

  // Check if there's a match
  const match = getSiteAndEnv(url, data);

  if (!match) {
    // No environment found
    await chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/toggle-off-solid_16.png",
        "48": "images/toggle-off-solid_48.png",
        "64": "images/toggle-off-solid_64.png",
        "128": "images/toggle-off-solid_128.png",
      },
    });
  } else {
    // We found an environment
    await chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/toggle-on-solid_16.png",
        "48": "images/toggle-on-solid_48.png",
        "64": "images/toggle-on-solid_64.png",
        "128": "images/toggle-on-solid_128.png",
      },
    });
  }
}

/**
 * Compare the current URL to data in storage to find a match.
 * We'll parse each environment domain string to handle possible port/scheme.
 */
function getSiteAndEnv(currentUrl, data) {
  for (const [siteName, envMap] of Object.entries(data)) {
    for (const [envName, envObj] of Object.entries(envMap)) {
      const parsed = parseEnvDomain(envObj.domain, currentUrl.protocol);
      if (!parsed) continue;

      if (
        parsed.hostname === currentUrl.hostname &&
        (parsed.port || "") === (currentUrl.port || "")
      ) {
        return { siteName, envName };
      }
    }
  }
  return null;
}

/**
 * Parse a domain string into a URL object.
 * If the string includes "://", parse it as-is.
 * Otherwise, prepend the default scheme (http: or https:).
 */
function parseEnvDomain(domainStr, defaultScheme) {
  try {
    if (domainStr.includes("://")) {
      return new URL(domainStr);
    } else {
      return new URL(`${defaultScheme}//${domainStr}`);
    }
  } catch (err) {
    console.error("Failed to parse domain:", domainStr, err);
    return null;
  }
}

async function loadSiteData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ serverSwitchData: {} }, (items) => {
      resolve(items.serverSwitchData);
    });
  });
}
