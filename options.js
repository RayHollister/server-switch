const siteNameEl = document.getElementById("siteName");
const envNameEl = document.getElementById("envName");
const domainEl = document.getElementById("domain");
const addBtn = document.getElementById("addBtn");
const siteTableBody = document.querySelector("#siteTable tbody");

let siteData = {}; // We'll load this from storage

document.addEventListener("DOMContentLoaded", async () => {
  siteData = await loadSiteDataFromStorage();
  renderTable();
});

addBtn.addEventListener("click", () => {
  const siteName = siteNameEl.value.trim();
  const envName = envNameEl.value.trim();
  const domain = domainEl.value.trim();

  if (!siteName || !envName || !domain) {
    alert("Please fill in all fields.");
    return;
  }

  // If the site doesn't exist yet, create it
  if (!siteData[siteName]) {
    siteData[siteName] = {};
  }

  // Assign the domain
  siteData[siteName][envName] = domain;

  // Save
  saveSiteDataToStorage(siteData).then(() => {
    // Clear inputs
    siteNameEl.value = "";
    envNameEl.value = "";
    domainEl.value = "";

    // Refresh the table
    renderTable();
  });
});

/** Render the siteData in a table */
function renderTable() {
  siteTableBody.innerHTML = "";

  Object.entries(siteData).forEach(([siteName, envMap]) => {
    Object.entries(envMap).forEach(([envName, domain]) => {
      const tr = document.createElement("tr");

      const tdSite = document.createElement("td");
      tdSite.textContent = siteName;
      tr.appendChild(tdSite);

      const tdEnv = document.createElement("td");
      tdEnv.textContent = envName;
      tr.appendChild(tdEnv);

      const tdDomain = document.createElement("td");
      tdDomain.textContent = domain;
      tr.appendChild(tdDomain);

      const tdAction = document.createElement("td");
      const deleteLink = document.createElement("span");
      deleteLink.textContent = "Delete";
      deleteLink.className = "delete-btn";
      deleteLink.addEventListener("click", () => {
        deleteEnvironment(siteName, envName);
      });
      tdAction.appendChild(deleteLink);
      tr.appendChild(tdAction);

      siteTableBody.appendChild(tr);
    });
  });
}

/** Delete a specific environment from siteData and save */
function deleteEnvironment(siteName, envName) {
  if (!siteData[siteName]) return;
  delete siteData[siteName][envName];

  // If the site has no more environments, remove the site
  if (Object.keys(siteData[siteName]).length === 0) {
    delete siteData[siteName];
  }

  saveSiteDataToStorage(siteData).then(renderTable);
}

/** Save updated data to chrome.storage.sync */
function saveSiteDataToStorage(data) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ serverSwitchData: data }, () => {
      resolve();
    });
  });
}

/** Load data from chrome.storage.sync or return {} */
function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      resolve(items.serverSwitchData);
    });
  });
}
