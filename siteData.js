// siteData.js
// Single source of truth for environment mappings.

const siteData = {
  JaxToday: {
    LIVE: "jaxtoday.org",
    TEST: "test-jacksonville-today.pantheonsite.io",
    DEV: "dev-jacksonville-today.pantheonsite.io",
    UPDATES: "updates-jacksonville-today.pantheonsite.io"
  },
  WJCT: {
    LIVE: "wjct.org",
    TEST: "test-wjct.pantheonsite.io",
    DEV: "dev-wjct.pantheonsite.io",
    QUERY: "query-wjct.pantheonsite.io"
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

// Returns { siteName, envName } if found, or null if not.
function getSiteAndEnv(domain) {
  for (const [siteName, envMap] of Object.entries(siteData)) {
    for (const [envName, envDomain] of Object.entries(envMap)) {
      if (envDomain === domain) {
        return { siteName, envName };
      }
    }
  }
  return null;
}
