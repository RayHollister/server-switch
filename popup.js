document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    let url = new URL(tabs[0].url);
    let match = getSiteAndEnv(url.hostname);

    if (!match) {
      // Show "No multidev environments detected." in the header
      document.getElementById("header").textContent = "No multidev environments detected.";

      // Create "Add a multidev environment." link
      const envList = document.getElementById("env-list");
      const li = document.createElement("li");
      li.textContent = "Add a multidev environment.";
      li.style.color = "#0073ea";       // Make it look link-ish
      li.style.fontWeight = "bold";
      li.style.cursor = "pointer";

      // When clicked, open the options page
      li.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
      });

      envList.appendChild(li);
      return;
    }

    // Otherwise, the site is found in siteData. Show the normal environment list.
    document.getElementById("header").textContent = `Switch ${match.siteName} Server`;

    const envMap = siteData[match.siteName];
    const envList = document.getElementById("env-list");
    Object.keys(envMap).forEach(envName => {
      const li = document.createElement("li");
      li.textContent = envName;
      li.addEventListener("click", () => switchToEnvironment(envName, tabs[0].id, url));
      envList.appendChild(li);
    });
  });
});

function switchToEnvironment(envName, tabId, currentUrl) {
  let match = getSiteAndEnv(currentUrl.hostname);
  if (!match) return;

  let newHost = siteData[match.siteName][envName];
  if (!newHost) return;

  currentUrl.hostname = newHost;
  chrome.tabs.update(tabId, { url: currentUrl.href });
}
