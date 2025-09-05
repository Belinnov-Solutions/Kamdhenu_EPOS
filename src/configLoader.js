let appConfig = {
  API_BASE_URL: "", // fallback if fetch fails
};

export const loadConfig = async () => {
  const configUrl =
    // If your app is hosted under EPOSPORTAL on the same host:
    `${window.location.origin}/EPOSPORTAL/config.json?v=${Date.now()}`; 
    // ^ cache-buster so updates don’t get stuck in browser caches

  try {
    const res = await fetch(configUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    appConfig = { ...appConfig, ...data };
    console.log("Loaded config from IIS:", appConfig);
  } catch (err) {
    console.error("Failed to load IIS config.json:", err);
  }
};

export const getConfig = () => appConfig;
