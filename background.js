// background.js
// We’ll listen for tab updates or extension button clicks and decide if the icon should be toggled on/off.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
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

  // Load your data from storage
  const data = await loadSiteData();
  const match = getSiteAndEnv(url.hostname, data);

  if (!match) {
    // No environment found
    await chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/toggle-off-solid_16.png",
        "48": "images/toggle-off-solid_48.png",
        "64": "images/toggle-off-solid_64.png",
        "128": "images/toggle-off-solid_128.png"
      }
    });
  } else {
    // We found an environment
    await chrome.action.setIcon({
      tabId: tabId,
      path: {
        "16": "images/toggle-on-solid_16.png",
        "48": "images/toggle-on-solid_48.png",
        "64": "images/toggle-on-solid_64.png",
        "128": "images/toggle-on-solid_128.png"
      }
    });
  }
}

async function loadSiteData() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      resolve(items.serverSwitchData);
    });
  });
}

// Quick helper
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
