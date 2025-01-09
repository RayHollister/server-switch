// popup.js
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = new URL(tabs[0].url);
    const match = getSiteAndEnv(url.hostname);
    const header = document.getElementById("header");
    const envList = document.getElementById("env-list");

    // If the site isn't in siteData
    if (!match) {
      header.textContent = "No mapping found";
      return;
    }

    // Grab all environments for the current site
    const envMap = siteData[match.siteName];
    const envKeys = Object.keys(envMap);

    if (envKeys.length <= 1) {
      // Only one environment => treat as no multidev
      header.textContent = "No multidev environments detected.";

      // Create a single list item to add one
      const li = document.createElement("li");
      li.textContent = "Add a multidev environment";
      li.addEventListener("click", () => {
        // Attempt to open the siteData.js file in a new tab
        chrome.tabs.create({
          url: "chrome-extension://" + chrome.runtime.id + "/siteData.js"
        });
      });
      envList.appendChild(li);
    } else {
      // Show normal environment listing
      header.textContent = `Switch ${match.siteName} Server`;

      envKeys.forEach(envName => {
        const li = document.createElement("li");
        li.textContent = envName;
        li.addEventListener("click", () => switchToEnvironment(envName, tabs[0].id, url));
        envList.appendChild(li);
      });
    }
  });
});

function switchToEnvironment(envName, tabId, currentUrl) {
  const match = getSiteAndEnv(currentUrl.hostname);
  if (!match) return;

  const newHost = siteData[match.siteName][envName];
  if (!newHost) return;

  currentUrl.hostname = newHost;
  chrome.tabs.update(tabId, { url: currentUrl.href });
}
