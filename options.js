// options.js
document.addEventListener("DOMContentLoaded", async () => {
  siteData = await loadSiteDataFromStorage();
  renderTable();
});

function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      if (Object.keys(items.serverSwitchData).length === 0) {
        // If none stored, set defaults
        chrome.storage.sync.set({ serverSwitchData: window.defaultSiteData }, () => {
          resolve(window.defaultSiteData);
        });
      } else {
        resolve(items.serverSwitchData);
      }
    });
  });
}

const siteNameEl = document.getElementById("siteName");
const envNameEl = document.getElementById("envName");
const domainEl = document.getElementById("domain");
const orderEl = document.getElementById("order");
const addBtn = document.getElementById("addBtn");
const siteTableBody = document.querySelector("#siteTable tbody");

document.addEventListener("DOMContentLoaded", async () => {
  siteData = await loadSiteDataFromStorage();
  renderTable();
});

addBtn.addEventListener("click", () => {
  const siteName = siteNameEl.value.trim();
  const envName = envNameEl.value.trim();
  const domain = domainEl.value.trim();
  const orderVal = parseInt(orderEl.value, 10);

  if (!siteName || !envName || !domain) {
    alert("Please fill in Site Name, Environment, and Domain.");
    return;
  }

  // If the site doesn't exist yet, create it
  if (!siteData[siteName]) {
    siteData[siteName] = {};
  }

  siteData[siteName][envName] = {
    domain: domain,
    order: isNaN(orderVal) ? 0 : orderVal
  };

  // Save and refresh
  saveSiteDataToStorage(siteData).then(() => {
    siteNameEl.value = "";
    envNameEl.value = "";
    domainEl.value = "";
    orderEl.value = "";
    renderTable();
  });
});

/** Render the siteData in a table */
function renderTable() {
  siteTableBody.innerHTML = "";

  // siteData = { siteName -> { envName -> { domain, order } } }
  Object.entries(siteData).forEach(([siteName, envMap]) => {
    // Sort environments by order
    const sortedEnvs = Object.entries(envMap)
      .map(([envName, data]) => ({ envName, ...data }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Build table rows
    sortedEnvs.forEach(envObj => {
      const tr = document.createElement("tr");

      const tdSite = document.createElement("td");
      tdSite.textContent = siteName;
      tr.appendChild(tdSite);

      const tdEnv = document.createElement("td");
      tdEnv.textContent = envObj.envName;
      tr.appendChild(tdEnv);

      const tdDomain = document.createElement("td");
      tdDomain.textContent = envObj.domain;
      tr.appendChild(tdDomain);

      const tdOrder = document.createElement("td");
      tdOrder.textContent = envObj.order ?? 0;
      tr.appendChild(tdOrder);

      const tdAction = document.createElement("td");

      // Edit link
      const editLink = document.createElement("span");
      editLink.textContent = "Edit";
      editLink.classList.add("action-btn");
      editLink.addEventListener("click", () => {
        editEnvironment(siteName, envObj.envName);
      });
      tdAction.appendChild(editLink);

      // Separator
      const spacer = document.createElement("span");
      spacer.textContent = " | ";
      tdAction.appendChild(spacer);

      // Delete link
      const deleteLink = document.createElement("span");
      deleteLink.textContent = "Delete";
      deleteLink.classList.add("action-btn", "delete-btn");
      deleteLink.addEventListener("click", () => {
        deleteEnvironment(siteName, envObj.envName);
      });
      tdAction.appendChild(deleteLink);

      tr.appendChild(tdAction);

      siteTableBody.appendChild(tr);
    });
  });
}

/** Edit: populate form fields with existing data, then remove that line. */
function editEnvironment(siteName, envName) {
  const envObj = siteData[siteName][envName];
  if (!envObj) return;

  // Populate form
  siteNameEl.value = siteName;
  envNameEl.value = envName;
  domainEl.value = envObj.domain;
  orderEl.value = envObj.order;

  // Remove from data so user can re-submit
  delete siteData[siteName][envName];
  if (Object.keys(siteData[siteName]).length === 0) {
    delete siteData[siteName];
  }

  saveSiteDataToStorage(siteData).then(renderTable);
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

/** Load data from chrome.storage.sync or return defaults */
function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ serverSwitchData: {} }, items => {
      if (Object.keys(items.serverSwitchData).length === 0) {
        // If no data stored, set defaults
        chrome.storage.sync.set({ serverSwitchData: defaultSiteData }, () => {
          resolve(defaultSiteData);
        });
      } else {
        resolve(items.serverSwitchData);
      }
    });
  });
}